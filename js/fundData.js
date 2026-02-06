// 基金数据相关功能
// 这里可以添加真实的基金API调用

// 存储基金数据的变量
let allFundsData = [];
let isDataLoaded = false;

// 模拟基金API（实际使用时需要替换为真实API）
async function fetchFundRealTimeData(fundCode) {
    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // 模拟返回数据
    const baseValue = 1 + (parseInt(fundCode) % 1000) / 10000;
    const randomChange = (Math.random() * 4 - 2).toFixed(2);
    const netValue = (baseValue * (1 + randomChange / 100)).toFixed(4);
    
    return {
        code: fundCode,
        name: `基金${fundCode}`,
        netValue: netValue,
        dailyChange: parseFloat(randomChange),
        updateTime: new Date().toISOString()
    };
}

// 批量获取基金数据
async function batchFetchFundData(fundCodes) {
    const results = [];
    
    for (const code of fundCodes) {
        try {
            const data = await fetchFundRealTimeData(code);
            results.push(data);
        } catch (error) {
            console.error(`获取基金${code}数据失败:`, error);
            // 添加错误占位符
            results.push({
                code: code,
                name: `基金${code}`,
                netValue: '0.0000',
                dailyChange: 0,
                updateTime: new Date().toISOString(),
                error: true
            });
        }
    }
    
    return results;
}

// 获取所有基金的实时数据
async function getAllFundsRealTimeData(funds) {
    const fundCodes = funds.map(f => f.code);
    const realTimeData = await batchFetchFundData(fundCodes);
    
    // 合并数据
    return funds.map(fund => {
        const realData = realTimeData.find(d => d.code === fund.code);
        if (realData && !realData.error) {
            return {
                ...fund,
                netValue: realData.netValue,
                dailyChange: realData.dailyChange,
                lastUpdate: new Date().toISOString()
            };
        }
        return {
            ...fund,
            netValue: fund.netValue || '1.0000',
            dailyChange: fund.dailyChange || 0,
            lastUpdate: fund.lastUpdate || new Date().toISOString()
        };
    });
}

// 计算统计数据
function calculateFundStatistics(funds) {
    const totalAmount = funds.reduce((sum, fund) => sum + fund.holdingAmount, 0);
    const totalGain = funds.reduce((sum, fund) => {
        const dailyChange = fund.dailyChange || 0;
        return sum + (fund.holdingAmount * dailyChange / 100);
    }, 0);
    
    return {
        totalAmount: totalAmount,
        totalGain: totalGain,
        totalChange: totalAmount > 0 ? (totalGain / totalAmount * 100) : 0,
        fundCount: funds.length
    };
}

// 数据验证
function validateFundData(fund) {
    const errors = [];
    
    if (!fund.code || fund.code.trim() === '') {
        errors.push('基金代码不能为空');
    }
    
    if (!fund.name || fund.name.trim() === '') {
        errors.push('基金名称不能为空');
    }
    
    if (!fund.holdingAmount || fund.holdingAmount <= 0) {
        errors.push('持仓金额必须大于0');
    }
    
    if (!fund.sector || fund.sector.trim() === '') {
        errors.push('所属板块不能为空');
    }
    
    // 验证操作类型和操作金额
    if (fund.operationType) {
        if (fund.operationType === 'reduce' || fund.operationType === 'add') {
            if (!fund.operationAmount || fund.operationAmount <= 0) {
                errors.push('操作金额必须大于0');
            }
        }
    }
    
    return {
        isValid: errors.length === 0,
        errors: errors
    };
}

// 生成操作记录
function generateOperationRecord(fund, operationType, operationAmount) {
    const operationTypes = {
        'add': '加仓',
        'reduce': '减仓',
        'clear': '清仓'
    };
    
    return {
        type: operationType,
        typeText: operationTypes[operationType] || '其他',
        amount: operationAmount || 0,
        date: new Date().toISOString().split('T')[0], // YYYY-MM-DD格式
        time: new Date().toLocaleTimeString('zh-CN'),
        timestamp: new Date().getTime(),
        previousAmount: fund.holdingAmount
    };
}

// 更新持仓金额
function updateHoldingAmount(fund, operationType, operationAmount) {
    let newAmount = fund.holdingAmount;
    
    switch(operationType) {
        case 'add':
            newAmount += operationAmount;
            break;
        case 'reduce':
            newAmount = Math.max(0, newAmount - operationAmount);
            break;
        case 'clear':
            newAmount = 0;
            break;
        default:
            // 如果是新增基金，直接使用传入的持仓金额
            newAmount = fund.holdingAmount;
    }
    
    return newAmount;
}

// 保存基金数据（新增或更新）
async function saveFundData(fundData) {
    try {
        // 验证数据
        const validation = validateFundData(fundData);
        if (!validation.isValid) {
            showNotification('验证失败', validation.errors.join('<br>'), 'error');
            return false;
        }
        
        // 检查是否已存在相同基金代码的记录
        const existingIndex = allFundsData.findIndex(f => f.code === fundData.code);
        
        // 处理操作记录
        let operationRecords = [];
        if (existingIndex >= 0) {
            // 更新现有基金
            const existingFund = allFundsData[existingIndex];
            
            // 如果有操作类型，生成操作记录
            if (fundData.operationType && fundData.operationType !== 'none') {
                const operationRecord = generateOperationRecord(
                    existingFund, 
                    fundData.operationType, 
                    fundData.operationAmount
                );
                
                // 更新持仓金额
                const newAmount = updateHoldingAmount(existingFund, fundData.operationType, fundData.operationAmount);
                fundData.holdingAmount = newAmount;
                
                // 合并操作记录
                operationRecords = [...(existingFund.operationRecords || []), operationRecord];
            }
            
            // 更新基金信息
            allFundsData[existingIndex] = {
                ...existingFund,
                name: fundData.name,
                sector: fundData.sector,
                holdingAmount: fundData.holdingAmount,
                netValue: fundData.netValue || existingFund.netValue || '1.0000',
                operationRecords: operationRecords,
                lastUpdated: new Date().toISOString()
            };
            
            showNotification('更新成功', `基金 ${fundData.code} 信息已更新`, 'success');
        } else {
            // 新增基金
            const newFund = {
                code: fundData.code,
                name: fundData.name,
                sector: fundData.sector,
                holdingAmount: fundData.holdingAmount,
                netValue: fundData.netValue || '1.0000',
                dailyChange: 0,
                operationRecords: [],
                createdDate: new Date().toISOString(),
                lastUpdated: new Date().toISOString()
            };
            
            // 如果有操作类型，生成操作记录
            if (fundData.operationType && fundData.operationType === 'add') {
                const operationRecord = generateOperationRecord(
                    newFund, 
                    'add', 
                    fundData.operationAmount
                );
                newFund.operationRecords.push(operationRecord);
            }
            
            allFundsData.push(newFund);
            showNotification('添加成功', `基金 ${fundData.code} 已添加到持仓`, 'success');
        }
        
        // 保存到本地存储（模拟数据库）
        saveToLocalStorage();
        
        // 刷新基金列表显示
        await refreshFundList();
        
        // 清空表单
        clearFundForm();
        
        return true;
    } catch (error) {
        console.error('保存基金数据失败:', error);
        showNotification('保存失败', '保存过程中出现错误，请重试', 'error');
        return false;
    }
}

// 保存数据到本地存储（模拟后端数据库）
function saveToLocalStorage() {
    try {
        localStorage.setItem('fundPortfolioData', JSON.stringify(allFundsData));
    } catch (error) {
        console.error('保存到本地存储失败:', error);
    }
}

// 从本地存储加载数据（模拟从数据库加载）
function loadFromLocalStorage() {
    try {
        const savedData = localStorage.getItem('fundPortfolioData');
        if (savedData) {
            allFundsData = JSON.parse(savedData);
            isDataLoaded = true;
            return allFundsData;
        }
    } catch (error) {
        console.error('从本地存储加载数据失败:', error);
    }
    return [];
}

// 刷新基金列表显示
async function refreshFundList() {
    try {
        // 获取最新的实时数据
        const fundsWithRealTimeData = await getAllFundsRealTimeData(allFundsData);
        
        // 更新全局数据
        allFundsData = fundsWithRealTimeData;
        
        // 更新UI显示
        updateFundListUI(allFundsData);
        
        // 更新统计数据
        updateStatisticsUI();
        
        return true;
    } catch (error) {
        console.error('刷新基金列表失败:', error);
        // 即使获取实时数据失败，也显示已有数据
        updateFundListUI(allFundsData);
        return false;
    }
}

// 更新基金列表UI（需要在前端HTML中实现此函数）
function updateFundListUI(funds) {
    // 这里需要根据你的HTML结构实现UI更新
    // 示例代码，需要根据实际HTML结构调整
    const tableBody = document.querySelector('#fund-table tbody');
    if (!tableBody) {
        console.error('找不到基金列表表格');
        return;
    }
    
    // 清空现有行
    tableBody.innerHTML = '';
    
    // 添加新行
    funds.forEach(fund => {
        const row = document.createElement('tr');
        
        // 格式化持仓金额
        const formattedAmount = formatCurrency(fund.holdingAmount);
        
        // 格式化当日涨幅（带颜色）
        const changeClass = fund.dailyChange >= 0 ? 'positive' : 'negative';
        const changeSymbol = fund.dailyChange >= 0 ? '+' : '';
        const formattedChange = `${changeSymbol}${fund.dailyChange ? fund.dailyChange.toFixed(2) : '0.00'}%`;
        
        // 操作记录显示
        const lastOperation = fund.operationRecords && fund.operationRecords.length > 0 
            ? fund.operationRecords[fund.operationRecords.length - 1]
            : null;
        const operationText = lastOperation 
            ? `${lastOperation.typeText} ${formatCurrency(lastOperation.amount)}` 
            : '无记录';
        
        row.innerHTML = `
            <td>${fund.code}</td>
            <td>${fund.name}</td>
            <td>${fund.sector || '未分类'}</td>
            <td>${formattedAmount}</td>
            <td>${fund.netValue || '0.0000'}</td>
            <td class="${changeClass}">${formattedChange}</td>
            <td>${operationText}</td>
            <td>
                <button onclick="editFund('${fund.code}')" class="btn-edit">编辑</button>
                <button onclick="deleteFund('${fund.code}')" class="btn-delete">删除</button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
}

// 更新统计数据UI
function updateStatisticsUI() {
    const stats = calculateFundStatistics(allFundsData);
    
    // 这里需要根据你的HTML结构实现统计数据更新
    // 示例：查找并更新统计信息显示元素
    const statElements = {
        totalAmount: document.getElementById('total-amount'),
        totalGain: document.getElementById('total-gain'),
        totalChange: document.getElementById('total-change'),
        fundCount: document.getElementById('fund-count')
    };
    
    for (const [key, element] of Object.entries(statElements)) {
        if (element) {
            if (key === 'totalAmount' || key === 'totalGain') {
                element.textContent = formatCurrency(stats[key]);
            } else if (key === 'totalChange') {
                element.textContent = stats[key].toFixed(2) + '%';
                element.className = stats[key] >= 0 ? 'positive' : 'negative';
            } else {
                element.textContent = stats[key];
            }
        }
    }
}

// 格式化货币显示
function formatCurrency(amount) {
    return '¥' + amount.toLocaleString('zh-CN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

// 显示通知消息
function showNotification(title, message, type = 'info') {
    // 创建通知元素
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-title">${title}</div>
        <div class="notification-message">${message}</div>
    `;
    
    // 添加到页面
    const container = document.getElementById('notification-container') || createNotificationContainer();
    container.appendChild(notification);
    
    // 3秒后自动移除
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// 创建通知容器（如果不存在）
function createNotificationContainer() {
    const container = document.createElement('div');
    container.id = 'notification-container';
    container.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 1000;
        max-width: 300px;
    `;
    document.body.appendChild(container);
    return container;
}

// 清空基金表单
function clearFundForm() {
    // 这里需要根据你的表单ID进行调整
    const formElements = {
        'fund-code': '',
        'fund-name': '',
        'holding-amount': '',
        'fund-sector': '',
        'operation-type': 'none',
        'operation-amount': '',
        'operation-date': new Date().toISOString().split('T')[0],
        'net-value': ''
    };
    
    for (const [id, value] of Object.entries(formElements)) {
        const element = document.getElementById(id);
        if (element) {
            if (element.type === 'select-one') {
                element.value = value;
            } else {
                element.value = value;
            }
        }
    }
    
    // 隐藏操作金额输入框（如果默认不是减仓/清仓）
    const operationAmountDiv = document.getElementById('operation-amount-container');
    if (operationAmountDiv) {
        operationAmountDiv.style.display = 'none';
    }
}

// 编辑基金
function editFund(fundCode) {
    const fund = allFundsData.find(f => f.code === fundCode);
    if (!fund) {
        showNotification('错误', '未找到该基金', 'error');
        return;
    }
    
    // 填充表单
    document.getElementById('fund-code').value = fund.code;
    document.getElementById('fund-name').value = fund.name;
    document.getElementById('holding-amount').value = fund.holdingAmount;
    document.getElementById('fund-sector').value = fund.sector || '';
    
    // 滚动到表单
    const formElement = document.querySelector('.fund-form-container');
    if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth' });
    }
    
    showNotification('编辑模式', `正在编辑基金 ${fund.code}`, 'info');
}

// 删除基金
async function deleteFund(fundCode) {
    if (!confirm(`确定要删除基金 ${fundCode} 吗？`)) {
        return;
    }
    
    try {
        const index = allFundsData.findIndex(f => f.code === fundCode);
        if (index >= 0) {
            allFundsData.splice(index, 1);
            saveToLocalStorage();
            await refreshFundList();
            showNotification('删除成功', `基金 ${fundCode} 已删除`, 'success');
        }
    } catch (error) {
        console.error('删除基金失败:', error);
        showNotification('删除失败', '删除过程中出现错误', 'error');
    }
}

// 初始化加载数据
async function initializeFundData() {
    try {
        // 显示加载状态
        const loadingElement = document.querySelector('.loading-state');
        if (loadingElement) {
            loadingElement.style.display = 'block';
        }
        
        // 从本地存储加载数据
        loadFromLocalStorage();
        
        // 如果没有任何数据，添加一些示例数据
        if (allFundsData.length === 0) {
            allFundsData = [
                {
                    code: '000001',
                    name: '华夏人工智能ETF',
                    sector: '科技',
                    holdingAmount: 15000,
                    netValue: '1.2567',
                    dailyChange: 1.25,
                    operationRecords: [],
                    createdDate: new Date().toISOString(),
                    lastUpdated: new Date().toISOString()
                },
                {
                    code: '000002',
                    name: '易方达消费行业',
                    sector: '消费',
                    holdingAmount: 20000,
                    netValue: '2.3456',
                    dailyChange: -0.56,
                    operationRecords: [],
                    createdDate: new Date().toISOString(),
                    lastUpdated: new Date().toISOString()
                }
            ];
            saveToLocalStorage();
        }
        
        // 刷新列表显示
        await refreshFundList();
        
        // 隐藏加载状态
        if (loadingElement) {
            loadingElement.style.display = 'none';
        }
        
        showNotification('加载完成', `已加载 ${allFundsData.length} 只基金`, 'success');
        
    } catch (error) {
        console.error('初始化基金数据失败:', error);
        showNotification('加载失败', '初始化数据时出现错误', 'error');
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    // 初始化数据
    initializeFundData();
    
    // 绑定保存按钮事件（根据你的HTML结构调整选择器）
    const saveButton = document.getElementById('save-fund-button') || 
                       document.querySelector('button[onclick*="save"]') ||
                       document.querySelector('button.btn-save');
    
    if (saveButton) {
        saveButton.addEventListener('click', async function() {
            // 收集表单数据
            const fundData = {
                code: document.getElementById('fund-code')?.value || '',
                name: document.getElementById('fund-name')?.value || '',
                holdingAmount: parseFloat(document.getElementById('holding-amount')?.value || 0),
                sector: document.getElementById('fund-sector')?.value || '',
                operationType: document.getElementById('operation-type')?.value || 'none',
                operationAmount: parseFloat(document.getElementById('operation-amount')?.value || 0),
                netValue: document.getElementById('net-value')?.value || ''
            };
            
            // 保存数据
            await saveFundData(fundData);
        });
    }
    
    // 绑定操作类型变更事件
    const operationTypeSelect = document.getElementById('operation-type');
    if (operationTypeSelect) {
        operationTypeSelect.addEventListener('change', function() {
            const operationAmountDiv = document.getElementById('operation-amount-container');
            if (operationAmountDiv) {
                if (this.value === 'add' || this.value === 'reduce') {
                    operationAmountDiv.style.display = 'block';
                } else {
                    operationAmountDiv.style.display = 'none';
                }
            }
        });
    }
});

// 导出函数供全局使用
window.fundDataManager = {
    saveFundData,
    refreshFundList,
    editFund,
    deleteFund,
    initializeFundData,
    getAllFunds: () => allFundsData,
    getStatistics: () => calculateFundStatistics(allFundsData)
};