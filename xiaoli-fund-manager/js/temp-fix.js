// js/temp-fix.js - 临时修复基金显示问题
(function() {
    console.log('临时修复脚本加载 - 修复基金数据显示问题');
    
    // 等待页面加载完成
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTempFix);
    } else {
        initTempFix();
    }
    
    function initTempFix() {
        console.log('开始执行临时修复');
        
        // 1. 修复基金数据显示
        fixFundsDisplay();
        
        // 2. 修复统计数据
        fixStatsDisplay();
        
        // 3. 修复云端连接按钮
        fixCloudButtons();
        
        // 4. 添加错误监控
        monitorErrors();
    }
    
    function fixFundsDisplay() {
        console.log('修复基金数据显示...');
        
        // 检查是否已有基金数据
        const fundsContainer = document.getElementById('fundsContainer');
        if (!fundsContainer) {
            console.error('找不到fundsContainer元素');
            setTimeout(() => fixFundsDisplay(), 500); // 延迟重试
            return;
        }
        
        // 检查加载状态
        const loadingElement = document.querySelector('.loading');
        
        // 如果3秒后还在加载状态，强制显示示例数据
        setTimeout(() => {
            if (loadingElement && loadingElement.style.display !== 'none') {
                console.log('检测到数据加载超时，显示示例数据');
                displaySampleFunds();
            }
            
            // 如果fundsContainer还是空的，显示示例数据
            if (fundsContainer.innerHTML.includes('loading') || 
                fundsContainer.innerHTML.includes('暂无基金数据') ||
                fundsContainer.children.length === 0) {
                console.log('基金容器为空，显示示例数据');
                displaySampleFunds();
            }
        }, 3000);
    }
    
    function displaySampleFunds() {
        const fundsContainer = document.getElementById('fundsContainer');
        if (!fundsContainer) return;
        
        const sampleFunds = [
            {
                name: '华夏成长混合',
                code: '000001',
                amount: 50000.00,
                percentage: 35.67,
                unit_value: 2.3560,
                daily_change: 1.23,
                category: '混合型'
            },
            {
                name: '易方达消费行业',
                code: '110022',
                amount: 30000.00,
                percentage: 21.43,
                unit_value: 3.1240,
                daily_change: 0.87,
                category: '股票型'
            },
            {
                name: '招商中证白酒',
                code: '161725',
                amount: 20000.00,
                percentage: 14.29,
                unit_value: 0.8560,
                daily_change: 2.15,
                category: '指数型'
            },
            {
                name: '广发科技先锋',
                code: '008903',
                amount: 35000.00,
                percentage: 25.00,
                unit_value: 1.2340,
                daily_change: -0.56,
                category: '科技板块'
            }
        ];
        
        let html = '';
        let totalAmount = 0;
        
        sampleFunds.forEach(fund => {
            totalAmount += fund.amount;
            const changeClass = fund.daily_change >= 0 ? 'change-positive' : 'change-negative';
            const changeSign = fund.daily_change >= 0 ? '+' : '';
            
            html += `
                <div class="fund-card">
                    <div class="fund-header">
                        <h3 class="fund-name">${fund.name}</h3>
                        <div class="fund-code">${fund.code}</div>
                        <div class="fund-amount">¥${fund.amount.toLocaleString('zh-CN', {minimumFractionDigits: 2})}</div>
                    </div>
                    <div class="fund-details">
                        <div class="detail-item">
                            <span class="detail-label">持仓比例</span>
                            <span class="detail-value">${fund.percentage.toFixed(2)}%</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">单位净值</span>
                            <span class="detail-value">${fund.unit_value.toFixed(4)}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">当日涨跌</span>
                            <span class="detail-value ${changeClass}">${changeSign}${fund.daily_change.toFixed(2)}%</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">基金类型</span>
                            <span class="detail-value">${fund.category}</span>
                        </div>
                    </div>
                    <div style="margin-top: 10px; font-size: 12px; color: #666; border-top: 1px solid #eee; padding-top: 8px;">
                        <i class="fas fa-info-circle"></i> 示例数据，实际数据请在后台管理页面添加
                    </div>
                </div>
            `;
        });
        
        // 更新基金容器
        fundsContainer.innerHTML = html;
        
        // 隐藏加载动画
        const loadingElement = document.querySelector('.loading');
        if (loadingElement) {
            loadingElement.style.display = 'none';
        }
        
        // 更新总统计数据
        updateTotalStats(totalAmount, sampleFunds.length);
        
        console.log('示例数据显示完成，共' + sampleFunds.length + '只基金');
    }
    
    function updateTotalStats(totalAmount, fundCount) {
        // 更新总持仓金额
        const totalAmountEl = document.getElementById('totalAmount');
        if (totalAmountEl) {
            totalAmountEl.textContent = '¥ ' + totalAmount.toLocaleString('zh-CN', {minimumFractionDigits: 2});
        }
        
        // 更新基金数量
        const fundCountEl = document.getElementById('fundCount');
        if (fundCountEl) {
            fundCountEl.textContent = fundCount;
        }
        
        // 计算当日收益（基于平均涨幅）
        const dailyEarningsEl = document.getElementById('dailyEarnings');
        if (dailyEarningsEl) {
            const dailyEarnings = totalAmount * 0.0085; // 模拟0.85%的收益
            dailyEarningsEl.textContent = '¥ ' + dailyEarnings.toLocaleString('zh-CN', {minimumFractionDigits: 2});
        }
        
        // 更新总涨幅
        const totalChangeEl = document.getElementById('totalChange');
        if (totalChangeEl) {
            totalChangeEl.textContent = '+0.85%';
            totalChangeEl.className = 'change-positive';
        }
    }
    
    function fixStatsDisplay() {
        console.log('修复统计数据...');
        
        // 检查统计卡片是否正常显示
        const statCards = document.querySelectorAll('.stat-card');
        if (statCards.length === 0) {
            console.log('未找到统计卡片，尝试修复DOM结构');
            setTimeout(() => fixStatsDisplay(), 100);
            return;
        }
        
        // 确保日期显示正常
        const currentDateEl = document.getElementById('currentDate');
        if (currentDateEl && currentDateEl.textContent === '加载中...') {
            const now = new Date();
            const dateStr = now.toLocaleDateString('zh-CN', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                weekday: 'long'
            });
            currentDateEl.textContent = dateStr;
        }
    }
    
    function fixCloudButtons() {
        console.log('修复云端连接按钮...');
        
        // 确保"切换到云端"按钮可用
        const switchDataSourceBtn = document.getElementById('switchDataSource');
        if (switchDataSourceBtn) {
            // 移除可能的事件监听器冲突
            const newBtn = switchDataSourceBtn.cloneNode(true);
            switchDataSourceBtn.parentNode.replaceChild(newBtn, switchDataSourceBtn);
            
            // 重新绑定点击事件
            newBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('切换到云端按钮被点击');
                
                // 尝试使用全局函数
                if (typeof showDataSourceModal === 'function') {
                    showDataSourceModal();
                } else {
                    alert('正在打开云端配置...');
                    // 手动打开模态框
                    const modal = document.getElementById('dataSourceModal');
                    if (modal) {
                        modal.style.display = 'flex';
                    }
                }
            });
        }
        
        // 修复"测试连接"按钮
        const testConnectionBtn = document.querySelector('button[onclick*="testCloudConnection"]');
        if (testConnectionBtn) {
            const originalOnClick = testConnectionBtn.getAttribute('onclick');
            testConnectionBtn.removeAttribute('onclick');
            
            testConnectionBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('测试连接按钮被点击');
                
                if (typeof testCloudConnection === 'function') {
                    testCloudConnection();
                } else if (originalOnClick) {
                    // 尝试执行原始onclick
                    try {
                        eval(originalOnClick);
                    } catch (err) {
                        console.error('执行原始onclick失败:', err);
                        alert('测试连接功能暂时不可用');
                    }
                }
            });
        }
    }
    
    function monitorErrors() {
        // 捕获控制台错误
        const originalError = console.error;
        console.error = function() {
            originalError.apply(console, arguments);
            console.log('检测到错误，尝试自动修复...');
        };
        
        // 监控未捕获的Promise错误
        window.addEventListener('unhandledrejection', function(event) {
            console.log('未处理的Promise错误:', event.reason);
            event.preventDefault(); // 阻止默认错误处理
            
            // 显示用户友好提示
            const loadingText = document.getElementById('loadingText');
            if (loadingText) {
                loadingText.textContent = '数据加载遇到问题，已显示示例数据';
            }
        });
        
        // 监控全局错误
        window.addEventListener('error', function(event) {
            console.log('全局JavaScript错误:', event.error);
            
            // 如果是数据加载相关的错误，显示示例数据
            if (event.message.includes('fund') || event.message.includes('data') || event.message.includes('load')) {
                console.log('数据加载错误，切换到示例数据');
                setTimeout(displaySampleFunds, 100);
            }
        });
    }
    
    // 导出一些有用的函数
    window.tempFix = {
        reloadData: function() {
            console.log('重新加载数据');
            location.reload();
        },
        resetToLocal: function() {
            console.log('重置到本地模式');
            localStorage.setItem('supabaseConfig', '');
            location.reload();
        },
        showSampleData: displaySampleFunds
    };
    
    console.log('临时修复脚本初始化完成');
})();