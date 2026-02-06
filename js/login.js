// 登录页面逻辑
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');

    // 检查是否已经登录
    checkLoginStatus();

    // 表单提交事件
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        attemptLogin();
    });

    // 输入框变化时清除错误信息
    usernameInput.addEventListener('input', clearError);
    passwordInput.addEventListener('input', clearError);

    // 自动填充演示账号（可选功能）
    autoFillDemoAccount();
});

// 检查登录状态
function checkLoginStatus() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const loginTime = localStorage.getItem('loginTime');
    
    if (isLoggedIn && loginTime) {
        // 检查是否在30分钟内（保持登录状态）
        const currentTime = new Date().getTime();
        const loginDuration = currentTime - parseInt(loginTime);
        const thirtyMinutes = 30 * 60 * 1000; // 30分钟
        
        if (loginDuration < thirtyMinutes) {
            // 自动跳转到后台
            window.location.href = 'admin.html';
            return;
        } else {
            // 登录已过期
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('loginTime');
        }
    }
}

// 尝试登录
function attemptLogin() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const errorMessage = document.getElementById('errorMessage');

    // 验证账号密码
    if (username === 'admin' && password === '998515') {
        // 登录成功
        loginSuccess();
    } else {
        // 登录失败
        loginFailed();
    }
}

// 登录成功
function loginSuccess() {
    // 保存登录状态
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('loginTime', new Date().getTime());
    
    // 显示成功消息
    showMessage('登录成功！正在跳转到后台...', 'success');
    
    // 延迟跳转，让用户看到成功消息
    setTimeout(function() {
        window.location.href = 'admin.html';
    }, 1500);
}

// 登录失败
function loginFailed() {
    const form = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');
    const passwordInput = document.getElementById('password');
    
    // 显示错误消息
    showMessage('账号或密码错误，请重试', 'error');
    
    // 清空密码框
    passwordInput.value = '';
    passwordInput.focus();
    
    // 添加抖动效果
    form.classList.add('shake');
    setTimeout(() => {
        form.classList.remove('shake');
    }, 500);
}

// 显示消息
function showMessage(text, type) {
    const errorMessage = document.getElementById('errorMessage');
    
    errorMessage.textContent = text;
    errorMessage.style.display = 'block';
    
    // 根据类型设置颜色
    if (type === 'error') {
        errorMessage.style.color = '#ff4757';
        errorMessage.style.background = '#fff5f5';
    } else if (type === 'success') {
        errorMessage.style.color = '#00b894';
        errorMessage.style.background = '#d4f8e8';
    }
    
    // 3秒后自动隐藏
    setTimeout(() => {
        errorMessage.style.display = 'none';
    }, 3000);
}

// 清除错误信息
function clearError() {
    const errorMessage = document.getElementById('errorMessage');
    errorMessage.style.display = 'none';
}

// 自动填充演示账号（方便测试）
function autoFillDemoAccount() {
    // 如果URL中有demo参数，自动填充
    if (window.location.search.includes('demo')) {
        document.getElementById('username').value = 'admin';
        document.getElementById('password').value = '998515';
    }
    
    // 或者如果本地存储中有记住账号的选项
    const rememberUsername = localStorage.getItem('rememberUsername');
    if (rememberUsername) {
        document.getElementById('username').value = rememberUsername;
    }
}

// 记住用户名（可选功能）
function rememberUsername(username) {
    localStorage.setItem('rememberUsername', username);
}