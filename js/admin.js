// admin.js - 后台管理系统
document.addEventListener('DOMContentLoaded', function() {
    console.log('后台管理系统加载');
    
    // 全局变量
    let currentDataSource = 'local';
    let supabaseClient = null;
    let isCloudConnected = false;
    let editingFundId = null;
    
    // 初始化
    initAdmin();
    
    // 初始化函数
    function initAdmin() {
        console.log('初始化后台管理');
        
        // 绑定按钮事件
        bindEvents();
        
        // 检查云端配置
        checkCloudConfig();
        
        // 加载基金列表
        loadFundsList();
        
        // 加载操作记录
        loadOperations();
        
        // 更新显示
        updateDateDisplay();
        updateDataSourceUI();
        
        // 设置自动保存
        setupAutoSave();
    }
    
    // 绑定事件
    function bindEvents() {
        // 保存基金按钮
        const saveBtn = document.getElementById('saveFundBtn');
        if (saveBtn) {
            saveBtn.addEventListener('click', saveFund);
        }
        
        // 重置表单按钮
        const resetBtn = document.getElementById('resetFundBtn');
        if (resetBtn) {
            resetBtn.addEventListener('click', resetFundForm);
        }
        
        // 数据源切换
        const switchBtn = document.getElementById('switchDataSource');
        if (switchBtn) {
            switchBtn.addEventListener('click', switchDataSource);
        }
        
        // 查看前台按钮
        const viewFrontBtn = document.getElementById('viewFrontBtn');
        if (viewFrontBtn) {
            viewFrontBtn.addEventListener('click', function() {
                // 保存当前数据源状态到localStorage
                const dataSourceState = {
                    source: currentDataSource,
                    timestamp: new Date().toISOString(),
                    isCloud: isCloudConnected
                };
                localStorage.setItem('frontendDataSource', JSON.stringify(dataSourceState));
                
                window.open('index.html', '_blank');
            });
        }
        
        // 退出登录按钮
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function() {
                if (confirm('确定要退出登录吗？')) {
                    window.location.href = 'login.html';
                }
            });
        }
        
        // 刷新列表按钮
        const refreshBtn = document.getElementById('refreshListBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', loadFundsList);
        }
        
        // 删除所有数据按钮
        const deleteAllBtn = document.getElementById('deleteAllBtn');
        if (deleteAllBtn) {
            deleteAllBtn.addEventListener('click', deleteAllFunds);
        }
        
        // 表单输入变化监听
        setupFormListeners();
        
        // 实时净值自动生成
        setupAutoNetValue();
    }
    
    // 检查云端配置
    function checkCloudConfig() {
        try {
            const configStr = localStorage.getItem('supabaseConfig');
            if (configStr) {
                const config = JSON.parse(configStr);
                console.log('找到云端配置:', config.url);
                
                // 初始化Supabase客户端
                initSupabaseClient(config.url, config.anonKey);
                
                // 测试连接
                testCloudConnection();
            } else {
                console.log('没有云端配置，使用本地模式');
                currentDataSource = 'local';
            }
        } catch (error) {
            console.error('检查云端配置失败:', error);
            currentDataSource = 'local';
        }
    }
    
    // 初始化Supabase客户端
    function initSupabaseClient(url, anonKey) {
        try {
            if (window.supabaseClient && window.supabaseClient.init) {
                const success = window.supabaseClient.init(url, anonKey);
                if (success) {
                    supabaseClient = window.supabaseClient;
                    console.log('Supabase客户端初始化成功');
                    return true;
                }
            }
            console.log('Supabase客户端初始化失败');
            return false;
        } catch (error) {
            console.error('初始化Supabase失败:', error);
            return false;
        }
    }
    
    // 测试云端连接
    async function testCloudConnection() {
        if (!supabaseClient) return false;
        
        try {
            const connected = await supabaseClient.testConnection();
            if (connected) {
                console.log('云端连接成功');
                currentDataSource = 'cloud';
                isCloudConnected = true;
                updateDataSourceUI();
                return true;
            }
        } catch (error) {
            console.error('云端连接测试失败:', error);
        }
        
        currentDataSource = 'local';
        isCloudConnected = false;
        updateDataSourceUI();
        return false;
    }
    
    // 更新数据源UI显示
    function updateDataSourceUI() {
        const sourceElement = document.getElementById('dataSource');
        const switchBtn = document.getElementById('switchDataSource');
        
        if (currentDataSource === 'local') {
            if (sourceElement) {
                sourceElement.textContent = '本地数据';
                sourceElement.className = 'local-data';
            }
            if (switchBtn) {
                switchBtn.innerHTML = '<i class="fas fa-cloud-upload-alt"></i> 切换到云端';
                switchBtn.className = 'btn btn-primary';
            }
        } else {
            if (sourceElement) {
                sourceElement.textContent = '云端数据';
                sourceElement.className = 'cloud-data';
            }
            if (switchBtn) {
                switchBtn.innerHTML = '<i class="fas fa-laptop"></i> 切换到本地';
                switchBtn.className = 'btn btn-warning';
            }
        }
    }
    
    // 切换数据源
    function switchDataSource() {
        if (currentDataSource === 'local') {
            // 切换到云端
            const configStr = localStorage.getItem('supabaseConfig');
            if (!configStr) {
                showMessage('⚠️ 请先在主页配置云端数据库', 'warning');
                window.open('index.html', '_blank');
                return;
            }
            
            const config = JSON.parse(configStr);
            if (initSupabaseClient(config.url, config.anonKey)) {
                showMessage('🔗 正在连接云端...', 'info');
                testCloudConnection().then(success => {
                    if (success) {
                        showMessage('✅ 已切换到云端模式', 'success');
                        loadFundsList();
                        loadOperations();
                    } else {
                        showMessage('❌ 云端连接失败，保持本地模式', 'error');
                    }
                });
            }
        } else {
            // 切换到本地
            currentDataSource = 'local';
            isCloudConnected = false;
            updateDataSourceUI();
            showMessage('✅ 已切换到本地模式', 'success');
            loadFundsList();
            loadOperations();
        }
    }
    
    // 加载基金列表
    async function loadFundsList() {
        console.log('加载基金列表，数据源:', currentDataSource);
        
        const tableBody = document.getElementById('fundsTableBody');
        if (!tableBody) return;
        
        tableBody.innerHTML = '<tr><td colspan="8" style="text-align: center;">正在加载...</td></tr>';
        
        try {
            let funds = [];
            
            if (currentDataSource === 'cloud' && supabaseClient && isCloudConnected) {
                // 从云端加载
                funds = await supabaseClient.getFundsData();
                console.log('从云端加载基金:', funds.length, '个');
            } else {
                // 从本地加载
                if (typeof window.fundData !== 'undefined' && window.fundData.getFunds) {
                    funds = window.fundData.getFunds();
                } else {
                    // 备用方案
                    const dataStr = localStorage.getItem('fundsData');
                    funds = dataStr ? JSON.parse(dataStr) : [];
                }
                console.log('从本地加载基金:', funds.length, '个');
            }
            
            displayFundsTable(funds);
            
        } catch (error) {
            console.error('加载基金列表失败:', error);
            tableBody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: red;">加载失败: ' + error.message + '</td></tr>';
        }
    }
    
    // 显示基金表格
    function displayFundsTable(funds) {
        const tableBody = document.getElementById('fundsTableBody');
        if (!tableBody) return;
        
        if (!funds || funds.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="8" style="text-align: center;">暂无基金数据</td></tr>';
            return;
        }
        
        let html = '';
        funds.forEach((fund, index) => {
            const isLocal = fund.id && fund.id.startsWith('local_');
            const dataSource = isLocal ? '本地' : '云端';
            
            html += `
            <tr>
                <td>${fund.code || '--'}</td>
                <td>${fund.name || '未命名'}</td>
                <td>${fund.category || fund.sector || '未分类'}</td>
                <td>¥${parseFloat(fund.amount || 0).toLocaleString('zh-CN', {minimumFractionDigits: 2})}</td>
                <td>${parseFloat(fund.net_value || fund.unit_value || 0).toFixed(4)}</td>
                <td class="${(fund.daily_change || 0) >= 0 ? 'positive' : 'negative'}">
                    ${(fund.daily_change || 0) >= 0 ? '+' : ''}${parseFloat(fund.daily_change || 0).toFixed(2)}%
                </td>
                <td>${fund.operation_count || 0}次操作</td>
                <td>
                    <button class="btn btn-sm btn-edit" onclick="editFund(${isLocal ? index : `'${fund.id}'`})">
                        <i class="fas fa-edit"></i> 编辑
                    </button>
                    <button class="btn btn-sm btn-delete" onclick="deleteFund(${isLocal ? index : `'${fund.id}'`})">
                        <i class="fas fa-trash"></i> 删除
                    </button>
                </td>
            </tr>
            `;
        });
        
        tableBody.innerHTML = html;
        
        // 绑定全局函数
        window.editFund = editFund;
        window.deleteFund = deleteFund;
    }
    
    // 编辑基金
    function editFund(id) {
        console.log('编辑基金:', id);
        
        // 根据数据源获取数据
        let fund = null;
        
        if (typeof id === 'string' && id.startsWith('local_')) {
            // 本地编辑
            if (typeof window.fundData !== 'undefined' && window.fundData.getFundById) {
                fund = window.fundData.getFundById(id);
            }
        } else if (currentDataSource === 'cloud') {
            // 云端编辑 - 需要从云端加载详情
            showMessage('🔄 正在加载基金详情...', 'info');
            loadFundDetail(id);
            return;
        } else {
            // 本地索引编辑
            if (typeof window.fundData !== 'undefined' && window.fundData.getFunds) {
                const funds = window.fundData.getFunds();
                fund = funds[id];
            }
        }
        
        if (fund) {
            fillFundForm(fund);
            editingFundId = id;
            showMessage('📝 正在编辑: ' + (fund.name || '未知基金'), 'info');
        } else {
            showMessage('❌ 未找到基金数据', 'error');
        }
    }
    
    // 加载基金详情（云端）
    async function loadFundDetail(id) {
        if (!supabaseClient) {
            showMessage('❌ 云端客户端未初始化', 'error');
            return;
        }
        
        try {
            const fund = await supabaseClient.getFundById(id);
            if (fund) {
                fillFundForm(fund);
                editingFundId = id;
                showMessage('📝 正在编辑云端基金: ' + (fund.name || '未知基金'), 'success');
            } else {
                showMessage('❌ 未找到云端基金数据', 'error');
            }
        } catch (error) {
            console.error('加载基金详情失败:', error);
            showMessage('❌ 加载失败: ' + error.message, 'error');
        }
    }
    
    // 填充表单
    function fillFundForm(fund) {
        document.getElementById('fundCode').value = fund.code || '';
        document.getElementById('fundName').value = fund.name || '';
        document.getElementById('fundAmount').value = fund.amount || '';
        document.getElementById('fundSector').value = fund.category || fund.sector || '';
        document.getElementById('operationType').value = fund.last_operation_type || 'buy';
        document.getElementById('operationAmount').value = fund.last_operation_amount || '';
        document.getElementById('operationDate').value = fund.last_operation_date || new Date().toISOString().split('T')[0];
        document.getElementById('netValue').value = fund.net_value || fund.unit_value || '';
        
        // 滚动到表单
        document.getElementById('fundForm').scrollIntoView({ behavior: 'smooth' });
    }
    
    // 删除基金
    async function deleteFund(id) {
        if (!confirm('确定要删除这个基金吗？此操作不可恢复！')) {
            return;
        }
        
        console.log('删除基金:', id);
        
        try {
            let success = false;
            
            if (typeof id === 'string' && !id.startsWith('local_') && currentDataSource === 'cloud') {
                // 删除云端数据
                if (supabaseClient) {
                    success = await supabaseClient.deleteFund(id);
                }
            } else {
                // 删除本地数据
                const index = typeof id === 'number' ? id : 0;
                if (typeof window.fundData !== 'undefined' && window.fundData.deleteFund) {
                    success = window.fundData.deleteFund(index);
                } else {
                    // 备用方案
                    const dataStr = localStorage.getItem('fundsData');
                    let funds = dataStr ? JSON.parse(dataStr) : [];
                    funds.splice(index, 1);
                    localStorage.setItem('fundsData', JSON.stringify(funds));
                    success = true;
                }
            }
            
            if (success) {
                showMessage('✅ 基金删除成功', 'success');
                loadFundsList();
                loadOperations();
                
                // 如果正在编辑这个基金，重置表单
                if (editingFundId === id) {
                    resetFundForm();
                    editingFundId = null;
                }
            } else {
                showMessage('❌ 删除失败', 'error');
            }
        } catch (error) {
            console.error('删除基金失败:', error);
            showMessage('❌ 删除失败: ' + error.message, 'error');
        }
    }
    
    // 删除所有基金
    async function deleteAllFunds() {
        if (!confirm('⚠️ 危险操作！\n确定要删除所有基金数据吗？\n此操作不可恢复！')) {
            return;
        }
        
        try {
            let success = false;
            
            if (currentDataSource === 'cloud' && supabaseClient && isCloudConnected) {
                success = await supabaseClient.deleteAllFunds();
            } else {
                // 删除本地数据
                if (typeof window.fundData !== 'undefined' && window.fundData.clearAll) {
                    window.fundData.clearAll();
                }
                localStorage.removeItem('fundsData');
                success = true;
            }
            
            if (success) {
                showMessage('✅ 所有基金数据已清空', 'success');
                loadFundsList();
                loadOperations();
                resetFundForm();
            } else {
                showMessage('❌ 清空失败', 'error');
            }
        } catch (error) {
            console.error('清空数据失败:', error);
            showMessage('❌ 清空失败: ' + error.message, 'error');
        }
    }
    
    // 保存基金（新增或编辑）
    async function saveFund() {
        console.log('保存基金数据');
        
        // 验证表单
        if (!validateForm()) {
            return;
        }
        
        // 收集表单数据
        const formData = collectFormData();
        
        // 显示保存提示
        showMessage('💾 正在保存数据...', 'info');
        
        try {
            let savedId = null;
            let success = false;
            
            if (currentDataSource === 'cloud' && supabaseClient && isCloudConnected) {
                // 保存到云端
                if (editingFundId) {
                    // 更新现有基金
                    success = await supabaseClient.updateFund(editingFundId, formData);
                    savedId = editingFundId;
                } else {
                    // 新增基金
                    savedId = await supabaseClient.addFund(formData);
                    success = savedId !== null;
                }
            } else {
                // 保存到本地
                if (typeof window.fundData !== 'undefined') {
                    if (editingFundId !== null) {
                        // 更新现有基金
                        if (window.fundData.updateFund) {
                            success = window.fundData.updateFund(editingFundId, formData);
                        }
                    } else {
                        // 新增基金
                        if (window.fundData.addFund) {
                            savedId = window.fundData.addFund(formData);
                            success = savedId !== null;
                        }
                    }
                }
                
                // 如果fundData不存在，使用备用方案
                if (!window.fundData) {
                    const dataStr = localStorage.getItem('fundsData') || '[]';
                    let funds = JSON.parse(dataStr);
                    
                    if (editingFundId !== null && typeof editingFundId === 'number') {
                        // 更新
                        funds[editingFundId] = formData;
                        success = true;
                    } else {
                        // 新增
                        funds.push(formData);
                        success = true;
                        savedId = funds.length - 1;
                    }
                    
                    localStorage.setItem('fundsData', JSON.stringify(funds));
                }
            }
            
            if (success) {
                showMessage('✅ 基金保存成功！', 'success');
                
                // 记录操作
                recordOperation(formData);
                
                // 重置表单
                resetFundForm();
                
                // 刷新列表
                loadFundsList();
                loadOperations();
                
                // 强制同步到前端页面
                syncToFrontend();
                
            } else {
                showMessage('❌ 保存失败，请重试', 'error');
            }
        } catch (error) {
            console.error('保存基金失败:', error);
            showMessage('❌ 保存失败: ' + error.message, 'error');
        }
    }
    
    // 同步到前端页面
    function syncToFrontend() {
        console.log('同步数据到前端页面');
        
        // 更新前端页面的数据源状态
        const dataSourceState = {
            source: currentDataSource,
            timestamp: new Date().toISOString(),
            isCloud: isCloudConnected,
            lastUpdate: new Date().toISOString()
        };
        localStorage.setItem('frontendDataSource', JSON.stringify(dataSourceState));
        
        // 如果是本地数据，也同步fundsData
        if (currentDataSource === 'local') {
            if (typeof window.fundData !== 'undefined' && window.fundData.getFunds) {
                const funds = window.fundData.getFunds();
                localStorage.setItem('fundsData_backup', JSON.stringify(funds));
            }
        }
    }
    
    // 收集表单数据
    function collectFormData() {
        const code = document.getElementById('fundCode').value.trim();
        const name = document.getElementById('fundName').value.trim();
        const amount = parseFloat(document.getElementById('fundAmount').value) || 0;
        const sector = document.getElementById('fundSector').value.trim();
        const operationType = document.getElementById('operationType').value;
        const operationAmount = parseFloat(document.getElementById('operationAmount').value) || 0;
        const operationDate = document.getElementById('operationDate').value;
        const netValue = parseFloat(document.getElementById('netValue').value) || this.generateNetValue();
        
        // 计算涨幅（模拟）
        const dailyChange = this.generateDailyChange();
        
        return {
            code: code,
            name: name,
            amount: amount,
            category: sector,
            sector: sector,
            net_value: netValue,
            unit_value: netValue,
            daily_change: dailyChange,
            last_operation_type: operationType,
            last_operation_amount: operationAmount,
            last_operation_date: operationDate,
            operation_count: 1,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
    }
    
    // 验证表单
    function validateForm() {
        const code = document.getElementById('fundCode').value.trim();
        const name = document.getElementById('fundName').value.trim();
        const amount = document.getElementById('fundAmount').value.trim();
        
        if (!code) {
            showMessage('❌ 请输入基金代码', 'error');
            document.getElementById('fundCode').focus();
            return false;
        }
        
        if (!name) {
            showMessage('❌ 请输入基金名称', 'error');
            document.getElementById('fundName').focus();
            return false;
        }
        
        if (!amount || parseFloat(amount) <= 0) {
            showMessage('❌ 请输入有效的持仓金额', 'error');
            document.getElementById('fundAmount').focus();
            return false;
        }
        
        return true;
    }
    
    // 生成模拟净值
    function generateNetValue() {
        return (Math.random() * 3 + 0.5).toFixed(4);
    }
    
    // 生成模拟涨跌幅
    function generateDailyChange() {
        return (Math.random() * 5 - 2.5).toFixed(2);
    }
    
    // 重置表单
    function resetFundForm() {
        document.getElementById('fundCode').value = '';
        document.getElementById('fundName').value = '';
        document.getElementById('fundAmount').value = '';
        document.getElementById('fundSector').value = '';
        document.getElementById('operationType').value = 'buy';
        document.getElementById('operationAmount').value = '';
        document.getElementById('operationDate').value = new Date().toISOString().split('T')[0];
        document.getElementById('netValue').value = this.generateNetValue();
        
        editingFundId = null;
        showMessage('📝 表单已重置，可以添加新基金', 'info');
    }
    
    // 记录操作
    function recordOperation(fundData) {
        const operation = {
            type: 'save',
            fund_code: fundData.code,
            fund_name: fundData.name,
            amount: fundData.amount,
            operation_type: fundData.last_operation_type,
            operation_amount: fundData.last_operation_amount,
            timestamp: new Date().toISOString(),
            user: 'admin'
        };
        
        // 保存到操作记录
        const operationsStr = localStorage.getItem('fundOperations') || '[]';
        const operations = JSON.parse(operationsStr);
        operations.unshift(operation);
        
        // 只保留最近50条
        if (operations.length > 50) {
            operations.pop();
        }
        
        localStorage.setItem('fundOperations', JSON.stringify(operations));
    }
    
    // 加载操作记录
    function loadOperations() {
        const operationsList = document.getElementById('operationsList');
        if (!operationsList) return;
        
        try {
            const operationsStr = localStorage.getItem('fundOperations') || '[]';
            const operations = JSON.parse(operationsStr);
            
            if (!operations || operations.length === 0) {
                operationsList.innerHTML = '<div class="no-data">暂无操作记录</div>';
                return;
            }
            
            let html = '';
            operations.forEach(op => {
                const time = new Date(op.timestamp).toLocaleString('zh-CN');
                const typeClass = op.type === 'save' ? 'save-op' : op.type === 'delete' ? 'delete-op' : 'edit-op';
                const typeText = op.type === 'save' ? '保存' : op.type === 'delete' ? '删除' : '编辑';
                
                html += `
                <div class="operation-item ${typeClass}">
                    <div class="op-time">${time}</div>
                    <div class="op-details">
                        <span class="op-type">${typeText}</span> 
                        <strong>${op.fund_name || op.fund_code || '未知基金'}</strong>
                        ${op.operation_type === 'buy' ? '加仓' : '减仓'} ¥${parseFloat(op.operation_amount || 0).toLocaleString('zh-CN')}
                    </div>
                    <div class="op-user">${op.user || '管理员'}</div>
                </div>
                `;
            });
            
            operationsList.innerHTML = html;
        } catch (error) {
            console.error('加载操作记录失败:', error);
            operationsList.innerHTML = '<div class="no-data">加载操作记录失败</div>';
        }
    }
    
    // 显示消息
    function showMessage(text, type = 'info') {
        // 移除旧消息
        const oldMsg = document.querySelector('.message-popup');
        if (oldMsg) {
            oldMsg.remove();
        }
        
        // 创建新消息
        const message = document.createElement('div');
        message.className = `message-popup message-${type}`;
        message.innerHTML = `
            <div class="message-content">
                <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-times-circle' : type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle'}"></i>
                <span>${text}</span>
            </div>
        `;
        
        // 添加到页面
        document.body.appendChild(message);
        
        // 显示动画
        setTimeout(() => {
            message.classList.add('show');
        }, 10);
        
        // 3秒后消失
        setTimeout(() => {
            message.classList.remove('show');
            setTimeout(() => {
                if (message.parentNode) {
                    message.remove();
                }
            }, 300);
        }, 3000);
        
        // 添加样式
        if (!document.querySelector('#message-styles')) {
            const style = document.createElement('style');
            style.id = 'message-styles';
            style.textContent = `
                .message-popup {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: white;
                    padding: 15px 20px;
                    border-radius: 8px;
                    box-shadow: 0 5px 15px rgba(0,0,0,0.2);
                    z-index: 9999;
                    transform: translateX(120%);
                    transition: transform 0.3s ease;
                    min-width: 300px;
                    max-width: 500px;
                }
                .message-popup.show {
                    transform: translateX(0);
                }
                .message-success {
                    border-left: 4px solid #34C759;
                }
                .message-error {
                    border-left: 4px solid #FF3B30;
                }
                .message-warning {
                    border-left: 4px solid #FF9500;
                }
                .message-info {
                    border-left: 4px solid #007AFF;
                }
                .message-content {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                .message-content i {
                    font-size: 20px;
                }
                .message-success .message-content i { color: #34C759; }
                .message-error .message-content i { color: #FF3B30; }
                .message-warning .message-content i { color: #FF9500; }
                .message-info .message-content i { color: #007AFF; }
            `;
            document.head.appendChild(style);
        }
    }
    
    // 更新日期显示
    function updateDateDisplay() {
        const dateElement = document.getElementById('currentDate');
        if (dateElement) {
            const now = new Date();
            const dateStr = now.toLocaleDateString('zh-CN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'long'
            });
            dateElement.textContent = dateStr;
        }
    }
    
    // 设置表单监听
    function setupFormListeners() {
        const form = document.getElementById('fundForm');
        if (form) {
            form.addEventListener('input', function() {
                // 可以添加实时验证逻辑
            });
        }
    }
    
    // 设置自动净值生成
    function setupAutoNetValue() {
        const netValueInput = document.getElementById('netValue');
        if (netValueInput) {
            // 如果输入框为空，自动填充
            if (!netValueInput.value) {
                netValueInput.value = this.generateNetValue();
            }
        }
    }
    
    // 设置自动保存
    function setupAutoSave() {
        // 每5分钟自动保存一次数据状态
        setInterval(() => {
            if (currentDataSource === 'local') {
                syncToFrontend();
            }
        }, 300000); // 5分钟
    }
    
    // 暴露一些函数给全局使用
    window.adminModule = {
        saveFund: saveFund,
        resetFundForm: resetFundForm,
        loadFundsList: loadFundsList,
        showMessage: showMessage
    };
});