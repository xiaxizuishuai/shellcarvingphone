// 用户认证和地址管理模块

// 用户数据存储（使用 localStorage）
const UserStorage = {
  getUsers() {
    const users = localStorage.getItem('shellArtUsers');
    return users ? JSON.parse(users) : {};
  },

  saveUsers(users) {
    localStorage.setItem('shellArtUsers', JSON.stringify(users));
  },

  getCurrentUser() {
    const userId = localStorage.getItem('currentUserId');
    if (!userId) return null;
    const users = this.getUsers();
    return users[userId] || null;
  },

  setCurrentUser(userId) {
    localStorage.setItem('currentUserId', userId);
  },

  clearCurrentUser() {
    localStorage.removeItem('currentUserId');
  }
};

// 用户认证功能
const Auth = {
  register(userData) {
    const users = UserStorage.getUsers();

    // 检查邮箱是否已存在
    if (users[userData.email]) {
      throw new Error('该邮箱已被注册');
    }

    // 创建新用户
    const newUser = {
      id: Date.now().toString(),
      name: userData.name,
      email: userData.email,
      password: userData.password, // 实际应用中应该加密
      phone: userData.phone,
      addresses: [],
      createdAt: new Date().toISOString()
    };

    users[userData.email] = newUser;
    UserStorage.saveUsers(users);
    UserStorage.setCurrentUser(userData.email);

    return newUser;
  },

  login(username, password) {
    const users = UserStorage.getUsers();

    // 通过用户名查找用户
    const userList = Object.values(users);
    const user = userList.find(u => u.name === username);

    if (!user) {
      throw new Error('用户名或密码错误');
    }

    if (user.password !== password) {
      throw new Error('用户名或密码错误');
    }

    // 使用邮箱作为唯一标识存储
    UserStorage.setCurrentUser(user.email);
    return user;
  },

  logout() {
    UserStorage.clearCurrentUser();
    updateUI();
  }
};

// 地址管理功能
const AddressManager = {
  getAddresses() {
    const user = UserStorage.getCurrentUser();
    return user ? user.addresses || [] : [];
  },

  addAddress(addressData) {
    const user = UserStorage.getCurrentUser();
    if (!user) throw new Error('请先登录');

    const users = UserStorage.getUsers();
    const addresses = user.addresses || [];

    // 如果设为默认地址，取消其他默认地址
    if (addressData.isDefault) {
      addresses.forEach(addr => addr.isDefault = false);
    }

    const newAddress = {
      id: Date.now().toString(),
      name: addressData.name,
      phone: addressData.phone,
      region: addressData.region,
      detail: addressData.detail,
      isDefault: addressData.isDefault || false
    };

    addresses.push(newAddress);
    user.addresses = addresses;
    users[user.email] = user;
    UserStorage.saveUsers(users);

    return newAddress;
  },

  updateAddress(addressId, addressData) {
    const user = UserStorage.getCurrentUser();
    if (!user) throw new Error('请先登录');

    const users = UserStorage.getUsers();
    const addresses = user.addresses || [];
    const index = addresses.findIndex(addr => addr.id === addressId);

    if (index === -1) throw new Error('地址不存在');

    // 如果设为默认地址，取消其他默认地址
    if (addressData.isDefault) {
      addresses.forEach((addr, i) => {
        if (i !== index) addr.isDefault = false;
      });
    }

    addresses[index] = { ...addresses[index], ...addressData };
    user.addresses = addresses;
    users[user.email] = user;
    UserStorage.saveUsers(users);

    return addresses[index];
  },

  deleteAddress(addressId) {
    const user = UserStorage.getCurrentUser();
    if (!user) throw new Error('请先登录');

    const users = UserStorage.getUsers();
    const addresses = user.addresses || [];
    user.addresses = addresses.filter(addr => addr.id !== addressId);
    users[user.email] = user;
    UserStorage.saveUsers(users);
  }
};

// UI 更新函数
function updateUI() {
  const user = UserStorage.getCurrentUser();
  const userButtonText = document.getElementById('userButtonText');
  const drawerUserName = document.getElementById('drawerUserName');
  const drawerAuthBtn = document.getElementById('drawerAuthBtn');

  if (user) {
    if (userButtonText) userButtonText.textContent = user.name || '我的账户';
    if (drawerUserName) drawerUserName.textContent = user.name || '非遗体验官';
    if (drawerAuthBtn) drawerAuthBtn.textContent = '个人中心 / 退出登录';
    
    // 如果模态框已打开，切换到用户信息面板
    const modal = document.getElementById('userModal');
    if (modal && modal.getAttribute('aria-hidden') === 'false') {
      showUserInfoPanel();
    }
  } else {
    if (userButtonText) userButtonText.textContent = '登录/注册';
    if (drawerUserName) drawerUserName.textContent = '欢迎来到贝漾涌起';
    if (drawerAuthBtn) drawerAuthBtn.textContent = '点击登录 / 注册';

    // 如果模态框已打开，显示登录表单
    const modal = document.getElementById('userModal');
    if (modal && modal.getAttribute('aria-hidden') === 'false') {
      showLoginForm();
    }
  }
}

function showLoginForm() {
  document.getElementById('loginForm').classList.add('active');
  document.getElementById('registerForm').classList.remove('active');
  document.getElementById('userInfoPanel').classList.remove('active');
  document.getElementById('addressPanel').classList.remove('active');
  document.getElementById('addressFormPanel').classList.remove('active');
  document.getElementById('userModalTitle').textContent = '欢迎来到贝雕世界';
}

function showRegisterForm() {
  document.getElementById('loginForm').classList.remove('active');
  document.getElementById('registerForm').classList.add('active');
  document.getElementById('userInfoPanel').classList.remove('active');
  document.getElementById('addressPanel').classList.remove('active');
  document.getElementById('addressFormPanel').classList.remove('active');
  document.getElementById('userModalTitle').textContent = '注册新账户';
}

function showUserInfoPanel() {
  const user = UserStorage.getCurrentUser();
  if (!user) return;

  document.getElementById('loginForm').classList.remove('active');
  document.getElementById('registerForm').classList.remove('active');
  document.getElementById('userInfoPanel').classList.add('active');
  document.getElementById('addressPanel').classList.remove('active');
  document.getElementById('addressFormPanel').classList.remove('active');

  document.getElementById('userNameDisplay').textContent = user.name;
  document.getElementById('userEmailDisplay').textContent = user.email;
  document.getElementById('userModalTitle').textContent = '我的账户';
}

function showAddressPanel() {
  document.getElementById('userInfoPanel').classList.remove('active');
  document.getElementById('addressPanel').classList.add('active');
  document.getElementById('addressFormPanel').classList.remove('active');
  renderAddressList();
}

function showAddressForm(addressId = null) {
  document.getElementById('addressPanel').classList.remove('active');
  document.getElementById('addressFormPanel').classList.add('active');

  const form = document.getElementById('addressForm');
  const formTitle = document.getElementById('addressFormTitle');

  if (addressId) {
    formTitle.textContent = '编辑收货地址';
    const addresses = AddressManager.getAddresses();
    const address = addresses.find(addr => addr.id === addressId);
    if (address) {
      document.getElementById('addressName').value = address.name;
      document.getElementById('addressPhone').value = address.phone;
      document.getElementById('addressRegion').value = address.region;
      document.getElementById('addressDetail').value = address.detail;
      document.getElementById('addressDefault').checked = address.isDefault;
      form.dataset.editId = addressId;
    }
  } else {
    formTitle.textContent = '添加收货地址';
    form.reset();
    delete form.dataset.editId;
  }
}

function renderAddressList() {
  const addressList = document.getElementById('addressList');
  const addresses = AddressManager.getAddresses();

  if (addresses.length === 0) {
    addressList.innerHTML = '<div style="text-align: center; padding: 40px; color: var(--text-secondary);">暂无收货地址，请添加</div>';
    return;
  }

  addressList.innerHTML = addresses.map(address => `
    <div class="address-item ${address.isDefault ? 'default' : ''}">
      <div class="address-item-header">
        <div class="address-item-info">
          <h4>${address.name} ${address.phone}</h4>
          <p>${address.region}</p>
          <p>${address.detail}</p>
          ${address.isDefault ? '<span class="default-badge">默认地址</span>' : ''}
        </div>
        <div class="address-item-actions">
          <button class="btn-edit" onclick="showAddressForm('${address.id}')">编辑</button>
          <button class="btn-delete" onclick="deleteAddress('${address.id}')">删除</button>
        </div>
      </div>
    </div>
  `).join('');
}

function deleteAddress(addressId) {
  if (!confirm('确定要删除这个地址吗？')) return;

  try {
    AddressManager.deleteAddress(addressId);
    renderAddressList();
  } catch (error) {
    alert(error.message);
  }
}

// 模态框控制
function openUserModal() {
  console.log('openUserModal 被调用');
  const backdrop = document.getElementById('userBackdrop');
  const modal = document.getElementById('userModal');

  if (!backdrop) {
    console.error('userBackdrop 元素未找到');
    return;
  }

  if (!modal) {
    console.error('userModal 元素未找到');
    return;
  }

  console.log('显示模态框');
  backdrop.classList.add('visible');
  modal.classList.add('visible');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';

  // 确保显示登录表单
  const user = UserStorage.getCurrentUser();
  if (user) {
    showUserInfoPanel();
  } else {
    showLoginForm();
  }
}

function closeUserModal() {
  const backdrop = document.getElementById('userBackdrop');
  const modal = document.getElementById('userModal');

  if (!backdrop || !modal) {
    console.error('用户模态框元素未找到');
    return;
  }

  backdrop.classList.remove('visible');
  modal.classList.remove('visible');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

// 事件监听器初始化
document.addEventListener('DOMContentLoaded', () => {
  // 打开/关闭模态框
  const userToggle = document.getElementById('userToggle');
  if (userToggle) {
    userToggle.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log('点击了登录/注册按钮');
      openUserModal();
    });
  } else {
    console.error('未找到userToggle元素');
  }

  const userClose = document.getElementById('userClose');
  if (userClose) {
    userClose.addEventListener('click', closeUserModal);
  }
  document.getElementById('userBackdrop').addEventListener('click', (e) => {
    if (e.target.id === 'userBackdrop') {
      closeUserModal();
    }
  });

  // 表单切换
  document.getElementById('switchToRegister').addEventListener('click', showRegisterForm);
  document.getElementById('switchToLogin').addEventListener('click', showLoginForm);

  // 登录表单提交
  document.getElementById('loginFormElement').addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;

    if (!username) {
      alert('请输入用户名');
      return;
    }

    if (!password) {
      alert('请输入密码');
      return;
    }

    try {
      Auth.login(username, password);
      updateUI();
      // 延迟一下让用户看到成功提示，然后自动切换到用户信息面板
      setTimeout(() => {
        showUserInfoPanel();
      }, 100);
    } catch (error) {
      alert(error.message);
    }
  });

  // 注册表单提交
  document.getElementById('registerFormElement').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const phone = document.getElementById('registerPhone').value;

    try {
      Auth.register({ name, email, password, phone });
      updateUI();
      // 延迟一下让用户看到成功提示，然后自动切换到用户信息面板
      setTimeout(() => {
        showUserInfoPanel();
      }, 100);
    } catch (error) {
      alert(error.message);
    }
  });

  // 用户信息面板
  document.getElementById('manageAddressBtn').addEventListener('click', showAddressPanel);
  document.getElementById('logoutBtn').addEventListener('click', () => {
    if (confirm('确定要退出登录吗？')) {
      Auth.logout();
      closeUserModal();
    }
  });

  // 地址管理
  document.getElementById('backToUserInfo').addEventListener('click', showUserInfoPanel);
  document.getElementById('addAddressBtn').addEventListener('click', () => showAddressForm());
  document.getElementById('backToAddressList').addEventListener('click', showAddressPanel);
  document.getElementById('cancelAddressBtn').addEventListener('click', showAddressPanel);

  // 地址表单提交
  document.getElementById('addressForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const form = e.target;
    const addressData = {
      name: document.getElementById('addressName').value,
      phone: document.getElementById('addressPhone').value,
      region: document.getElementById('addressRegion').value,
      detail: document.getElementById('addressDetail').value,
      isDefault: document.getElementById('addressDefault').checked
    };

    try {
      if (form.dataset.editId) {
        AddressManager.updateAddress(form.dataset.editId, addressData);
        alert('地址更新成功！');
      } else {
        AddressManager.addAddress(addressData);
        alert('地址添加成功！');
      }
      showAddressPanel();
    } catch (error) {
      alert(error.message);
    }
  });

  // 编辑资料（占位功能）
  document.getElementById('editProfileBtn').addEventListener('click', () => {
    alert('编辑资料功能开发中...');
  });

  // 初始化UI
  updateUI();

  // ESC键关闭模态框
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const backdrop = document.getElementById('userBackdrop');
      if (backdrop.classList.contains('visible')) {
        closeUserModal();
      }
    }
  });
});

