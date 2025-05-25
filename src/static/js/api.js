/**
 * API 服务模块 - 处理与后端的所有通信
 */

// API基础URL
const API_BASE_URL = '/api';

// API服务对象
const ApiService = {
    /**
     * 获取所有节点
     * @returns {Promise} 包含所有节点的Promise
     */
    getAllNodes: async function() {
        try {
            const response = await fetch(`${API_BASE_URL}/nodes/`);
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.message || '获取节点失败');
            }
            
            return data.data;
        } catch (error) {
            console.error('获取节点失败:', error);
            throw error;
        }
    },
    
    /**
     * 创建新节点
     * @param {Object} nodeData 节点数据
     * @returns {Promise} 包含创建结果的Promise
     */
    createNode: async function(nodeData) {
        try {
            // 确保数据格式正确
            const payload = {
                name: nodeData.name,
                path: nodeData.path,
                is_url: nodeData.is_url || false,
                note: nodeData.note || ''
            };
            
            // 如果有连接节点，添加到payload
            if (nodeData.connect_to_id) {
                payload.connect_to_id = nodeData.connect_to_id;
            }
            
            console.log('发送创建节点请求:', payload);
            
            const response = await fetch(`${API_BASE_URL}/nodes/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
            
            const data = await response.json();
            console.log('创建节点响应:', data);
            
            if (!data.success) {
                throw new Error(data.message || '创建节点失败');
            }
            
            return data.data;
        } catch (error) {
            console.error('创建节点失败:', error);
            throw error;
        }
    },
    
    /**
     * 更新节点
     * @param {Number} nodeId 节点ID
     * @param {Object} nodeData 节点数据
     * @returns {Promise} 包含更新结果的Promise
     */
    updateNode: async function(nodeId, nodeData) {
        try {
            const response = await fetch(`${API_BASE_URL}/nodes/${nodeId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(nodeData)
            });
            
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.message || '更新节点失败');
            }
            
            return data.data;
        } catch (error) {
            console.error('更新节点失败:', error);
            throw error;
        }
    },
    
    /**
     * 删除节点
     * @param {Number} nodeId 节点ID
     * @returns {Promise} 包含删除结果的Promise
     */
    deleteNode: async function(nodeId) {
        try {
            const response = await fetch(`${API_BASE_URL}/nodes/${nodeId}`, {
                method: 'DELETE'
            });
            
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.message || '删除节点失败');
            }
            
            return true;
        } catch (error) {
            console.error('删除节点失败:', error);
            throw error;
        }
    },
    
    /**
     * 搜索节点
     * @param {String} query 搜索关键词
     * @returns {Promise} 包含搜索结果的Promise
     */
    searchNodes: async function(query) {
        try {
            const response = await fetch(`${API_BASE_URL}/nodes/search?q=${encodeURIComponent(query)}`);
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.message || '搜索节点失败');
            }
            
            return data.data;
        } catch (error) {
            console.error('搜索节点失败:', error);
            throw error;
        }
    },
    
    /**
     * 获取所有边
     * @returns {Promise} 包含所有边的Promise
     */
    getAllEdges: async function() {
        try {
            const response = await fetch(`${API_BASE_URL}/edges/`);
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.message || '获取边失败');
            }
            
            return data.data;
        } catch (error) {
            console.error('获取边失败:', error);
            throw error;
        }
    },
    
    /**
     * 创建新边
     * @param {Object} edgeData 边数据
     * @returns {Promise} 包含创建结果的Promise
     */
    createEdge: async function(edgeData) {
        try {
            const response = await fetch(`${API_BASE_URL}/edges/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(edgeData)
            });
            
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.message || '创建边失败');
            }
            
            return data.data;
        } catch (error) {
            console.error('创建边失败:', error);
            throw error;
        }
    },
    
    /**
     * 删除边
     * @param {Number} edgeId 边ID
     * @returns {Promise} 包含删除结果的Promise
     */
    deleteEdge: async function(edgeId) {
        try {
            const response = await fetch(`${API_BASE_URL}/edges/${edgeId}`, {
                method: 'DELETE'
            });
            
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.message || '删除边失败');
            }
            
            return true;
        } catch (error) {
            console.error('删除边失败:', error);
            throw error;
        }
    },
    
    /**
     * 获取用户设置
     * @returns {Promise} 包含用户设置的Promise
     */
    getSettings: async function() {
        try {
            const response = await fetch(`${API_BASE_URL}/settings/`);
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.message || '获取设置失败');
            }
            
            return data.data;
        } catch (error) {
            console.error('获取设置失败:', error);
            throw error;
        }
    },
    
    /**
     * 更新用户设置
     * @param {Object} settingsData 设置数据
     * @returns {Promise} 包含更新结果的Promise
     */
    updateSettings: async function(settingsData) {
        try {
            const response = await fetch(`${API_BASE_URL}/settings/`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(settingsData)
            });
            
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.message || '更新设置失败');
            }
            
            return data.data;
        } catch (error) {
            console.error('更新设置失败:', error);
            throw error;
        }
    }
};

// 导出API服务
window.ApiService = ApiService;
