/**
 * 应用主模块 - 处理整体应用逻辑和用户交互
 */

// 全局API别名，确保所有API调用指向ApiService
window.API = window.ApiService;

document.addEventListener('DOMContentLoaded', () => {
    // 确保API对象可用
    if (!window.API && window.ApiService) {
        window.API = window.ApiService;
        console.log("已创建全局API别名指向ApiService");
    }
    
    // 初始化应用
    const app = new App();
    window.app = app; // 暴露app到全局作用域，便于调试
    app.init();
});

class App {
    constructor() {
        // 初始化状态
        this.nodes = [];
        this.edges = [];
        this.settings = null;
        this.currentNodeId = null;
        
        // 初始化图管理器
        this.graphManager = new GraphManager('graph-container');
        
        // DOM元素引用
        this.elements = {
            // 节点列表
            nodeList: document.getElementById('node-list'),
            
            // 搜索
            searchInput: document.getElementById('search-input'),
            searchBtn: document.getElementById('search-btn'),
            
            // 节点详情
            nodeDetails: document.getElementById('node-details'),
            nodeForm: document.getElementById('node-form'),
            nodeId: document.getElementById('node-id'),
            nodeName: document.getElementById('node-name'),
            nodePath: document.getElementById('node-path'),
            nodeIsUrl: document.getElementById('node-is-url'),
            nodeNote: document.getElementById('node-note'),
            saveNodeBtn: document.getElementById('save-node-btn'),
            deleteNodeBtn: document.getElementById('delete-node-btn'),
            openNodeBtn: document.getElementById('open-node-btn'),
            closeDetailsBtn: document.getElementById('close-details-btn'),
            
            // 添加节点模态框
            addNodeBtn: document.getElementById('add-node-btn'),
            addNodeModal: document.getElementById('add-node-modal'),
            addNodeForm: document.getElementById('add-node-form'),
            newNodeName: document.getElementById('new-node-name'),
            newNodePath: document.getElementById('new-node-path'),
            newNodeIsUrl: document.getElementById('new-node-is-url'),
            newNodeNote: document.getElementById('new-node-note'),
            connectToNode: document.getElementById('connect-to-node'),
            createNodeBtn: document.getElementById('create-node-btn'),
            
            // 添加边模态框
            addEdgeModal: document.getElementById('add-edge-modal'),
            addEdgeForm: document.getElementById('add-edge-form'),
            edgeSourceId: document.getElementById('edge-source-id'),
            edgeTargetNode: document.getElementById('edge-target-node'),
            edgeLabel: document.getElementById('edge-label'),
            createEdgeBtn: document.getElementById('create-edge-btn'),
            
            // 设置
            settingsBtn: document.getElementById('settings-btn'),
            settingsModal: document.getElementById('settings-modal'),
            settingsForm: document.getElementById('settings-form'),
            themeSelect: document.getElementById('theme-select'),
            layoutSelect: document.getElementById('layout-select'),
            autoSaveCheckbox: document.getElementById('auto-save-checkbox'),
            saveSettingsBtn: document.getElementById('save-settings-btn'),
            
            // 其他UI元素
            collapseSidebarBtn: document.getElementById('collapse-sidebar-btn'),
            sidebar: document.querySelector('.sidebar'),
            toast: document.getElementById('toast'),
            closeModalBtns: document.querySelectorAll('.close-modal-btn'),
            cancelBtns: document.querySelectorAll('.cancel-btn')
        };
    }

    // 初始化应用
    async init() {
        try {
            // 确保API对象可用
            if (!window.API && window.ApiService) {
                window.API = window.ApiService;
                console.log("已在init中创建全局API别名指向ApiService");
            }
            
            // 初始化图形
            this.graphManager.init();
            
            // 加载用户设置
            await this.loadSettings();
            
            // 加载数据
            await this.loadData();
            
            // 注册事件监听器
            this._registerEventListeners();
            
            // 显示提示
            this.showToast('应用已初始化完成');
        } catch (error) {
            console.error('初始化应用失败:', error);
            this.showToast('初始化应用失败，请刷新页面重试', 'error');
        }
    }

    // 加载用户设置
    async loadSettings() {
        try {
            // 使用ApiService替代API
            this.settings = await window.ApiService.getSettings();
            
            // 应用设置
            this._applySettings();
        } catch (error) {
            console.error('加载设置失败:', error);
            // 使用默认设置
            this.settings = {
                theme: 'light',
                layout: 'cose-bilkent',
                auto_save: true
            };
        }
    }

    // 应用设置
    _applySettings() {
        // 应用主题
        if (this.settings.theme === 'dark') {
            document.body.classList.add('dark-theme');
            this.elements.themeSelect.value = 'dark';
        } else {
            document.body.classList.remove('dark-theme');
            this.elements.themeSelect.value = this.settings.theme || 'light';
        }
        
        // 应用布局
        this.elements.layoutSelect.value = this.settings.layout || 'cose-bilkent';
        this.graphManager.layout = this.settings.layout || 'cose-bilkent';
        
        // 应用自动保存
        this.elements.autoSaveCheckbox.checked = this.settings.auto_save !== false;
        
        // 如果有上次打开的节点，聚焦到该节点
        if (this.settings.last_opened_node_id) {
            setTimeout(() => {
                this.graphManager.focusNode(this.settings.last_opened_node_id);
            }, 1000);
        }
    }

    // 保存设置
    async saveSettings() {
        try {
            const settingsData = {
                theme: this.elements.themeSelect.value,
                layout: this.elements.layoutSelect.value,
                auto_save: this.elements.autoSaveCheckbox.checked,
                last_opened_node_id: this.currentNodeId
            };
            
            // 使用ApiService替代API
            this.settings = await window.ApiService.updateSettings(settingsData);
            
            // 应用设置
            this._applySettings();
            
            this.showToast('设置已保存');
        } catch (error) {
            console.error('保存设置失败:', error);
            this.showToast('保存设置失败', 'error');
        }
    }

    // 加载数据
    async loadData() {
        try {
            // 使用ApiService替代API
            // 加载节点
            this.nodes = await window.ApiService.getAllNodes();
            
            // 加载边
            this.edges = await window.ApiService.getAllEdges();
            
            // 更新图形
            this.graphManager.loadData(this.nodes, this.edges);
            
            // 更新节点列表
            this._updateNodeList();
            
            // 更新连接下拉列表
            this._updateNodeSelects();
        } catch (error) {
            console.error('加载数据失败:', error);
            this.showToast('加载数据失败', 'error');
        }
    }

    // 更新节点列表
    _updateNodeList() {
        this.elements.nodeList.innerHTML = '';
        
        if (this.nodes.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'empty-message';
            emptyMessage.textContent = '没有节点，点击"添加节点"创建';
            this.elements.nodeList.appendChild(emptyMessage);
            return;
        }
        
        this.nodes.forEach(node => {
            const nodeItem = document.createElement('div');
            nodeItem.className = 'node-item';
            nodeItem.dataset.id = node.id;
            
            if (this.currentNodeId === node.id) {
                nodeItem.classList.add('active');
            }
            
            const header = document.createElement('div');
            header.className = 'node-item-header';
            
            const name = document.createElement('div');
            name.className = 'node-item-name';
            name.textContent = node.name;
            
            const type = document.createElement('div');
            type.className = 'node-item-type';
            type.textContent = node.is_url ? 'URL' : '文件';
            
            header.appendChild(name);
            header.appendChild(type);
            
            const path = document.createElement('div');
            path.className = 'node-item-path';
            path.textContent = node.path;
            
            nodeItem.appendChild(header);
            nodeItem.appendChild(path);
            
            // 点击事件
            nodeItem.addEventListener('click', () => {
                this.selectNode(node.id);
            });
            
            this.elements.nodeList.appendChild(nodeItem);
        });
    }

    // 更新节点选择下拉列表
    _updateNodeSelects() {
        // 清空现有选项
        this.elements.connectToNode.innerHTML = '<option value="">无</option>';
        this.elements.edgeTargetNode.innerHTML = '';
        
        // 添加节点选项
        this.nodes.forEach(node => {
            const option = document.createElement('option');
            option.value = node.id;
            option.textContent = node.name;
            
            const optionClone = option.cloneNode(true);
            
            this.elements.connectToNode.appendChild(option);
            this.elements.edgeTargetNode.appendChild(optionClone);
        });
    }

    // 选择节点
    async selectNode(id) {
        try {
            // 获取节点详情 - 使用ApiService替代API
            const node = this.nodes.find(n => n.id === id);
            
            if (!node) {
                throw new Error(`找不到ID为${id}的节点`);
            }
            
            // 更新当前节点ID
            this.currentNodeId = node.id;
            
            // 更新表单
            this.elements.nodeId.value = node.id;
            this.elements.nodeName.value = node.name;
            this.elements.nodePath.value = node.path;
            this.elements.nodeIsUrl.checked = node.is_url;
            this.elements.nodeNote.value = node.note || '';
            
            // 显示节点详情面板
            this.elements.nodeDetails.classList.add('active');
            
            // 更新节点列表选中状态
            const nodeItems = this.elements.nodeList.querySelectorAll('.node-item');
            nodeItems.forEach(item => {
                if (parseInt(item.dataset.id) === node.id) {
                    item.classList.add('active');
                } else {
                    item.classList.remove('active');
                }
            });
            
            // 聚焦到图中的节点
            this.graphManager.focusNode(node.id);
            
            // 如果启用了自动保存，更新上次打开的节点
            if (this.settings.auto_save) {
                await window.ApiService.updateSettings({
                    last_opened_node_id: node.id
                });
            }
        } catch (error) {
            console.error(`选择节点(ID: ${id})失败:`, error);
            this.showToast('选择节点失败', 'error');
        }
    }

    // 保存节点
    async saveNode() {
        try {
            const id = parseInt(this.elements.nodeId.value);
            const nodeData = {
                name: this.elements.nodeName.value,
                path: this.elements.nodePath.value,
                is_url: this.elements.nodeIsUrl.checked,
                note: this.elements.nodeNote.value
            };
            
            // 更新节点 - 使用ApiService替代API
            const updatedNode = await window.ApiService.updateNode(id, nodeData);
            
            // 更新本地数据
            const index = this.nodes.findIndex(node => node.id === id);
            if (index !== -1) {
                this.nodes[index] = updatedNode;
            }
            
            // 更新图形
            this.graphManager.updateNode(id, updatedNode);
            
            // 更新节点列表
            this._updateNodeList();
            
            // 更新连接下拉列表
            this._updateNodeSelects();
            
            this.showToast('节点已保存');
        } catch (error) {
            console.error('保存节点失败:', error);
            this.showToast('保存节点失败', 'error');
        }
    }

    // 删除节点
    async deleteNode() {
        try {
            if (!confirm('确定要删除此节点吗？相关的所有连接也将被删除。')) {
                return;
            }
            
            const id = parseInt(this.elements.nodeId.value);
            
            // 删除节点 - 使用ApiService替代API
            await window.ApiService.deleteNode(id);
            
            // 更新本地数据
            this.nodes = this.nodes.filter(node => node.id !== id);
            this.edges = this.edges.filter(edge => edge.source_id !== id && edge.target_id !== id);
            
            // 更新图形
            this.graphManager.removeNode(id);
            
            // 更新节点列表
            this._updateNodeList();
            
            // 更新连接下拉列表
            this._updateNodeSelects();
            
            // 关闭详情面板
            this.elements.nodeDetails.classList.remove('active');
            
            // 清除当前节点ID
            this.currentNodeId = null;
            
            this.showToast('节点已删除');
        } catch (error) {
            console.error('删除节点失败:', error);
            this.showToast('删除节点失败', 'error');
        }
    }

    // 打开节点
    openNode() {
        const id = parseInt(this.elements.nodeId.value);
        const node = this.nodes.find(n => n.id === id);
        
        if (!node) {
            this.showToast('找不到节点', 'error');
            return;
        }
        
        // 根据节点类型打开
        if (node.is_url) {
            // 打开URL
            window.open(node.path, '_blank');
        } else {
            // 打开本地文件
            this._openLocalFile(node.path);
        }
    }

    // 打开本地文件
    _openLocalFile(path) {
        // 创建一个隐藏的a标签
        const link = document.createElement('a');
        link.href = `file://${path}`;
        link.target = '_blank';
        
        // 添加到文档并点击
        document.body.appendChild(link);
        link.click();
        
        // 清理
        setTimeout(() => {
            document.body.removeChild(link);
        }, 100);
    }

    // 创建新节点
    async createNode() {
        try {
            console.log("开始创建节点...");
            
            const nodeData = {
                name: this.elements.newNodeName.value,
                path: this.elements.newNodePath.value,
                is_url: this.elements.newNodeIsUrl.checked,
                note: this.elements.newNodeNote.value
            };
            
            console.log("节点数据:", nodeData);
            console.log("API对象:", window.API);
            console.log("ApiService对象:", window.ApiService);
            
            // 创建节点 - 使用ApiService替代API
            const newNode = await window.ApiService.createNode(nodeData);
            console.log("节点创建成功:", newNode);
            
            // 更新本地数据
            this.nodes.push(newNode);
            
            // 更新图形
            this.graphManager.addNode(newNode);
            
            // 如果选择了连接到节点，创建边
            const connectToId = parseInt(this.elements.connectToNode.value);
            if (connectToId) {
                const edgeData = {
                    source_id: connectToId,
                    target_id: newNode.id,
                    label: ''
                };
                
                // 创建边 - 使用ApiService替代API
                const newEdge = await window.ApiService.createEdge(edgeData);
                
                // 更新本地数据
                this.edges.push(newEdge);
                
                // 更新图形
                this.graphManager.addEdge(newEdge);
            }
            
            // 更新节点列表
            this._updateNodeList();
            
            // 更新连接下拉列表
            this._updateNodeSelects();
            
            // 关闭模态框
            this.closeModal(this.elements.addNodeModal);
            
            // 重置表单
            this.elements.addNodeForm.reset();
            
            // 选择新创建的节点
            this.selectNode(newNode.id);
            
            this.showToast('节点已创建');
        } catch (error) {
            console.error('创建节点失败:', error);
            this.showToast('创建节点失败', 'error');
        }
    }

    // 创建新边
    async createEdge() {
        try {
            const edgeData = {
                source_id: parseInt(this.elements.edgeSourceId.value),
                target_id: parseInt(this.elements.edgeTargetNode.value),
                label: this.elements.edgeLabel.value
            };
            
            // 验证
            if (!edgeData.source_id || !edgeData.target_id) {
                this.showToast('请选择源节点和目标节点', 'error');
                return;
            }
            
            if (edgeData.source_id === edgeData.target_id) {
                this.showToast('源节点和目标节点不能相同', 'error');
                return;
            }
            
            // 检查是否已存在相同的边
            const existingEdge = this.edges.find(edge => 
                edge.source_id === edgeData.source_id && 
                edge.target_id === edgeData.target_id
            );
            
            if (existingEdge) {
                this.showToast('已存在相同的连接', 'error');
                return;
            }
            
            // 创建边 - 使用ApiService替代API
            const newEdge = await window.ApiService.createEdge(edgeData);
            
            // 更新本地数据
            this.edges.push(newEdge);
            
            // 更新图形
            this.graphManager.addEdge(newEdge);
            
            // 关闭模态框
            this.closeModal(this.elements.addEdgeModal);
            
            // 重置表单
            this.elements.addEdgeForm.reset();
            
            this.showToast('连接已创建');
        } catch (error) {
            console.error('创建连接失败:', error);
            this.showToast('创建连接失败', 'error');
        }
    }

    // 搜索节点
    async searchNodes() {
        try {
            const query = this.elements.searchInput.value.trim();
            
            if (!query) {
                // 如果搜索框为空，显示所有节点
                await this.loadData();
                return;
            }
            
            // 搜索节点 - 使用ApiService替代API
            const results = await window.ApiService.searchNodes(query);
            
            // 更新本地数据
            this.nodes = results;
            
            // 更新节点列表
            this._updateNodeList();
            
            // 更新图形
            this.graphManager.filterNodes(results.map(node => node.id));
            
            this.showToast(`找到 ${results.length} 个结果`);
        } catch (error) {
            console.error('搜索节点失败:', error);
            this.showToast('搜索节点失败', 'error');
        }
    }

    // 显示添加节点模态框
    showAddNodeModal() {
        // 重置表单
        this.elements.addNodeForm.reset();
        
        // 显示模态框
        this.elements.addNodeModal.classList.add('active');
    }

    // 显示添加边模态框
    showAddEdgeModal() {
        // 重置表单
        this.elements.addEdgeForm.reset();
        
        // 如果当前有选中的节点，设置为源节点
        if (this.currentNodeId) {
            this.elements.edgeSourceId.value = this.currentNodeId;
        }
        
        // 显示模态框
        this.elements.addEdgeModal.classList.add('active');
    }

    // 显示设置模态框
    showSettingsModal() {
        // 应用当前设置到表单
        this.elements.themeSelect.value = this.settings.theme || 'light';
        this.elements.layoutSelect.value = this.settings.layout || 'cose-bilkent';
        this.elements.autoSaveCheckbox.checked = this.settings.auto_save !== false;
        
        // 显示模态框
        this.elements.settingsModal.classList.add('active');
    }

    // 关闭模态框
    closeModal(modal) {
        modal.classList.remove('active');
    }

    // 切换侧边栏
    toggleSidebar() {
        this.elements.sidebar.classList.toggle('collapsed');
    }

    // 显示提示
    showToast(message, type = 'success') {
        // 创建提示元素
        const toast = document.createElement('div');
        toast.className = `toast-message ${type}`;
        toast.textContent = message;
        
        // 添加到文档
        this.elements.toast.appendChild(toast);
        
        // 自动关闭
        setTimeout(() => {
            toast.classList.add('fade-out');
            setTimeout(() => {
                this.elements.toast.removeChild(toast);
            }, 300);
        }, 3000);
    }

    // 注册事件监听器
    _registerEventListeners() {
        // 添加节点按钮
        this.elements.addNodeBtn.addEventListener('click', () => {
            this.showAddNodeModal();
        });
        
        // 创建节点按钮
        this.elements.createNodeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.createNode();
        });
        
        // 保存节点按钮
        this.elements.saveNodeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.saveNode();
        });
        
        // 删除节点按钮
        this.elements.deleteNodeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.deleteNode();
        });
        
        // 打开节点按钮
        this.elements.openNodeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.openNode();
        });
        
        // 关闭详情按钮
        this.elements.closeDetailsBtn.addEventListener('click', () => {
            this.elements.nodeDetails.classList.remove('active');
            this.currentNodeId = null;
        });
        
        // 搜索按钮
        this.elements.searchBtn.addEventListener('click', () => {
            this.searchNodes();
        });
        
        // 搜索输入框回车
        this.elements.searchInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                this.searchNodes();
            }
        });
        
        // 设置按钮
        this.elements.settingsBtn.addEventListener('click', () => {
            this.showSettingsModal();
        });
        
        // 保存设置按钮
        this.elements.saveSettingsBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.saveSettings();
            this.closeModal(this.elements.settingsModal);
        });
        
        // 切换侧边栏按钮
        this.elements.collapseSidebarBtn.addEventListener('click', () => {
            this.toggleSidebar();
        });
        
        // 关闭模态框按钮
        this.elements.closeModalBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const modal = btn.closest('.modal');
                this.closeModal(modal);
            });
        });
        
        // 取消按钮
        this.elements.cancelBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const modal = btn.closest('.modal');
                this.closeModal(modal);
            });
        });
        
        // 点击模态框背景关闭
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal(modal);
                }
            });
        });
        
        // 图形节点点击事件
        this.graphManager.onNodeClick = (nodeId) => {
            this.selectNode(nodeId);
        };
        
        // 图形添加边事件
        this.graphManager.onAddEdge = (sourceId, targetId) => {
            this.elements.edgeSourceId.value = sourceId;
            this.elements.edgeTargetNode.value = targetId;
            this.showAddEdgeModal();
        };
    }
}
