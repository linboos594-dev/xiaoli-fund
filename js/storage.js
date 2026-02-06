// 数据存储管理 - 修复版本
const STORAGE_KEY = 'xiaoli_funds_data';

// 获取基金数据 - 同步版本（供main.js调用）
function getFundsData() {
    try {
        console.log('getFundsData called');
        
        // 从本地存储获取数据
        const data = localStorage.getItem(STORAGE_KEY);
        
        if (data) {
            const funds = JSON.parse(data);
            console.log('从本地存储获取到数据，数量:', funds.length);
            return funds;
        } else {
            // 如果没有数据，使用模拟数据
            console.log('本地无数据，使用模拟数据');
            const mockFunds = getMockFunds();
            localStorage.setItem(STORAGE_KEY, JSON.stringify(mockFunds));
            return mockFunds;
        }
    } catch (error) {
        console.error('getFundsData失败:', error);
        // 返回模拟数据作为后备
        return getMockFunds();
    }
}

// 异步版本的getFundsData（保持兼容性）
async function getFundsDataAsync() {
    return getFundsData();
}

// 模拟基金数据
function getMockFunds() {
    return [
        {
            id: '1',
            code: '000001',
            name: '华夏人工智能ETF',
            sector: '人工智能',
            holdingAmount: 50000,
            netValue: '2.3784',
            dailyChange: 0.95,
            operations: [
                { type: 'add', amount: 10000, date: '2024-02-01' },
                { type: 'add', amount: 5000, date: '2024-02-03' }
            ]
        },
        {
            id: '2',
            code: '161028',
            name: '富国新能源汽车',
            sector: '新能源',
            holdingAmount: 35000,
            netValue: '2.1560',
            dailyChange: 2.45,
            operations: [
                { type: 'add', amount: 10000, date: '2024-01-20' }
            ]
        },
        {
            id: '3',
            code: '161725',
            name: '招商中证白酒',
            sector: '白酒',
            holdingAmount: 20000,
            netValue: '0.9820',
            dailyChange: 2.15,
            operations: [
                { type: 'add', amount: 5000, date: '2024-02-04' }
            ]
        }
    ];
}

// 保存基金数据
function saveFundsData(funds) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(funds));
        console.log('数据保存成功，数量:', funds.length);
        return true;
    } catch (error) {
        console.error('保存数据失败:', error);
        return false;
    }
}

// 添加新基金
function addFund(fund) {
    const funds = getFundsData();
    fund.id = Date.now().toString();
    funds.push(fund);
    return saveFundsData(funds);
}

// 更新基金
function updateFund(updatedFund) {
    const funds = getFundsData();
    const index = funds.findIndex(f => f.id === updatedFund.id);
    
    if (index !== -1) {
        funds[index] = updatedFund;
        return saveFundsData(funds);
    }
    return false;
}

// 删除基金
function deleteFund(fundId) {
    const funds = getFundsData();
    const newFunds = funds.filter(f => f.id !== fundId);
    return saveFundsData(newFunds);
}

// 获取单个基金
function getFundById(fundId) {
    const funds = getFundsData();
    return funds.find(f => f.id === fundId);
}

// 导出数据
function exportData() {
    const funds = getFundsData();
    return JSON.stringify(funds, null, 2);
}

// 导入数据
function importData(jsonData) {
    try {
        const funds = JSON.parse(jsonData);
        return saveFundsData(funds);
    } catch (error) {
        console.error('导入数据失败:', error);
        return false;
    }
}

// 兼容性函数
function getLocalFunds() {
    return getFundsData();
}

function saveLocalFunds(funds) {
    return saveFundsData(funds);
}

function saveFundData(fund) {
    return addFund(fund);
}