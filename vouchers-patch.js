/**
 * vouchers-patch.js
 * إصلاحات حرجة لوحدة السندات - تُحمّل بعد vouchers.js
 *
 * الإصلاحات:
 * 1. رقم السند الذري (Firestore Transaction) - يمنع التكرار عند التزامن
 * 2. بناء بيانات القيد بدون كتابة (buildGeneralEntryData)
 * 3. التحقق من وجود الحسابات قبل الحفظ + الحساب المقابل حساب نهائي
 * 4. حفظ السند والقيد ذرياً (Firestore Batch) - يمنع الأيتام
 */

(function patchVouchersModule() {
    if (typeof VouchersModule === 'undefined') {
        console.error('❌ Patch: VouchersModule غير موجود - لم يُطبَّق الـ patch');
        return;
    }

    // ================================================================
    // إصلاح 1: توليد رقم السند بـ Firestore Transaction
    // يمنع تكرار الأرقام عند فتح مستخدمَين سنداً في نفس الوقت
    // ================================================================
    VouchersModule.generateNextVoucherNumber = async function(type) {
        const defaultPrefixes = { receipt: 'RV', payment: 'PV', journal: 'JV', entry: 'EV' };
        let prefix = defaultPrefixes[type] || 'VOU';

        try {
            const settingsDoc = await db.collection('settings').doc(`vouchers_${type}`).get();
            if (settingsDoc.exists) {
                const s = settingsDoc.data();
                if (type === 'receipt' && s.receiptPrefix) prefix = s.receiptPrefix;
                else if (type === 'payment' && s.paymentPrefix) prefix = s.paymentPrefix;
                else if (type === 'journal' && s.journalPrefix) prefix = s.journalPrefix;
                else if (type === 'entry' && s.entryPrefix) prefix = s.entryPrefix;
            }
        } catch (e) { /* استخدام البادئة الافتراضية */ }

        const year = new Date().getFullYear();
        const counterRef = db.collection('settings').doc(`voucher_counter_${type}_${year}`);

        let nextNum = 1;
        await db.runTransaction(async (tx) => {
            const counterDoc = await tx.get(counterRef);
            if (counterDoc.exists) {
                nextNum = (counterDoc.data().count || 0) + 1;
            } else {
                // أول استخدام لهذه السنة - ابدأ من 1
                nextNum = 1;
            }
            tx.set(counterRef, { count: nextNum }, { merge: true });
        });

        return `${prefix}${year}${String(nextNum).padStart(4, '0')}`;
    };

    // ================================================================
    // إصلاح 2: بناء بيانات القيد بدون كتابة إلى Firestore
    // يُستخدم داخل batch الكتابة الذرية
    // ================================================================
    VouchersModule.buildGeneralEntryData = async function(voucherId, voucherData) {
        const generalEntries = [];
        const mainCurrency = voucherData.mainCurrency || voucherData.currency || 'IQD';

        if (voucherData.type === 'receipt') {
            const entries = await this.processReceiptPaymentEntries(
                voucherData.entries, voucherData, mainCurrency, true
            );
            generalEntries.push(...entries);

        } else if (voucherData.type === 'payment') {
            const entries = await this.processReceiptPaymentEntries(
                voucherData.entries, voucherData, mainCurrency, false
            );
            generalEntries.push(...entries);

        } else if (voucherData.type === 'journal') {
            const entries = await this.processJournalEntries(
                voucherData.entries, voucherData, mainCurrency
            );
            generalEntries.push(...entries);

        } else if (voucherData.type === 'entry') {
            for (const entry of voucherData.entries) {
                const entryDebit  = parseFloat(entry.debit  || 0);
                const entryCredit = parseFloat(entry.credit || 0);
                const entryCurrency = entry.currency || mainCurrency;

                const debitInMain  = entryDebit  > 0 ? await this.convertCurrency(entryDebit,  entryCurrency, mainCurrency) : 0;
                const creditInMain = entryCredit > 0 ? await this.convertCurrency(entryCredit, entryCurrency, mainCurrency) : 0;

                const finalCostCenterId   = entry.costCenterId   || voucherData.costCenterId   || null;
                const finalCostCenterName = entry.costCenterName || voucherData.costCenterName || null;

                generalEntries.push({
                    accountId:        entry.accountId,
                    accountCode:      entry.accountCode,
                    accountName:      entry.accountName,
                    debit:            debitInMain,
                    credit:           creditInMain,
                    description:      entry.description || '',
                    costCenterId:     finalCostCenterId,
                    costCenterName:   finalCostCenterName,
                    currency:         mainCurrency,
                    originalCurrency: entryCurrency,
                    exchangeRate:     await this.getExchangeRate(entryCurrency, mainCurrency),
                    originalDebit:    entryDebit,
                    originalCredit:   entryCredit
                });
            }
        }

        // التحقق من توازن القيد
        const totalDebit  = generalEntries.reduce((s, e) => s + (parseFloat(e.debit)  || 0), 0);
        const totalCredit = generalEntries.reduce((s, e) => s + (parseFloat(e.credit) || 0), 0);
        const diff = Math.abs(totalDebit - totalCredit);

        let finalDebit = totalDebit, finalCredit = totalCredit;
        if (diff > 0.01) {
            const rd = Math.round(totalDebit  * 100) / 100;
            const rc = Math.round(totalCredit * 100) / 100;
            if (Math.abs(rd - rc) <= 0.01) {
                finalDebit = rd; finalCredit = rc;
            } else {
                throw new Error(`القيد غير متوازن! مدين: ${totalDebit.toFixed(2)}، دائن: ${totalCredit.toFixed(2)}`);
            }
        }

        return {
            voucherId,
            voucherNumber: voucherData.voucherNumber,
            voucherType:   voucherData.type,
            date:          voucherData.date,
            entries:       generalEntries,
            totalDebit:    finalDebit,
            totalCredit:   finalCredit,
            mainCurrency,
            isBalanced:    Math.abs(finalDebit - finalCredit) < 0.01,
            status:        'posted',
            createdAt:     firebase.firestore.FieldValue.serverTimestamp(),
            createdBy:     firebase.auth().currentUser?.uid || 'unknown'
        };
    };

    // ================================================================
    // إصلاح 3: التحقق من وجود الحسابات قبل الحفظ
    // يمنع القيود اليتيمة التي تشير لحسابات محذوفة
    // يتحقق أيضاً أن الحساب المقابل حساب نهائي وليس رئيسياً
    // ================================================================
    VouchersModule._validateAccounts = async function(entries, contraAccountId) {
        const ids = [...new Set(entries.map(e => e.accountId).filter(Boolean))];
        if (contraAccountId) ids.push(contraAccountId);
        if (ids.length === 0) return;

        await ChartOfAccountsModule.getAccounts();
        const missing = ids.filter(id => !ChartOfAccountsModule.getAccountById(id));
        if (missing.length > 0) {
            throw new Error('بعض الحسابات المختارة غير موجودة في دليل الحسابات. يرجى تحديث الصفحة والمحاولة مجدداً.');
        }

        if (contraAccountId) {
            const contraAccount = ChartOfAccountsModule.getAccountById(contraAccountId);
            if (contraAccount && contraAccount.isParentAccount) {
                throw new Error('الحساب المقابل يجب أن يكون حساباً نهائياً - لا يمكن استخدام الحسابات الرئيسية في السندات.');
            }
        }
    };

    // ================================================================
    // إصلاح 4: إعادة كتابة createGeneralEntry باستخدام buildGeneralEntryData
    // ================================================================
    VouchersModule.createGeneralEntry = async function(voucherId, voucherData) {
        try {
            const data = await this.buildGeneralEntryData(voucherId, voucherData);
            const docRef = await db.collection('generalEntries').add(data);
            console.log('✅ General entry created:', docRef.id);
            return docRef.id;
        } catch (error) {
            console.error('❌ Error creating general entry:', error);
            throw error;
        }
    };

    // ================================================================
    // إصلاح 5: حفظ السند والقيد ذرياً بـ Firestore Batch
    // إذا فشل إنشاء القيد → يُلغى حفظ السند أيضاً (لا أيتام)
    // ================================================================
    VouchersModule.performSave = async function() {
        try {
            // --- قراءة قيم النموذج ---
            const type            = document.getElementById('voucherType').value;
            const voucherNumber   = document.getElementById('voucherNumber').value.trim();
            const date            = document.getElementById('voucherDate').value;
            const contraAccountId = document.getElementById('voucherContraAccount').value;
            const status          = document.getElementById('voucherStatus').value;
            const mainCurrency    = document.getElementById('voucherMainCurrency').value;
            const contraAccountName = document.getElementById('voucherContraAccount').dataset.accountName;
            const contraAccountCode = document.getElementById('voucherContraAccount').dataset.accountCode;

            // --- التحقق الأساسي ---
            if (!voucherNumber || !date) {
                this.showError('يرجى ملء الحقول المطلوبة (رقم السند، التاريخ)');
                return;
            }
            if ((type === 'receipt' || type === 'payment' || type === 'journal') && !contraAccountId) {
                this.showError('الحساب المقابل إلزامي لسندات القبض والصرف واليومية');
                return;
            }
            if (!mainCurrency) {
                this.showError('يرجى اختيار العملة الرئيسية للسند');
                return;
            }

            // --- مركز الكلفة ---
            const costCenterId = document.getElementById('voucherCostCenter').value;
            let costCenterName = null;
            if (costCenterId) {
                const ccSel = document.getElementById('voucherCostCenter');
                costCenterName = ccSel.options[ccSel.selectedIndex].dataset.ccName;
            }
            if ((this.voucherSettings?.costCenterRequired) && !costCenterId) {
                this.showError('مركز الكلفة إلزامي لهذا النوع من السندات');
                return;
            }

            // --- جمع السطور ---
            const tbody = document.getElementById('voucherEntriesBody');
            const rows  = tbody ? tbody.querySelectorAll('tr') : [];
            if (rows.length === 0) {
                this.showError('يرجى إضافة سطر واحد على الأقل في التفاصيل');
                return;
            }

            let hasValid = false;
            rows.forEach(row => {
                const aid    = row.querySelector('.entry-account-id')?.value;
                const credit = parseFloat(row.querySelector('.entry-credit')?.value || 0);
                const debit  = parseFloat(row.querySelector('.entry-debit')?.value  || 0);
                if (aid && (credit > 0 || debit > 0)) hasValid = true;
            });
            if (!hasValid) {
                this.showError('يرجى إدخال حساب ومبلغ صحيح في الأقل في سطر واحد');
                return;
            }

            const entries = [];
            for (let idx = 0; idx < rows.length; idx++) {
                const row = rows[idx];
                const accountId = row.querySelector('.entry-account-id').value;
                if (!accountId) continue;

                const accountCode   = row.querySelector('.entry-code').value;
                const accountName   = row.dataset.accountName;
                const description   = row.querySelector('.entry-description').value.trim();
                const currency      = row.querySelector('.entry-currency').value;
                const ccSel         = row.querySelector('.entry-costCenter');
                let   entryCCId     = ccSel?.value || '';
                let   entryCCName   = null;

                if (!entryCCId && costCenterId) {
                    entryCCId   = costCenterId;
                    entryCCName = costCenterName;
                } else if (entryCCId && ccSel) {
                    entryCCName = ccSel.options[ccSel.selectedIndex].dataset.ccName;
                }

                let debit = 0, credit = 0, receipt = '', localAmount = 0, exchangeRate = 1;

                if (type === 'journal') {
                    debit  = parseFloat(row.querySelector('.entry-debit')?.value)  || 0;
                    credit = parseFloat(row.querySelector('.entry-credit')?.value) || 0;
                    if (!accountId || (debit === 0 && credit === 0))
                        throw new Error(`السطر ${idx + 1}: يرجى اختيار الحساب وإدخال مبلغ في المدين أو الدائن`);
                    if (debit > 0 && credit > 0)
                        throw new Error(`السطر ${idx + 1}: لا يمكن إدخال مبلغ في المدين والدائن معاً`);
                    localAmount = debit || credit;
                } else {
                    credit  = parseFloat(row.querySelector('.entry-credit')?.value) || 0;
                    const ri = row.querySelector('.entry-receipt');
                    receipt  = ri ? ri.value.trim() : '';
                    localAmount = credit;
                    if (!accountId || credit <= 0)
                        throw new Error(`السطر ${idx + 1}: يرجى اختيار الحساب وإدخال مبلغ صحيح`);
                }

                const eri = row.querySelector('.entry-exchange-rate');
                if (eri?.value) { const v = parseFloat(eri.value); if (!isNaN(v) && v > 0) exchangeRate = v; }

                const lai = row.querySelector('.entry-local-amount');
                if (lai?.value?.trim()) {
                    const v = parseFloat(lai.value);
                    if (!isNaN(v)) localAmount = v;
                } else if (currency !== mainCurrency && (debit || credit) > 0) {
                    try { localAmount = await this.convertCurrency(debit || credit, currency, mainCurrency); }
                    catch (e) { /* يبقى localAmount = المبلغ الأصلي */ }
                }

                entries.push({
                    accountId, accountCode, accountName, debit, credit, description, currency,
                    costCenterId: entryCCId || null, costCenterName: entryCCName,
                    receipt: receipt || null, exchangeRate, localAmount
                });
            }

            // --- إصلاح 3: التحقق من الحسابات ---
            await this._validateAccounts(entries, contraAccountId);

            // --- التحقق من توازن سند القيد ---
            if (type === 'entry') {
                let td = 0, tc = 0;
                entries.forEach(e => { td += parseFloat(e.debit || 0); tc += parseFloat(e.credit || 0); });
                if (Math.abs(td - tc) > 0.01)
                    throw new Error(`سند القيد غير متوازن! المدين (${td.toFixed(2)}) ≠ الدائن (${tc.toFixed(2)})`);
            }

            // --- حساب المجموع (متوازٍ) ---
            const convertedTotals = await Promise.all(
                entries.map(e => {
                    const amt = (type === 'journal' || type === 'entry') ? e.debit : e.credit;
                    return this.convertCurrency(amt, e.currency, mainCurrency);
                })
            );
            const totalAmount = convertedTotals.reduce((s, v) => s + v, 0);

            showLoading();

            // --- عملة الحساب المقابل ---
            let contraAccountCurrency = null;
            if (contraAccountId) {
                try {
                    await ChartOfAccountsModule.getAccounts();
                    const contraAcc = ChartOfAccountsModule.getAccountById(contraAccountId);
                    if (contraAcc) {
                        contraAccountCurrency = contraAcc.currency || 'IQD';
                        if (!contraAcc.currency) {
                            const cs = await db.collection('currencies')
                                .where('isBaseCurrency', '==', true).limit(1).get();
                            if (!cs.empty) contraAccountCurrency = cs.docs[0].data().code || 'IQD';
                        }
                    }
                } catch (e) { contraAccountCurrency = 'IQD'; }
            }

            // --- بناء بيانات السند ---
            const formData = {
                type, voucherNumber, date, mainCurrency,
                costCenterId: costCenterId || null, costCenterName,
                entries, totalAmount, currency: mainCurrency, status,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };
            if (type === 'receipt' || type === 'payment' || type === 'journal') {
                Object.assign(formData, {
                    contraAccountId, contraAccountName,
                    contraAccountCode, contraAccountCurrency
                });
            }

            // ========================================================
            // إصلاح 4: كتابة ذرية (Batch) - السند + القيد معاً
            // إما ينجحان معاً أو يفشلان معاً
            // ========================================================
            if (this.editingVoucher) {
                const oldStatus = this.editingVoucher.status;
                const newStatus = status;

                if (oldStatus === 'posted' || newStatus === 'posted') {
                    const msg = oldStatus === 'posted'
                        ? '<p>هذا السند <strong>مرحّل</strong>. التعديل سيحدث القيد العام المرتبط.</p><p>هل تريد المتابعة؟</p>'
                        : '<p>سيتم ترحيل هذا السند وإنشاء قيد محاسبي.</p><p>هل تريد المتابعة؟</p>';
                    const confirmed = await Swal.fire({
                        title: '⚠️ تأكيد العملية', html: msg, icon: 'warning',
                        showCancelButton: true, confirmButtonText: 'نعم، احفظ',
                        cancelButtonText: 'إلغاء', confirmButtonColor: '#3085d6', cancelButtonColor: '#d33'
                    });
                    if (!confirmed.isConfirmed) { hideLoading(); return; }
                }

                const batch      = db.batch();
                const voucherRef = db.collection('vouchers').doc(this.editingVoucher.id);
                batch.update(voucherRef, formData);

                if (newStatus === 'posted') {
                    const entryData = await this.buildGeneralEntryData(this.editingVoucher.id, formData);
                    const snap      = await db.collection('generalEntries')
                        .where('voucherId', '==', this.editingVoucher.id).limit(1).get();
                    if (!snap.empty) {
                        // تحديث القيد الموجود
                        batch.update(snap.docs[0].ref, { ...entryData, updatedAt: firebase.firestore.FieldValue.serverTimestamp() });
                    } else {
                        // إنشاء قيد جديد (ترحيل من مسودة)
                        batch.set(db.collection('generalEntries').doc(), entryData);
                    }
                }

                await batch.commit();
                this.showSuccess('تم تحديث السند بنجاح');

            } else {
                formData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
                formData.createdBy = firebase.auth().currentUser?.uid || 'unknown';

                const batch      = db.batch();
                const voucherRef = db.collection('vouchers').doc(); // pre-generate ID
                batch.set(voucherRef, formData);

                if (status === 'posted') {
                    const entryData = await this.buildGeneralEntryData(voucherRef.id, formData);
                    batch.set(db.collection('generalEntries').doc(), entryData);
                }

                await batch.commit();
                this.showSuccess('تم إضافة السند بنجاح');
            }

            hideLoading();
            bootstrap.Modal.getInstance(document.getElementById('voucherModal')).hide();
            await this.loadVouchers();

        } catch (error) {
            hideLoading();
            console.error('❌ Error in performSave:', error);
            throw error;
        }
    };

    console.log('✅ VouchersModule patches applied:');
    console.log('   1. رقم السند الذري (Firestore Transaction)');
    console.log('   2. buildGeneralEntryData - بناء القيد بدون كتابة');
    console.log('   3. التحقق من وجود الحسابات + الحساب المقابل نهائي');
    console.log('   4. حفظ ذري للسند والقيد (Firestore Batch)');

})();
