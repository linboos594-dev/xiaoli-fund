// 基金板块映射（根据你的列表）
const sectorIcons = {
    // 科技类
    '人工智能': 'fas fa-robot',
    'AI应用': 'fas fa-brain',
    '大科技': 'fas fa-laptop-code',
    '半导体': 'fas fa-microchip',
    '储存芯片': 'fas fa-memory',
    'CPO': 'fas fa-bolt',
    '云计算': 'fas fa-cloud',
    '通信': 'fas fa-satellite',
    '消费电子': 'fas fa-mobile-alt',
    '机器人': 'fas fa-robot',
    '脑机接口': 'fas fa-project-diagram',
    '金融科技': 'fas fa-coins',
    
    // 新能源类
    '新能源': 'fas fa-bolt',
    '储能': 'fas fa-battery-full',
    '固态电池': 'fas fa-car-battery',
    '光伏': 'fas fa-solar-panel',
    '绿色电力': 'fas fa-leaf',
    '电网设备': 'fas fa-plug',
    '可控核聚变': 'fas fa-atom',
    
    // 材料资源类
    '稀土永磁': 'fas fa-magnet',
    '有色金属': 'fas fa-gem',
    '化工': 'fas fa-flask',
    '油气资源': 'fas fa-gas-pump',
    '煤炭': 'fas fa-mountain',
    '钢铁': 'fas fa-hard-hat',
    '黄金': 'fas fa-gem',
    '黄金股': 'fas fa-money-bill-wave',
    
    // 制造类
    '先进制造': 'fas fa-industry',
    '家用电器': 'fas fa-tv',
    
    // 医药健康类
    '医药': 'fas fa-heartbeat',
    '医疗': 'fas fa-stethoscope',
    '创新药': 'fas fa-pills',
    '养老产业': 'fas fa-user-md',
    
    // 消费类
    '消费': 'fas fa-shopping-cart',
    '白酒': 'fas fa-wine-glass-alt',
    '沪港深消费': 'fas fa-shopping-bag',
    
    // 金融类
    '银行': 'fas fa-university',
    '证券保险': 'fas fa-chart-line',
    '可转债': 'fas fa-exchange-alt',
    '债基': 'fas fa-hand-holding-usd',
    '混债': 'fas fa-blender',
    '现金流': 'fas fa-money-bill-wave',
    
    // 红利类
    '红利': 'fas fa-money-bill-wave',
    '红利低波': 'fas fa-chart-line',
    '港股红利': 'fas fa-hong-kong-sign',
    
    // 指数类
    '创业板': 'fas fa-chart-bar',
    '科创板': 'fas fa-microchip',
    '中证500': 'fas fa-chart-line',
    '双创50': 'fas fa-rocket',
    '恒生': 'fas fa-hong-kong-sign',
    '恒生科技': 'fas fa-laptop-code',
    '标普': 'fas fa-globe-americas',
    
    // 量化类
    '量化': 'fas fa-calculator',
    '小微盘量化': 'fas fa-chart-pie',
    '微盘股': 'fas fa-chart-line',
    
    // 其他
    '农林渔牧': 'fas fa-tractor',
    '传媒游戏': 'fas fa-gamepad',
    '基建': 'fas fa-hard-hat',
    '交通运输': 'fas fa-truck',
    '房地产': 'fas fa-building',
    '商业航天': 'fas fa-rocket',
    '北证': 'fas fa-flag',
    '亚太': 'fas fa-globe-asia',
    '军工': 'fas fa-shield-alt',
    '海外基金': 'fas fa-plane',
    '海外医药': 'fas fa-plane-medical'
};

// 基金名称到板块的智能匹配规则
const sectorRules = [
    // 科技类
    { keywords: ['人工智能', 'AI', '智能', '机器人', '机器'], sector: '人工智能' },
    { keywords: ['AI应用', '应用AI', 'AI+'], sector: 'AI应用' },
    { keywords: ['半导体', '芯片', '集成电路'], sector: '半导体' },
    { keywords: ['储存芯片', '存储芯片', '存储器'], sector: '储存芯片' },
    { keywords: ['CPO', '光电共封装'], sector: 'CPO' },
    { keywords: ['云计算', '云服务', '云平台'], sector: '云计算' },
    { keywords: ['通信', '5G', '6G', '光通信'], sector: '通信' },
    { keywords: ['消费电子', '手机', '平板', '耳机', '可穿戴'], sector: '消费电子' },
    { keywords: ['机器人', '机器', '自动化'], sector: '机器人' },
    { keywords: ['脑机接口', '脑机'], sector: '脑机接口' },
    { keywords: ['金融科技', 'FinTech', '数字金融'], sector: '金融科技' },
    
    // 新能源类
    { keywords: ['新能源', '清洁能源'], sector: '新能源' },
    { keywords: ['储能', '电池储能', '电化学储能'], sector: '储能' },
    { keywords: ['固态电池', '固态'], sector: '固态电池' },
    { keywords: ['光伏', '太阳能', '光伏发电'], sector: '光伏' },
    { keywords: ['绿色电力', '绿电', '可再生能源'], sector: '绿色电力' },
    { keywords: ['电网设备', '电力设备', '输变电'], sector: '电网设备' },
    { keywords: ['可控核聚变', '核聚变'], sector: '可控核聚变' },
    
    // 材料资源类
    { keywords: ['稀土', '永磁', '稀土永磁'], sector: '稀土永磁' },
    { keywords: ['有色金属', '铜', '铝', '锌', '铅'], sector: '有色金属' },
    { keywords: ['化工', '化学', '石化'], sector: '化工' },
    { keywords: ['油气', '石油', '天然气'], sector: '油气资源' },
    { keywords: ['煤炭', '煤矿', '煤炭开采'], sector: '煤炭' },
    { keywords: ['钢铁', '钢材', '黑色金属'], sector: '钢铁' },
    { keywords: ['黄金', '金矿'], sector: '黄金' },
    
    // 医药健康类
    { keywords: ['医药', '制药', '药业'], sector: '医药' },
    { keywords: ['医疗', '医疗器械', '医疗服务'], sector: '医疗' },
    { keywords: ['创新药', '生物药', '靶向药'], sector: '创新药' },
    { keywords: ['养老', '养老产业', '养老服务'], sector: '养老产业' },
    
    // 消费类
    { keywords: ['消费', '消费品', '消费升级'], sector: '消费' },
    { keywords: ['白酒', '酒', '茅台', '五粮液'], sector: '白酒' },
    { keywords: ['沪港深消费', '沪港通消费'], sector: '沪港深消费' },
    
    // 金融类
    { keywords: ['银行', '商业银行'], sector: '银行' },
    { keywords: ['证券', '券商', '保险', '证券保险'], sector: '证券保险' },
    { keywords: ['可转债', '转债'], sector: '可转债' },
    { keywords: ['债基', '债券基金'], sector: '债基' },
    
    // 红利类
    { keywords: ['红利', '高股息', '股息'], sector: '红利' },
    { keywords: ['红利低波', '低波动'], sector: '红利低波' },
    { keywords: ['港股红利', '香港红利'], sector: '港股红利' },
    
    // 指数类
    { keywords: ['创业板', '创业板指'], sector: '创业板' },
    { keywords: ['科创板', '科创'], sector: '科创板' },
    { keywords: ['中证500', '中证五零零'], sector: '中证500' },
    { keywords: ['双创50', '科创创业50'], sector: '双创50' },
    { keywords: ['恒生', '恒生指数'], sector: '恒生' },
    { keywords: ['恒生科技', '恒生科技指数'], sector: '恒生科技' },
    { keywords: ['标普', '标普500'], sector: '标普' },
    
    // 量化类
    { keywords: ['量化', '量化策略'], sector: '量化' },
    { keywords: ['小微盘', '小盘量化'], sector: '小微盘量化' },
    { keywords: ['微盘股', '微盘'], sector: '微盘股' },
    
    // 其他
    { keywords: ['农林渔牧', '农业', '林业', '渔业', '牧业'], sector: '农林渔牧' },
    { keywords: ['传媒', '游戏', '影视', '娱乐'], sector: '传媒游戏' },
    { keywords: ['基建', '基础设施', '建筑工程'], sector: '基建' },
    { keywords: ['交通运输', '物流', '快递', '运输'], sector: '交通运输' },
    { keywords: ['房地产', '地产', '物业'], sector: '房地产' },
    { keywords: ['商业航天', '航天', '卫星'], sector: '商业航天' },
    { keywords: ['北证', '北京证券交易所'], sector: '北证' },
    { keywords: ['亚太', '亚洲太平洋'], sector: '亚太' },
    { keywords: ['军工', '国防', '军事'], sector: '军工' },
    { keywords: ['海外基金', 'QDII', '境外'], sector: '海外基金' },
    { keywords: ['海外医药', '境外医药'], sector: '海外医药' }
];

// ==================== 新增：数据验证工具函数 ====================

/**
 * 安全转换为数字（修复关键错误）
 * 专门处理 fund.dailyChange.toFixed is not a function 问题
 */
function safeToNumber(value, defaultValue = 0) {
    try {
        if (value === null || value === undefined || value === '') {
            return defaultValue;
        }
        
        if (typeof value === 'number') {
            return isNaN(value) ? defaultValue : value;
        }
        
        if (typeof value === 'string') {
            // 移除百分号、逗号、货币符号等
            const cleaned = value.replace(/[%,¥￥\s]/g, '');
            const num = parseFloat(cleaned);
            return isNaN(num) ? defaultValue : num;
        }
        
        // 其他类型尝试转换
        const num = Number(value);
        return isNaN(num) ? defaultValue : num;
    } catch (error) {
        console.warn('safeToNumber 转换失败:', error);
        return defaultValue;
    }
}

/**
 * 安全格式化百分比（修复 .toFixed() 错误的核心函数）
 */
function safeFormatPercentage(value, decimals = 2) {
    try {
        const num = safeToNumber(value, 0);
        return num.toFixed(decimals);
    } catch (error) {
        console.error('safeFormatPercentage 失败:', error);
        return '0.00';
    }
}

/**
 * 验证并修复基金数据
 */
function validateAndFixFundData(funds) {
    if (!Array.isArray(funds)) {
        console.warn('基金数据不是数组，返回空数组');
        return [];
    }
    
    return funds.map(fund => {
        // 创建副本避免修改原数据
        const fixedFund = { ...fund };
        
        // ========== 修复关键点：确保 dailyChange 是数字 ==========
        fixedFund.dailyChange = safeToNumber(fixedFund.dailyChange, 0);
        
        // ========== 确保其他数值字段也是数字 ==========
        fixedFund.holdingAmount = safeToNumber(fixedFund.holdingAmount, 0);
        fixedFund.totalValue = safeToNumber(fixedFund.totalValue, 0);
        fixedFund.yesterdayValue = safeToNumber(fixedFund.yesterdayValue, 0);
        
        // ========== 确保必要字段存在 ==========
        fixedFund.id = fixedFund.id || fixedFund.code || `fund_${Math.random().toString(36).substr(2, 9)}`;
        fixedFund.code = fixedFund.code || '000000';
        fixedFund.name = fixedFund.name || '未知基金';
        
        // 智能识别板块（如果未提供）
        if (!fixedFund.sector || fixedFund.sector === '' || fixedFund.sector === 'undefined') {
            fixedFund.sector = detectSector(fixedFund.name);
        }
        
        // ========== 确保 operations 是数组 ==========
        if (!Array.isArray(fixedFund.operations)) {
            fixedFund.operations = [];
        }
        
        // 修复 operations 中的金额
        fixedFund.operations = fixedFund.operations.map(op => ({
            ...op,
            amount: safeToNumber(op.amount, 0)
        }));
        
        return fixedFund;
    });
}

/**
 * 智能识别基金板块
 */
function detectSector(fundName) {
    try {
        if (!fundName) return '其他';
        
        const name = fundName.toLowerCase();
        
        // 遍历所有规则
        for (const rule of sectorRules) {
            for (const keyword of rule.keywords) {
                if (name.includes(keyword.toLowerCase())) {
                    return rule.sector;
                }
            }
        }
        
        return '大科技'; // 默认归类到大科技
    } catch (error) {
        console.error('识别基金板块失败:', error);
        return '其他';
    }
}

// ==================== 主页面逻辑 ====================

// 主页面逻辑
document.addEventListener('DOMContentLoaded', function() {
    console.log('页面加载完成，开始初始化...');
    
    try {
        // 初始化
        init();
        
        // 绑定事件
        const refreshBtn = document.getElementById('refreshBtn');
        const sortSelect = document.getElementById('sortSelect');
        const closeModal = document.getElementById('closeModal');
        const fundModal = document.getElementById('fundModal');
        
        if (refreshBtn) {
            refreshBtn.addEventListener('click', updateFundData);
        }
        
        if (sortSelect) {
            sortSelect.addEventListener('change', sortFunds);
        }
        
        if (closeModal) {
            closeModal.addEventListener('click', closeModalFunction);
        }
        
        // 点击模态框外部关闭
        if (fundModal) {
            fundModal.addEventListener('click', function(e) {
                if (e.target === this) closeModalFunction();
            });
        }
        
        console.log('初始化完成');
    } catch (error) {
        console.error('页面初始化失败:', error);
        showError('页面初始化失败: ' + error.message);
    }
});

function init() {
    try {
        updateDateDisplay();
        loadFundData();
        
        // 设置自动刷新（每30秒）
        setInterval(updateFundData, 30000);
        
        console.log('init函数执行完成');
    } catch (error) {
        console.error('init函数执行失败:', error);
    }
}

// 更新日期显示
function updateDateDisplay() {
    try {
        const now = new Date();
        const dateStr = now.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long'
        });
        
        const currentDateElement = document.getElementById('currentDate');
        if (currentDateElement) {
            currentDateElement.textContent = dateStr;
        }
    } catch (error) {
        console.error('更新日期显示失败:', error);
    }
}

// 加载基金数据 - 修复版本
async function loadFundData() {
    try {
        console.log('开始加载基金数据...');
        
        let funds = [];
        
        // 方式1：尝试调用 getFundsData（同步版本）
        if (typeof getFundsData === 'function') {
            console.log('使用getFundsData()');
            funds = getFundsData();
        }
        // 方式2：尝试调用 getFundsDataAsync（异步版本）
        else if (typeof getFundsDataAsync === 'function') {
            console.log('使用getFundsDataAsync()');
            funds = await getFundsDataAsync();
        }
        // 方式3：尝试调用 getLocalFunds（兼容版本）
        else if (typeof getLocalFunds === 'function') {
            console.log('使用getLocalFunds()');
            funds = getLocalFunds();
        }
        // 方式4：直接从localStorage获取
        else {
            console.log('直接从localStorage获取');
            try {
                const data = localStorage.getItem('xiaoli_funds_data');
                funds = data ? JSON.parse(data) : [];
            } catch (e) {
                console.error('从localStorage获取失败:', e);
            }
        }
        
        // 如果还是没有数据，使用模拟数据
        if (!funds || funds.length === 0) {
            console.log('使用模拟数据');
            funds = getMockFunds();
        }
        
        console.log('获取到基金数据，数量:', funds.length);
        
        // ========== 关键修复：验证和修复数据 ==========
        funds = validateAndFixFundData(funds);
        
        if (funds && funds.length > 0) {
            console.log('开始渲染基金...');
            renderFunds(funds);
            updateStats(funds);
            updateOperationsList(funds);
            console.log('数据加载完成');
        } else {
            console.log('没有数据');
            showNoDataMessage();
        }
        
        updateLastUpdateTime();
        
    } catch (error) {
        console.error('加载基金数据失败:', error);
        showError('加载数据失败: ' + error.message);
        
        // 显示后备数据
        try {
            const backupData = validateAndFixFundData([
                {
                    id: 'backup1',
                    code: '999999',
                    name: '系统测试基金',
                    sector: '其他',
                    holdingAmount: 10000,
                    netValue: '1.0000',
                    dailyChange: 0.5,
                    operations: [
                        { type: 'add', amount: 10000, date: '2024-02-01' }
                    ]
                }
            ]);
            renderFunds(backupData);
            updateStats(backupData);
        } catch (e) {
            console.error('显示后备数据也失败:', e);
        }
    }
}

// 模拟数据函数（后备）
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

// 渲染基金（按板块分类）- 修复版
function renderFunds(funds) {
    try {
        const container = document.getElementById('fundsContainer');
        if (!container) {
            throw new Error('找不到基金容器元素');
        }
        
        const totalAmount = funds.reduce((sum, fund) => sum + fund.holdingAmount, 0);
        
        console.log('开始渲染基金，总数:', funds.length);
        
        // 确保每个基金都有板块（已在上游修复函数中处理）
        
        // 按板块分组
        const sectors = {};
        funds.forEach(fund => {
            const sector = fund.sector;
            if (!sectors[sector]) {
                sectors[sector] = {
                    funds: [],
                    totalAmount: 0
                };
            }
            sectors[sector].funds.push(fund);
            sectors[sector].totalAmount += fund.holdingAmount;
        });
        
        console.log('分组后的板块:', Object.keys(sectors));
        
        // 计算每个板块占比（使用安全格式化）
        Object.keys(sectors).forEach(sector => {
            const percentage = (sectors[sector].totalAmount / totalAmount * 100);
            sectors[sector].percentage = safeFormatPercentage(percentage, 2);
        });
        
        // 按板块总金额排序
        const sortedSectors = Object.keys(sectors).sort((a, b) => {
            return sectors[b].totalAmount - sectors[a].totalAmount;
        });
        
        console.log('排序后的板块:', sortedSectors);
        
        let html = '';
        
        // 为每个板块创建卡片
        sortedSectors.forEach(sector => {
            const sectorData = sectors[sector];
            const sectorPercentage = sectorData.percentage;
            const sectorIcon = sectorIcons[sector] || 'fas fa-folder';
            
            html += `
                <div class="sector-card" data-sector="${sector}">
                    <div class="sector-header">
                        <div class="sector-title">
                            <h3><i class="${sectorIcon}"></i> ${sector}</h3>
                            <span class="sector-percentage">${sectorPercentage}%</span>
                        </div>
                        <div class="sector-total">
                            <span class="sector-amount">¥${sectorData.totalAmount.toFixed(2)}</span>
                            <span class="sector-fund-count">${sectorData.funds.length}只基金</span>
                        </div>
                    </div>
                    
                    <div class="sector-funds">
            `;
            
            // 显示该板块下的基金
            sectorData.funds.forEach(fund => {
                const fundPercentage = ((fund.holdingAmount / totalAmount) * 100);
                const sectorPercentage = ((fund.holdingAmount / sectorData.totalAmount) * 100);
                
                // ========== 关键修复：使用安全格式化函数 ==========
                const formattedDailyChange = safeFormatPercentage(fund.dailyChange, 2);
                const formattedFundPercentage = safeFormatPercentage(fundPercentage, 2);
                const formattedSectorPercentage = safeFormatPercentage(sectorPercentage, 2);
                
                const changeClass = fund.dailyChange >= 0 ? 'change-positive' : 'change-negative';
                const changeSymbol = fund.dailyChange >= 0 ? '+' : '';
                
                html += `
                    <div class="fund-card" data-id="${fund.id}">
                        <div class="fund-header">
                            <div class="fund-name">${fund.name}</div>
                            <div class="fund-code">${fund.code}</div>
                        </div>
                        
                        <div class="fund-stats">
                            <div class="stat-item">
                                <span class="stat-label">持仓金额</span>
                                <span class="stat-value-small">¥${fund.holdingAmount.toFixed(2)}</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">板块占比</span>
                                <span class="stat-value-small">${formattedSectorPercentage}%</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">实时净值</span>
                                <span class="stat-value-small">${fund.netValue || '0.0000'}</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">当日涨幅</span>
                                <span class="stat-value-small ${changeClass}">
                                    ${changeSymbol}${formattedDailyChange}%
                                </span>
                            </div>
                        </div>
                        
                        <div class="fund-actions">
                            ${fund.operations && fund.operations.length > 0 ? 
                                fund.operations.slice(0, 2).map(op => `
                                    <div class="action-item">
                                        <span class="action-type">${getOperationText(op.type)}</span>
                                        <span class="action-amount ${getOperationClass(op.type)}">
                                            ${op.type === 'clear' ? '清仓' : `¥${op.amount.toFixed(2)}`}
                                        </span>
                                        <span class="action-date">${formatDate(op.date)}</span>
                                    </div>
                                `).join('') : 
                                '<div class="no-data" style="font-size: 12px;">暂无操作记录</div>'
                            }
                        </div>
                        
                        <button class="view-details-btn" onclick="showFundDetails('${fund.id}')">
                            <i class="fas fa-info-circle"></i> 查看详情
                        </button>
                    </div>
                `;
            });
            
            html += `
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html;
        console.log('基金渲染完成');
    } catch (error) {
        console.error('渲染基金失败:', error);
        showError('渲染基金数据失败: ' + error.message);
    }
}

// 更新统计数据
function updateStats(funds) {
    try {
        const totalAmount = funds.reduce((sum, fund) => sum + fund.holdingAmount, 0);
        const totalGain = funds.reduce((sum, fund) => sum + (fund.holdingAmount * fund.dailyChange / 100), 0);
        const totalChange = totalAmount > 0 ? (totalGain / totalAmount * 100) : 0;
        
        // 使用安全格式化
        const formattedTotalChange = safeFormatPercentage(totalChange, 2);
        
        const totalAmountElement = document.getElementById('totalAmount');
        const fundCountElement = document.getElementById('fundCount');
        const totalChangeElement = document.getElementById('totalChange');
        const totalGainElement = document.getElementById('totalGain');
        const dailyEarningsElement = document.getElementById('dailyEarnings');
        
        if (totalAmountElement) {
            totalAmountElement.textContent = `¥ ${totalAmount.toFixed(2)}`;
        }
        
        if (fundCountElement) {
            fundCountElement.textContent = funds.length;
        }
        
        if (totalChangeElement) {
            totalChangeElement.textContent = `${totalChange >= 0 ? '+' : ''}${formattedTotalChange}%`;
            totalChangeElement.className = totalChange >= 0 ? 'change-positive' : 'change-negative';
        }
        
        if (totalGainElement) {
            totalGainElement.textContent = `${totalGain >= 0 ? '+' : ''}¥${totalGain.toFixed(2)}`;
        }
        
        if (dailyEarningsElement) {
            dailyEarningsElement.textContent = `¥ ${totalGain.toFixed(2)}`;
        }
    } catch (error) {
        console.error('更新统计数据失败:', error);
    }
}

// 更新操作记录
function updateOperationsList(funds) {
    try {
        const container = document.getElementById('operationsList');
        if (!container) return;
        
        let allOperations = [];
        
        // 收集所有操作记录
        funds.forEach(fund => {
            if (fund.operations && fund.operations.length > 0) {
                fund.operations.forEach(op => {
                    allOperations.push({
                        fundName: fund.name,
                        fundCode: fund.code,
                        ...op
                    });
                });
            }
        });
        
        // 按日期排序（最新的在前面）
        allOperations.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        if (allOperations.length === 0) {
            container.innerHTML = '<div class="no-data">暂无操作记录</div>';
            return;
        }
        
        // 只显示最近的10条记录
        const recentOperations = allOperations.slice(0, 10);
        
        let html = '';
        recentOperations.forEach(op => {
            html += `
                <div class="operation-item">
                    <div>
                        <span class="operation-fund">${op.fundName}</span>
                        <span class="operation-code">(${op.fundCode})</span>
                    </div>
                    <div>
                        <span class="operation-type ${getOperationClass(op.type)}">
                            ${getOperationText(op.type)}
                        </span>
                        <span class="operation-amount">
                            ${op.type === 'clear' ? '清仓' : `¥${op.amount.toFixed(2)}`}
                        </span>
                        <span class="operation-date">${formatDate(op.date)}</span>
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html;
    } catch (error) {
        console.error('更新操作记录失败:', error);
    }
}

// 更新最后更新时间
function updateLastUpdateTime() {
    try {
        const now = new Date();
        const timeStr = now.toLocaleTimeString('zh-CN');
        const lastUpdateElement = document.getElementById('lastUpdateTime');
        const updateTimeElement = document.getElementById('updateTime');
        
        if (lastUpdateElement) {
            lastUpdateElement.textContent = `最近更新: ${timeStr}`;
        }
        if (updateTimeElement) {
            updateTimeElement.textContent = timeStr;
        }
    } catch (error) {
        console.error('更新最后更新时间失败:', error);
    }
}

// 排序基金
function sortFunds() {
    try {
        loadFundData();
    } catch (error) {
        console.error('排序基金失败:', error);
    }
}

// 显示基金详情
function showFundDetails(fundId) {
    try {
        const modal = document.getElementById('fundModal');
        if (modal) {
            modal.style.display = 'flex';
        }
    } catch (error) {
        console.error('显示基金详情失败:', error);
    }
}

// 关闭模态框
function closeModalFunction() {
    try {
        const modal = document.getElementById('fundModal');
        if (modal) {
            modal.style.display = 'none';
        }
    } catch (error) {
        console.error('关闭模态框失败:', error);
    }
}

// 更新基金数据
function updateFundData() {
    try {
        console.log('手动更新基金数据...');
        loadFundData();
    } catch (error) {
        console.error('更新基金数据失败:', error);
    }
}

// 显示无数据消息
function showNoDataMessage() {
    try {
        const container = document.getElementById('fundsContainer');
        if (!container) return;
        
        container.innerHTML = `
            <div class="no-data">
                <i class="fas fa-chart-pie fa-3x"></i>
                <p>暂无基金数据</p>
                <p>请先在后台添加基金数据</p>
                <a href="login.html" class="btn-primary" style="margin-top: 20px; display: inline-block;">
                    前往后台管理
                </a>
            </div>
        `;
    } catch (error) {
        console.error('显示无数据消息失败:', error);
    }
}

// 显示错误
function showError(message) {
    try {
        const container = document.getElementById('fundsContainer');
        if (!container) return;
        
        container.innerHTML = `
            <div class="no-data">
                <i class="fas fa-exclamation-triangle fa-3x" style="color: #ff4757;"></i>
                <p style="color: #ff4757;">${message}</p>
                <p style="color: #666; font-size: 14px; margin-top: 10px;">请检查：</p>
                <ul style="text-align: left; color: #666; font-size: 14px; margin: 10px 0; padding-left: 20px;">
                    <li>1. storage.js 文件是否正确加载</li>
                    <li>2. 浏览器控制台是否有错误</li>
                    <li>3. 按F5刷新页面重试</li>
                </ul>
                <button onclick="updateFundData()" class="refresh-btn" style="margin-top: 20px;">
                    <i class="fas fa-redo"></i> 重试加载
                </button>
            </div>
        `;
    } catch (error) {
        console.error('显示错误消息失败:', error);
    }
}

// 辅助函数
function getOperationText(type) {
    switch(type) {
        case 'add': return '加仓';
        case 'reduce': return '减仓';
        case 'clear': return '清仓';
        default: return '操作';
    }
}

function getOperationClass(type) {
    switch(type) {
        case 'add': return 'action-add';
        case 'reduce': return 'action-reduce';
        case 'clear': return 'action-clear';
        default: return '';
    }
}

function formatDate(dateStr) {
    try {
        const date = new Date(dateStr);
        return date.toLocaleDateString('zh-CN').replace(/\//g, '-');
    } catch (error) {
        console.error('格式化日期失败:', error);
        return dateStr;
    }
}

// ==================== 导出函数（用于HTML调用） ====================
// 确保函数可以在HTML中通过onclick调用
window.showFundDetails = showFundDetails;
window.updateFundData = updateFundData;
window.closeModalFunction = closeModalFunction;
window.sortFunds = sortFunds;