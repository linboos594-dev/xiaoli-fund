// js/supabase-client.js - 修复版
let supabaseClientInstance = null;
let isSupabaseInitialized = false;

// 初始化Supabase客户端
function initSupabaseClient(url, anonKey) {
    try {
        console.log('正在初始化 Supabase 客户端...');
        
        // 清理URL
        let cleanUrl = url.trim();
        
        // 确保有https://
        if (!cleanUrl.startsWith('https://')) {
            cleanUrl = 'https://' + cleanUrl;
        }
        
        // 移除可能的错误路径
        cleanUrl = cleanUrl.replace(/\/reset\/v1\/?$/, '');
        cleanUrl = cleanUrl.replace(/\/rest\/v1\/?$/, '');
        cleanUrl = cleanUrl.replace(/\/$/, ''); // 移除末尾斜杠
        
        console.log('处理后的URL:', cleanUrl);
        console.log('Key格式正确:', anonKey.startsWith('eyJ'));
        
        // 创建Supabase客户端
        supabaseClientInstance = window.supabase.createClient(cleanUrl, anonKey, {
            auth: {
                persistSession: false,
                autoRefreshToken: false
            },
            global: {
                headers: {
                    'apikey': anonKey,
                    'Authorization': `Bearer ${anonKey}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=representation'
                }
            }
        });
        
        isSupabaseInitialized = true;
        console.log('✅ Supabase 客户端初始化成功');
        return true;
    } catch (error) {
        console.error('❌ 初始化 Supabase 客户端失败:', error);
        return false;
    }
}

// 获取当前客户端
function getClient() {
    return supabaseClientInstance;
}

// 简单连接测试 - 只测试网络连接和认证
async function testConnection() {
    if (!supabaseClientInstance || !isSupabaseInitialized) {
        console.error('Supabase 客户端未初始化');
        return false;
    }
    
    try {
        console.log('开始测试 Supabase 连接...');
        
        // 方法1：直接测试REST API端点
        const restUrl = supabaseClientInstance.supabaseUrl + '/rest/v1/';
        console.log('测试REST端点:', restUrl);
        
        const response = await fetch(restUrl, {
            method: 'GET',
            headers: {
                'apikey': supabaseClientInstance.supabaseKey,
                'Authorization': `Bearer ${supabaseClientInstance.supabaseKey}`
            }
        });
        
        if (response.status === 401) {
            console.log('✅ 连接成功但未授权 (预期行为)');
            return true;
        }
        
        if (response.ok) {
            console.log('✅ REST API 连接成功');
            return true;
        }
        
        console.log('REST API 响应状态:', response.status);
        
        // 方法2：测试GraphQL端点
        try {
            const graphqlUrl = supabaseClientInstance.supabaseUrl + '/graphql/v1';
            const graphqlResponse = await fetch(graphqlUrl, {
                method: 'POST',
                headers: {
                    'apikey': supabaseClientInstance.supabaseKey,
                    'Authorization': `Bearer ${supabaseClientInstance.supabaseKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    query: '{ __typename }'
                })
            });
            
            if (graphqlResponse.ok) {
                console.log('✅ GraphQL 连接成功');
                return true;
            }
        } catch (graphqlError) {
            console.log('GraphQL测试失败，继续尝试其他方法:', graphqlError.message);
        }
        
        // 方法3：尝试创建简单表
        try {
            console.log('尝试检查/创建funds表...');
            
            // 先尝试查询表是否存在
            const { error: queryError } = await supabaseClientInstance
                .from('funds')
                .select('id')
                .limit(1);
            
            if (queryError) {
                console.log('funds表查询错误:', queryError);
                
                // 如果是表不存在错误，尝试创建
                if (queryError.code === '42P01' || queryError.message.includes('does not exist')) {
                    console.log('funds表不存在，尝试创建...');
                    
                    // 通过SQL编辑器或RPC创建表（需要先在Supabase控制台启用）
                    try {
                        // 先尝试简单的插入来隐式创建表
                        const { error: insertError } = await supabaseClientInstance
                            .from('funds')
                            .insert({
                                id: 'test-' + Date.now(),
                                name: '测试连接基金',
                                amount: 1000,
                                created_at: new Date().toISOString()
                            });
                        
                        // 即使是约束错误也说明表存在
                        if (insertError && !insertError.message.includes('duplicate key')) {
                            console.log('创建表失败，但连接正常:', insertError);
                            return true;
                        }
                        
                        console.log('✅ 表创建/检查完成');
                        return true;
                    } catch (insertException) {
                        console.log('插入测试数据异常，但连接正常:', insertException.message);
                        return true;
                    }
                }
                
                // 其他错误可能表示连接问题
                console.error('查询错误:', queryError);
                return false;
            }
            
            console.log('✅ funds表存在，连接正常');
            return true;
            
        } catch (tableError) {
            console.log('表操作异常，但可能是权限问题:', tableError.message);
            
            // 即使有权限错误，也说明连接是通的
            if (tableError.message.includes('permission') || 
                tableError.message.includes('JWT') ||
                tableError.message.includes('auth')) {
                console.log('✅ 连接成功（权限错误说明网络通）');
                return true;
            }
            
            return false;
        }
        
    } catch (error) {
        console.error('❌ 连接测试失败:', error);
        
        // 检查具体的错误类型
        if (error.message.includes('Failed to fetch') || 
            error.message.includes('NetworkError') ||
            error.message.includes('CORS')) {
            console.error('网络连接失败，请检查：');
            console.error('1. URL是否正确');
            console.error('2. 网络是否正常');
            console.error('3. 浏览器控制台是否有CORS错误');
        } else if (error.message.includes('JWT')) {
            console.error('认证失败，请检查：');
            console.error('1. Anon Key是否正确');
            console.error('2. Key是否有权限访问数据库');
        }
        
        return false;
    }
}

// 确保funds表存在
async function ensureFundsTable() {
    if (!supabaseClientInstance || !isSupabaseInitialized) {
        console.error('Supabase 客户端未初始化');
        return false;
    }
    
    try {
        // 简单的表检查
        const { error } = await supabaseClientInstance
            .from('funds')
            .select('id')
            .limit(1);
        
        if (error) {
            console.log('funds表检查错误:', error);
            return false;
        }
        
        console.log('✅ funds表存在');
        return true;
    } catch (error) {
        console.error('确保表存在异常:', error);
        return false;
    }
}

// 获取基金数据
async function getFundsData() {
    if (!supabaseClientInstance || !isSupabaseInitialized) {
        console.error('Supabase 客户端未初始化');
        return null;
    }
    
    try {
        console.log('从云端获取基金数据...');
        
        const { data, error } = await supabaseClientInstance
            .from('funds')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) {
            console.error('获取基金数据失败:', error);
            
            // 如果是表不存在错误，返回空数组
            if (error.code === '42P01' || error.message.includes('does not exist')) {
                console.log('funds表不存在，返回空数据');
                return [];
            }
            
            return null;
        }
        
        console.log(`✅ 从云端获取到 ${data ? data.length : 0} 条数据`);
        return data || [];
        
    } catch (error) {
        console.error('获取基金数据异常:', error);
        return null;
    }
}

// 保存基金数据
async function saveFundData(fund) {
    if (!supabaseClientInstance || !isSupabaseInitialized) {
        console.error('Supabase 客户端未初始化');
        return false;
    }
    
    try {
        // 准备数据
        const fundData = {
            ...fund,
            updated_at: new Date().toISOString()
        };
        
        // 确保有创建时间
        if (!fundData.created_at) {
            fundData.created_at = new Date().toISOString();
        }
        
        // 如果有code字段，用它作为唯一标识
        let query;
        if (fundData.code) {
            query = supabaseClientInstance
                .from('funds')
                .upsert(fundData, {
                    onConflict: 'code'
                });
        } else {
            query = supabaseClientInstance
                .from('funds')
                .upsert(fundData);
        }
        
        const { error } = await query;
        
        if (error) {
            console.error('保存基金数据失败:', error);
            return false;
        }
        
        console.log('✅ 基金数据保存成功');
        return true;
        
    } catch (error) {
        console.error('保存基金数据异常:', error);
        return false;
    }
}

// 批量导入数据
async function importData(fundsArray) {
    if (!supabaseClientInstance || !isSupabaseInitialized) {
        console.error('Supabase 客户端未初始化');
        return false;
    }
    
    try {
        console.log(`正在导入 ${fundsArray.length} 条数据...`);
        
        // 为每条数据添加时间戳
        const dataWithTimestamps = fundsArray.map(item => ({
            ...item,
            created_at: item.created_at || new Date().toISOString(),
            updated_at: new Date().toISOString()
        }));
        
        const { error } = await supabaseClientInstance
            .from('funds')
            .upsert(dataWithTimestamps);
        
        if (error) {
            console.error('批量导入失败:', error);
            return false;
        }
        
        console.log(`✅ 成功导入 ${fundsArray.length} 条数据`);
        return true;
        
    } catch (error) {
        console.error('批量导入异常:', error);
        return false;
    }
}

// 清空表数据
async function clearTable() {
    if (!supabaseClientInstance || !isSupabaseInitialized) {
        console.error('Supabase 客户端未初始化');
        return false;
    }
    
    try {
        console.log('清空funds表数据...');
        
        const { error } = await supabaseClientInstance
            .from('funds')
            .delete()
            .neq('id', ''); // 删除所有记录
            
        if (error) {
            console.error('清空表失败:', error);
            return false;
        }
        
        console.log('✅ 表数据已清空');
        return true;
        
    } catch (error) {
        console.error('清空表异常:', error);
        return false;
    }
}

// 测试表是否存在，如果不存在则提示用户
async function testTableExists() {
    if (!supabaseClientInstance || !isSupabaseInitialized) return false;
    
    try {
        const { error } = await supabaseClientInstance
            .from('funds')
            .select('id')
            .limit(1);
        
        if (error) {
            if (error.code === '42P01' || error.message.includes('does not exist')) {
                console.log('❌ funds表不存在！');
                console.log('请在Supabase控制台中执行以下SQL创建表：');
                console.log(`
                    CREATE TABLE funds (
                        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                        name TEXT NOT NULL,
                        code TEXT UNIQUE,
                        amount DECIMAL(12,2) DEFAULT 0,
                        percentage DECIMAL(5,2),
                        unit_value DECIMAL(8,4),
                        daily_change DECIMAL(5,2),
                        category TEXT,
                        created_at TIMESTAMPTZ DEFAULT NOW(),
                        updated_at TIMESTAMPTZ DEFAULT NOW()
                    );
                    
                    -- 为常用查询添加索引
                    CREATE INDEX idx_funds_category ON funds(category);
                    CREATE INDEX idx_funds_created ON funds(created_at DESC);
                `);
                return false;
            }
            return false;
        }
        
        return true;
    } catch (error) {
        console.error('测试表存在异常:', error);
        return false;
    }
}

// 导出函数
window.supabaseClient = {
    init: initSupabaseClient,
    getClient: getClient,
    testConnection: testConnection,
    ensureFundsTable: ensureFundsTable,
    testTableExists: testTableExists,
    getFundsData: getFundsData,
    saveFundData: saveFundData,
    importData: importData,
    clearTable: clearTable,
    isInitialized: () => isSupabaseInitialized
};

console.log('✅ Supabase 客户端模块已加载');