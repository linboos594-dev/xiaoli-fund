// 基金数据相关功能
// 这里可以添加真实的基金API调用

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
                dailyChange: realData.dailyChange
            };
        }
        return fund; // 保持原数据
    });
}

// 计算统计数据
function calculateFundStatistics(funds) {
    const totalAmount = funds.reduce((sum, fund) => sum + fund.holdingAmount, 0);
    const totalGain = funds.reduce((sum, fund) => sum + (fund.holdingAmount * fund.dailyChange / 100), 0);
    
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
    
    if (!fund.operationType) {
        errors.push('请选择操作类型');
    }
    
    if (fund.operationType === 'reduce' || fund.operationType === 'add') {
        if (!fund.operationAmount || fund.operationAmount <= 0) {
            errors.push('操作金额必须大于0');
        }
    }
    
    return {
        isValid: errors.length === 0,
        errors: errors
    };
}

// 生成操作记录
function generateOperationRecord(fund, operationType, operationAmount) {
    return {
        type: operationType,
        amount: operationAmount || 0,
        date: new Date().toISOString().split('T')[0], // YYYY-MM-DD格式
        timestamp: new Date().getTime()
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
    }
    
    return newAmount;
}