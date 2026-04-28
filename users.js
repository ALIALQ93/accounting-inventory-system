/**
 * Users Module - إدارة المستخدمين
 * نظام إدارة المستخدمين والصلاحيات الأساسية
 */

const UsersModule = {
    currentPage: 1,
    itemsPerPage: 10,
    allUsers: [],
    filteredUsers: [],
    editingUser: null,

    /**
     * Get HTML for users module
     */
    getHTML() {
        return `
            <section id="users" class="module-section">
                <div class="coming-soon">
                    <i class="fas fa-user-friends fa-4x text-muted"></i>
                    <h4>قسم المستخدمون</h4>
                    <p>سيتم إضافة هذا القسم قريباً</p>
                </div>
            </section>
        `;
    },

    /**
     * Render users HTML to DOM
     */
    render() {
        const contentArea = document.getElementById('content-area');
        if (contentArea) {
            contentArea.innerHTML = this.getHTML();
        }
    },

    /**
     * Load users module
     */
    async load() {
        console.log('👤 Loading users module...');
        this.render();
        console.log('✅ Users module loaded');
    },

    /**
     * Load users data (legacy - for future use)
     */
    async loadUsersDataLegacy() {
        try {
            console.log('👥 Loading users data...');
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Load users data
            await this.loadUsers();
            
            // Setup table
            this.renderTable();
            
            console.log('✅ Users data loaded successfully');
        } catch (error) {
            console.error('❌ Error loading users module:', error);
            this.showError('خطأ في تحميل المستخدمين');
        }
    },

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Add user button
        document.getElementById('addUserBtn').addEventListener('click', () => {
            this.showAddUserModal();
        });

        // Refresh button
        document.getElementById('refreshUsersBtn').addEventListener('click', () => {
            this.loadUsers();
        });

        // Add button to sync Firebase Auth users
        const syncUsersBtn = document.createElement('button');
        syncUsersBtn.className = 'btn btn-warning me-2';
        syncUsersBtn.innerHTML = '<i class="fas fa-sync-alt"></i> مزامنة المستخدمين';
        syncUsersBtn.addEventListener('click', () => this.syncFirebaseUsers());
        
        const headerActions = document.querySelector('.header-actions');
        if (headerActions) {
            headerActions.insertBefore(syncUsersBtn, headerActions.firstChild);
        }

        // Search
        document.getElementById('searchUsers').addEventListener('input', (e) => {
            this.filterUsers();
        });

        // Role filter
        document.getElementById('roleFilter').addEventListener('change', () => {
            this.filterUsers();
        });

        // Status filter
        document.getElementById('statusFilter').addEventListener('change', () => {
            this.filterUsers();
        });

        // Clear filters
        document.getElementById('clearUserFiltersBtn').addEventListener('click', () => {
            this.clearFilters();
        });

        // Save user button
        document.getElementById('saveUserBtn').addEventListener('click', () => {
            this.saveUser();
        });

        // User image preview
        document.getElementById('userImage').addEventListener('change', (e) => {
            this.previewUserImage(e);
        });
    },

    /**
     * Load users from Firebase
     */
    async loadUsers() {
        try {
            const usersSnapshot = await db.collection('USERS')
                .orderBy('createdAt', 'desc')
                .get();
            
            this.allUsers = [];
            usersSnapshot.forEach(doc => {
                this.allUsers.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            this.filteredUsers = [...this.allUsers];
            this.renderTable();
            
        } catch (error) {
            console.error('Error loading users:', error);
            this.showError('خطأ في تحميل المستخدمين من قاعدة البيانات');
        }
    },

    /**
     * Filter users based on search and filters
     */
    filterUsers() {
        const searchTerm = document.getElementById('searchUsers').value.toLowerCase();
        const roleFilter = document.getElementById('roleFilter').value;
        const statusFilter = document.getElementById('statusFilter').value;

        this.filteredUsers = this.allUsers.filter(user => {
            // Search filter
            const matchesSearch = !searchTerm || 
                user.name.toLowerCase().includes(searchTerm) ||
                user.email.toLowerCase().includes(searchTerm);

            // Role filter
            const matchesRole = !roleFilter || user.role === roleFilter;

            // Status filter
            const matchesStatus = !statusFilter || user.status === statusFilter;

            return matchesSearch && matchesRole && matchesStatus;
        });

        this.currentPage = 1;
        this.renderTable();
    },

    /**
     * Clear all filters
     */
    clearFilters() {
        document.getElementById('searchUsers').value = '';
        document.getElementById('roleFilter').value = '';
        document.getElementById('statusFilter').value = '';
        this.filterUsers();
    },

    /**
     * Render users table
     */
    renderTable() {
        const tbody = document.getElementById('usersTableBody');
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const pageUsers = this.filteredUsers.slice(startIndex, endIndex);

        tbody.innerHTML = '';

        if (pageUsers.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="9" class="text-center py-4">
                        <i class="fas fa-users fa-3x text-muted mb-3"></i>
                        <p class="text-muted">لا يوجد مستخدمون</p>
                        <button class="btn btn-primary" onclick="UsersModule.showAddUserModal()">
                            <i class="fas fa-user-plus"></i> إضافة مستخدم أول
                        </button>
                    </td>
                </tr>
            `;
            return;
        }

        pageUsers.forEach((user, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${startIndex + index + 1}</td>
                <td>
                    <img src="${user.image || 'https://via.placeholder.com/40x40?text=User'}" 
                         alt="${user.name}" class="product-image" style="width: 40px; height: 40px;">
                </td>
                <td>
                    <strong>${user.name}</strong>
                    ${user.phone ? `<br><small class="text-muted">${user.phone}</small>` : ''}
                </td>
                <td>${user.email}</td>
                <td>
                    <span class="badge ${this.getRoleBadgeClass(user.role)}">
                        ${this.getRoleName(user.role)}
                    </span>
                </td>
                <td>
                    <span class="status-badge ${this.getStatusClass(user.status)}">
                        ${this.getStatusText(user.status)}
                    </span>
                </td>
                <td>${this.formatDate(user.createdAt)}</td>
                <td>${this.formatDate(user.lastLogin)}</td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn btn-view" onclick="UsersModule.viewUser('${user.id}')" title="عرض">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="action-btn btn-edit" onclick="UsersModule.editUser('${user.id}')" title="تعديل">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn btn-delete" onclick="UsersModule.deleteUser('${user.id}')" title="حذف">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });

        this.renderPagination();
    },

    /**
     * Get role name in Arabic
     */
    getRoleName(role) {
        const roles = {
            'super_admin': 'مدير عام',
            'manager': 'مدير',
            'accountant': 'محاسب',
            'sales': 'موظف مبيعات',
            'warehouse': 'موظف مخزن'
        };
        return roles[role] || role;
    },

    /**
     * Get role badge class
     */
    getRoleBadgeClass(role) {
        const classes = {
            'super_admin': 'bg-danger',
            'manager': 'bg-primary',
            'accountant': 'bg-success',
            'sales': 'bg-info',
            'warehouse': 'bg-warning'
        };
        return classes[role] || 'bg-secondary';
    },

    /**
     * Get status class for styling
     */
    getStatusClass(status) {
        const classes = {
            'active': 'status-active',
            'inactive': 'status-inactive',
            'suspended': 'status-low-stock'
        };
        return classes[status] || 'status-inactive';
    },

    /**
     * Get status text in Arabic
     */
    getStatusText(status) {
        const statuses = {
            'active': 'نشط',
            'inactive': 'غير نشط',
            'suspended': 'معلق'
        };
        return statuses[status] || status;
    },

    /**
     * Format date
     */
    formatDate(date) {
        if (!date) return '-';
        const d = date.toDate ? date.toDate() : new Date(date);
        return d.toLocaleDateString('ar-IQ');
    },

    /**
     * Render pagination
     */
    renderPagination() {
        const totalPages = Math.ceil(this.filteredUsers.length / this.itemsPerPage);
        const pagination = document.getElementById('usersPagination');
        
        if (totalPages <= 1) {
            pagination.innerHTML = '';
            return;
        }

        let paginationHTML = '';

        // Previous button
        paginationHTML += `
            <li class="page-item ${this.currentPage === 1 ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="UsersModule.goToPage(${this.currentPage - 1})">
                    <i class="fas fa-chevron-right"></i>
                </a>
            </li>
        `;

        // Page numbers
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= this.currentPage - 2 && i <= this.currentPage + 2)) {
                paginationHTML += `
                    <li class="page-item ${i === this.currentPage ? 'active' : ''}">
                        <a class="page-link" href="#" onclick="UsersModule.goToPage(${i})">${i}</a>
                    </li>
                `;
            } else if (i === this.currentPage - 3 || i === this.currentPage + 3) {
                paginationHTML += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
            }
        }

        // Next button
        paginationHTML += `
            <li class="page-item ${this.currentPage === totalPages ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="UsersModule.goToPage(${this.currentPage + 1})">
                    <i class="fas fa-chevron-left"></i>
                </a>
            </li>
        `;

        pagination.innerHTML = paginationHTML;
    },

    /**
     * Go to specific page
     */
    goToPage(page) {
        const totalPages = Math.ceil(this.filteredUsers.length / this.itemsPerPage);
        if (page >= 1 && page <= totalPages) {
            this.currentPage = page;
            this.renderTable();
        }
    },

    /**
     * Show add user modal
     */
    showAddUserModal() {
        this.editingUser = null;
        document.getElementById('userModalTitle').textContent = 'إضافة مستخدم جديد';
        document.getElementById('userForm').reset();
        document.getElementById('userImagePreview').style.display = 'none';
        
        const modal = new bootstrap.Modal(document.getElementById('userModal'));
        modal.show();
    },

    /**
     * View user details
     */
    viewUser(userId) {
        const user = this.allUsers.find(u => u.id === userId);
        if (user) {
            Swal.fire({
                title: user.name,
                html: `
                    <div class="text-start">
                        <p><strong>البريد الإلكتروني:</strong> ${user.email}</p>
                        <p><strong>الدور:</strong> ${this.getRoleName(user.role)}</p>
                        <p><strong>رقم الهاتف:</strong> ${user.phone || 'غير محدد'}</p>
                        <p><strong>الحالة:</strong> ${this.getStatusText(user.status)}</p>
                        <p><strong>تاريخ الإضافة:</strong> ${this.formatDate(user.createdAt)}</p>
                        <p><strong>آخر دخول:</strong> ${this.formatDate(user.lastLogin) || 'لم يسجل دخول بعد'}</p>
                        ${user.notes ? `<p><strong>ملاحظات:</strong> ${user.notes}</p>` : ''}
                    </div>
                `,
                imageUrl: user.image || 'https://via.placeholder.com/300x300?text=User',
                imageWidth: 200,
                imageHeight: 200,
                imageAlt: user.name,
                confirmButtonText: 'حسناً'
            });
        }
    },

    /**
     * Edit user
     */
    editUser(userId) {
        const user = this.allUsers.find(u => u.id === userId);
        if (user) {
            this.editingUser = user;
            document.getElementById('userModalTitle').textContent = 'تعديل المستخدم';
            
            // Fill form with user data
            document.getElementById('userName').value = user.name;
            document.getElementById('userEmail').value = user.email;
            document.getElementById('userPassword').value = ''; // Don't show password
            document.getElementById('userRole').value = user.role;
            document.getElementById('userPhone').value = user.phone || '';
            document.getElementById('userStatus').value = user.status;
            document.getElementById('userNotes').value = user.notes || '';
            
            // Show current image if exists
            if (user.image) {
                document.getElementById('userPreviewImg').src = user.image;
                document.getElementById('userImagePreview').style.display = 'block';
            }
            
            const modal = new bootstrap.Modal(document.getElementById('userModal'));
            modal.show();
        }
    },

    /**
     * Delete user
     */
    async deleteUser(userId) {
        const user = this.allUsers.find(u => u.id === userId);
        if (user) {
            const result = await Swal.fire({
                title: 'هل أنت متأكد؟',
                text: `هل تريد حذف المستخدم "${user.name}"؟`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'نعم، احذف',
                cancelButtonText: 'إلغاء'
            });

            if (result.isConfirmed) {
                try {
                    // Delete from Firestore
                    await db.collection('USERS').doc(userId).delete();
                    
                    // Delete from Firebase Auth if firebaseUID exists
                    if (user.firebaseUID) {
                        // Note: This requires admin privileges in production
                        console.log('Would delete Firebase user:', user.firebaseUID);
                    }
                    
                    await this.loadUsers();
                    this.showSuccess('تم حذف المستخدم بنجاح');
                } catch (error) {
                    console.error('Error deleting user:', error);
                    this.showError('خطأ في حذف المستخدم');
                }
            }
        }
    },

    /**
     * Preview uploaded user image
     */
    previewUserImage(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                document.getElementById('userPreviewImg').src = e.target.result;
                document.getElementById('userImagePreview').style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
    },

    /**
     * Save user (add or edit)
     */
    async saveUser() {
        try {
            // Validate form
            if (!this.validateUserForm()) {
                return;
            }

            const formData = {
                name: document.getElementById('userName').value.trim(),
                email: document.getElementById('userEmail').value.trim(),
                role: document.getElementById('userRole').value,
                phone: document.getElementById('userPhone').value.trim(),
                status: document.getElementById('userStatus').value,
                notes: document.getElementById('userNotes').value.trim(),
                updatedAt: new Date()
            };

            // Handle image upload if exists
            const imageFile = document.getElementById('userImage').files[0];
            if (imageFile) {
                // For now, we'll use a placeholder. In production, upload to Firebase Storage
                formData.image = 'https://via.placeholder.com/200x200?text=User+Image';
            } else if (this.editingUser && this.editingUser.image) {
                formData.image = this.editingUser.image;
            }

            if (this.editingUser) {
                // Update existing user
                await db.collection('USERS').doc(this.editingUser.id).update(formData);
                this.showSuccess('تم تحديث المستخدم بنجاح');
            } else {
                // Add new user
                const password = document.getElementById('userPassword').value;
                formData.createdAt = new Date();
                formData.createdBy = auth.currentUser ? auth.currentUser.uid : 'system';
                
                // Create Firebase user first
                try {
                    const userCredential = await auth.createUserWithEmailAndPassword(formData.email, password);
                    formData.firebaseUID = userCredential.user.uid;
                    
                    // Add to Firestore
                    await db.collection('USERS').add(formData);
                    this.showSuccess('تم إضافة المستخدم بنجاح');
                    
                    // Sign out the new user (we don't want to stay logged in as them)
                    await auth.signOut();
                    // Re-sign in as the original user (this would need to be handled properly in production)
                    
                } catch (authError) {
                    console.error('Error creating Firebase user:', authError);
                    this.showError('خطأ في إنشاء حساب Firebase: ' + authError.message);
                    return;
                }
            }

            // Close modal and refresh data
            bootstrap.Modal.getInstance(document.getElementById('userModal')).hide();
            await this.loadUsers();

        } catch (error) {
            console.error('Error saving user:', error);
            this.showError('خطأ في حفظ المستخدم');
        }
    },

    /**
     * Validate user form
     */
    validateUserForm() {
        const requiredFields = [
            'userName',
            'userEmail',
            'userRole'
        ];

        // For new users, password is required
        if (!this.editingUser) {
            requiredFields.push('userPassword');
        }

        for (const fieldId of requiredFields) {
            const field = document.getElementById(fieldId);
            if (!field.value.trim()) {
                field.focus();
                this.showError(`يرجى ملء حقل ${field.previousElementSibling.textContent}`);
                return false;
            }
        }

        // Check if email is valid
        const email = document.getElementById('userEmail').value.trim();
        if (!this.isValidEmail(email)) {
            document.getElementById('userEmail').focus();
            this.showError('البريد الإلكتروني غير صحيح');
            return false;
        }

        // Check if email is unique (for new users)
        if (!this.editingUser) {
            const existingUser = this.allUsers.find(u => u.email === email);
            if (existingUser) {
                document.getElementById('userEmail').focus();
                this.showError('البريد الإلكتروني مستخدم مسبقاً');
                return false;
            }
        }

        // Check password strength for new users
        if (!this.editingUser) {
            const password = document.getElementById('userPassword').value;
            if (password.length < 6) {
                document.getElementById('userPassword').focus();
                this.showError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
                return false;
            }
        }

        return true;
    },

    /**
     * Validate email format
     */
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    /**
     * Show success message
     */
    showSuccess(message) {
        Swal.fire({
            title: 'نجح!',
            text: message,
            icon: 'success',
            confirmButtonText: 'حسناً',
            timer: 3000,
            timerProgressBar: true
        });
    },

    /**
     * Show error message
     */
    showError(message) {
        Swal.fire({
            title: 'خطأ!',
            text: message,
            icon: 'error',
            confirmButtonText: 'حسناً'
        });
    },

    /**
     * Sync Firebase Auth users with USERS collection
     */
    async syncFirebaseUsers() {
        try {
            const result = await Swal.fire({
                title: 'مزامنة المستخدمين',
                text: 'هل تريد إضافة جميع مستخدمي Firebase Authentication إلى قائمة المستخدمين؟',
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'نعم، مزامنة',
                cancelButtonText: 'إلغاء'
            });

            if (!result.isConfirmed) return;

            showLoading();

            // Get all users from USERS collection
            const existingUsers = await db.collection('USERS').get();
            const existingUIDs = new Set();
            
            existingUsers.forEach(doc => {
                const userData = doc.data();
                if (userData.firebaseUID) {
                    existingUIDs.add(userData.firebaseUID);
                }
            });

            // Note: In a real app, you'd need to use Firebase Admin SDK
            // to list all Firebase Auth users. For now, we'll add the current user
            const currentUser = auth.currentUser;
            if (currentUser && !existingUIDs.has(currentUser.uid)) {
                await db.collection('USERS').add({
                    name: currentUser.displayName || currentUser.email.split('@')[0],
                    email: currentUser.email,
                    role: 'manager',
                    status: 'active',
                    firebaseUID: currentUser.uid,
                    fullAccess: true,
                    createdAt: new Date(),
                    createdBy: 'system',
                    lastLogin: new Date()
                });
            }

            // Reload users
            await this.loadUsers();
            
            hideLoading();
            this.showSuccess('تم مزامنة المستخدمين بنجاح');

        } catch (error) {
            console.error('Error syncing users:', error);
            hideLoading();
            this.showError('خطأ في مزامنة المستخدمين');
        }
    }
};
