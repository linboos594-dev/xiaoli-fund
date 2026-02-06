// 后台管理逻辑
document.addEventListener('DOMContentLoaded', function() {
    // 检查登录状态
    checkAdminLogin();
    
    // 初始化
    initAdmin();
    
    // 绑定事件
    bindEvents();
});

// 检查管理员登录状态
function checkAdminLogin() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const loginTime = localStorage.getItem('loginTime');
    
    if (!isLoggedIn || !loginTime) {
        window.location.href = 'login.html';
        return;
    }
    
    // 检查登录是否过期（30分钟）
    const currentTime = new Date().getTime();
    const loginDuration = currentTime - parseInt(loginTime);
    const thirtyMinutes = 30 * 60 * 1000;
    
    if (loginDuration > thirtyMinutes) {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('loginTime');
        window.location.href = 'login.html';
    }
}

// 初始化
function initAdmin() {
    loadFundsTable();
    setCurrentDate();
    
    // 设置自动刷新（每60秒）
    setInterval(loadFundsTable, 60000);
}

// 绑定事件
function bindEvents() {
    // 表单提交
    document.getElementById('fundForm').addEventListener('submit', handleFormSubmit);
    
    // 重置按钮
    document.getElementById('resetBtn').addEventListener('click', resetForm);
    
    // 退出登录
    document.getElementById('logoutBtn').addEventListener('click', logout);
    
    // 数据管理
    document.getElementById('exportBtn').addEventListener('click', exportData);
    document.getElementById('importBtn').addEventListener('click', triggerImport);
    document.getElementById('importFile').addEventListener('change', handleFileImport);
    document.getElementById('clearAllBtn').addEventListener('click', confirmClearAll);
}

// 加载基金表格
async function loadFundsTable() {
    try {
        const funds = await getFundsData();
        renderFundsTable(funds);
    } catch (error) {
        console.error('加载基金表格失败:', error);
        showMessage('加载数据失败', 'error');
    }
}

// 渲染基金表格
function renderFundsTable(funds) {
    const tbody = document.getElementById('fundsTableBody');
    
    if (!funds || funds.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center">
                    暂无基金数据，请添加第一只基金
                </td>
            </tr>
        `;
        return;
    }
    
    let html = '';
    
    funds.forEach(fund => {
        const changeClass = fund.dailyChange >= 0 ? 'change-positive' : 'change-negative';
        const changeSymbol = fund.dailyChange >= 0 ? '+' : '';
        const operationCount = fund.operations ? fund.operations.length : 0;
        
        html += `
            <tr data-id="${fund.id}">
                <td>${fund.code}</td>
                <td>
                    <strong>${fund.name}</strong>
                    <br>
                    <small class="text-muted">ID: ${fund.id}</small>
                </td>
                <td>¥${fund.holdingAmount.toFixed(2)}</td>
                <td>${fund.netValue}</td>
                <td class="${changeClass}">
                    ${changeSymbol}${fund.dailyChange.toFixed(2)}%
                </td>
                <td>
                    <span class="badge">${operationCount} 次操作</span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn edit-btn" onclick="editFund('${fund.id}')">
                            <i class="fas fa-edit"></i> 编辑
                        </button>
                        <button class="action-btn delete-btn" onclick="deleteFund('${fund.id}')">
                            <i class="fas fa-trash"></i> 删除
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
}

// 处理表单提交
function handleFormSubmit(e) {
    e.preventDefault();
    
    // 收集表单数据
    const fundData = {
        id: document.getElementById('editId').value,
        code: document.getElementById('fundCode').value.trim(),
        name: document.getElementById('fundName').value.trim(),
        holdingAmount: parseFloat(document.getElementById('holdingAmount').value),
        operationType: document.getElementById('operationType').value,
        operationAmount: document.getElementById('operationAmount').value ? 
                        parseFloat(document.getElementById('operationAmount').value) : 0,
        operationDate: document.getElementById('operationDate').value || 
                       new Date().toISOString().split('T')[0]
    };
    
    // 验证数据
    const validation = validateFundData(fundData);
    if (!validation.isValid) {
        showMessage(validation.errors.join('<br>'), 'error');
        return;
    }
    
    // 生成操作记录
    const operationRecord = generateOperationRecord(
        fundData, 
        fundData.operationType, 
        fundData.operationAmount
    );
    
    // 获取现有基金数据（如果是编辑）
    let existingFund = null;
    if (fundData.id) {
        existingFund = getFundById(fundData.id);
    }
    
    // 构建完整的基金对象
    const completeFund = {
        id: fundData.id || Date.now().toString(),
        code: fundData.code,
        name: fundData.name,
        holdingAmount: fundData.holdingAmount,
        netValue: existingFund ? existingFund.netValue : '1.0000',
        dailyChange: existingFund ? existingFund.dailyChange : 0,
        operations: existingFund ? 
            [...existingFund.operations, operationRecord] : 
            [operationRecord]
    };
    
    // 保存数据
    saveFundData(completeFund).then(result => {
        if (result.success) {
            showMessage('保存成功！', 'success');
            resetForm();
            loadFundsTable();
        } else {
            showMessage('保存失败: ' + result.error, 'error');
        }
    });
}

// 编辑基金
function editFund(fundId) {
    const fund = getFundById(fundId);
    if (!fund) {
        showMessage('找不到基金数据', 'error');
        return;
    }
    
    // 填充表单
    document.getElementById('editId').value = fund.id;
    document.getElementById('fundCode').value = fund.code;
    document.getElementById('fundName').value = fund.name;
    document.getElementById('holdingAmount').value = fund.holdingAmount;
    
    // 默认选择加仓操作
    document.getElementById('operationType').value = 'add';
    document.getElementById('operationAmount').value = '';
    document.getElementById('operationDate').value = new Date().toISOString().split('T')[0];
    
    // 滚动到表单
    document.getElementById('fundForm').scrollIntoView({ behavior: 'smooth' });
    
    showMessage(`正在编辑: ${fund.name}`, 'warning');
}

// 删除基金
function deleteFund(fundId) {
    if (confirm('确定要删除这只基金吗？此操作不可撤销。')) {
        if (deleteFundFromStorage(fundId)) {
            showMessage('删除成功！', 'success');
            loadFundsTable();
        } else {
            showMessage('删除失败', 'error');
        }
    }
}

// 从存储中删除基金
function deleteFundFromStorage(fundId) {
    return deleteFund(fundId);
}

// 重置表单
function resetForm() {
    document.getElementById('fundForm').reset();
    document.getElementById('editId').value = '';
    document.getElementById('operationDate').value = new Date().toISOString().split('T')[0];
}

// 退出登录
function logout() {
    if (confirm('确定要退出登录吗？')) {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('loginTime');
        window.location.href = 'login.html';
    }
}

// 导出数据
function exportData() {
    const funds = getLocalFunds();
    if (!funds || funds.length === 0) {
        showMessage('没有数据可导出', 'warning');
        return;
    }
    
    const dataStr = JSON.stringify(funds, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `小李基金数据_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showMessage('数据导出成功！', 'success');
}

// 触发导入
function triggerImport() {
    document.getElementById('importFile').click();
}

// 处理文件导入
function handleFileImport(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.name.endsWith('.json')) {
        showMessage('请选择JSON格式的文件', 'error');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(event) {
        try {
            const data = JSON.parse(event.target.result);
            if (Array.isArray(data)) {
                // 清空现有数据
                localStorage.removeItem(STORAGE_KEY);
                
                // 保存导入的数据
                data.forEach(fund => {
                    saveFundData(fund);
                });
                
                showMessage('数据导入成功！', 'success');
                loadFundsTable();
            } else {
                showMessage('文件格式不正确', 'error');
            }
        } catch (error) {
            showMessage('解析文件失败: ' + error.message, 'error');
        }
    };
    
    reader.readAsText(file);
    
    // 清空文件输入
    e.target.value = '';
}

// 确认清空所有数据
function confirmClearAll() {
    if (confirm('⚠️ 警告：这将删除所有基金数据，操作不可撤销！\n\n确定要清空所有数据吗？')) {
        if (confirm('再次确认：你真的要删除所有数据吗？')) {
            clearAllData();
        }
    }
}

// 清空所有数据
function clearAllData() {
    localStorage.removeItem(STORAGE_KEY);
    showMessage('所有数据已清空', 'warning');
    loadFundsTable();
}

// 设置当前日期
function setCurrentDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('operationDate').value = today;
}

// 显示消息
function showMessage(text, type) {
    // 移除现有消息
    const existingMessage = document.querySelector('.message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // 创建新消息
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 
                          type === 'error' ? 'exclamation-circle' : 
                          'exclamation-triangle'}"></i>
        ${text}
    `;
    
    // 插入到第一个section前
    const firstSection = document.querySelector('.admin-section');
    firstSection.parentNode.insertBefore(messageDiv, firstSection);
    
    // 显示消息
    messageDiv.style.display = 'block';
    
    // 3秒后自动隐藏（错误消息停留更久）
    const duration = type === 'error' ? 5000 : 3000;
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.style.opacity = '0';
            messageDiv.style.transition = 'opacity 0.3s';
            setTimeout(() => {
                if (messageDiv.parentNode) {
                    messageDiv.parentNode.removeChild(messageDiv);
                }
            }, 300);
        }
    }, duration);
}

// 从 storage.js 获取的函数
function getLocalFunds() {
    return window.getLocalFunds ? window.getLocalFunds() : [];
}

function saveFundData(fund) {
    return window.saveFundData ? window.saveFundData(fund) : Promise.resolve({ success: false });
}

function getFundById(fundId) {
    return window.getFundById ? window.getFundById(fundId) : null;
}

function validateFundData(fund) {
    return window.validateFundData ? window.validateFundData(fund) : { isValid: true, errors: [] };
}

function generateOperationRecord(fund, type, amount) {
    return window.generateOperationRecord ? 
        window.generateOperationRecord(fund, type, amount) : 
        { type: type, amount: amount, date: new Date().toISOString() };
}