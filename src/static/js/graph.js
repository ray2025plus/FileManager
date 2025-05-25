/**
 * 关系图模块 - 处理图形可视化和交互
 */

// 确保布局扩展可用
(function() {
    // 默认布局选项
    const defaultLayout = 'cose';
    
    // 检查并注册布局扩展
    if (typeof cytoscape !== 'undefined') {
        // 注册cose-bilkent布局（如果可用）
        if (typeof cytoscapeCoseBilkent !== 'undefined') {
            cytoscape.use(cytoscapeCoseBilkent);
            console.log("已注册cose-bilkent布局");
        }
        
        // 注册force布局（如果可用）
        if (typeof cytoscape.layouts.force !== 'undefined') {
            console.log("force布局已可用");
        } else {
            // 创建一个简单的force布局别名指向cose
            cytoscape.layouts.force = cytoscape.layouts.cose;
            console.log("已创建force布局别名指向cose");
        }
    } else {
        console.error("cytoscape未定义，无法注册布局扩展");
    }
})();

class GraphManager {
    constructor(containerId) {
        this.containerId = containerId;
        this.cy = null;
        this.selectedNode = null;
        this.layout = 'cose';  // 默认使用cose布局，更可靠
        this.nodeStyle = {
            file: {
                'background-color': '#4a6ee0',
                'background-image': 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" width="18px" height="18px"><path d="M0 0h24v24H0z" fill="none"/><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>',
                'background-position-x': '50%',
                'background-position-y': '50%',
                'background-width': '60%',
                'background-height': '60%',
                'background-fit': 'contain'
            },
            url: {
                'background-color': '#e67e22',
                'background-image': 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" width="18px" height="18px"><path d="M0 0h24v24H0z" fill="none"/><path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/></svg>',
                'background-position-x': '50%',
                'background-position-y': '50%',
                'background-width': '60%',
                'background-height': '60%',
                'background-fit': 'contain'
            }
        };
    }

    // 初始化关系图
    init() {
        // 确保布局扩展可用
        this._ensureLayoutExtensions();
        
        this.cy = cytoscape({
            container: document.getElementById(this.containerId),
            style: [
                {
                    selector: 'node',
                    style: {
                        'label': 'data(name)',
                        'text-valign': 'bottom',
                        'text-halign': 'center',
                        'text-margin-y': 10,
                        'text-wrap': 'ellipsis',
                        'text-max-width': '80px',
                        'width': 50,
                        'height': 50,
                        'font-size': 12,
                        'border-width': 2,
                        'border-color': '#fff',
                        'border-opacity': 0.8,
                        'background-color': '#4a6ee0'
                    }
                },
                {
                    selector: 'node:selected',
                    style: {
                        'border-width': 3,
                        'border-color': '#ffd700',
                        'border-opacity': 1
                    }
                },
                {
                    selector: 'edge',
                    style: {
                        'width': 2,
                        'line-color': '#ccc',
                        'target-arrow-color': '#ccc',
                        'target-arrow-shape': 'triangle',
                        'curve-style': 'bezier',
                        'label': 'data(label)',
                        'text-rotation': 'autorotate',
                        'text-margin-y': -10,
                        'font-size': 10
                    }
                },
                {
                    selector: 'edge:selected',
                    style: {
                        'width': 3,
                        'line-color': '#ffd700',
                        'target-arrow-color': '#ffd700'
                    }
                }
            ],
            layout: {
                name: this.layout,
                animate: true,
                animationDuration: 500,
                nodeDimensionsIncludeLabels: true,
                randomize: false,
                fit: true,
                padding: 30
            },
            wheelSensitivity: 0.3
        });

        // 注册事件
        this._registerEvents();
        
        console.log("关系图初始化完成，使用布局:", this.layout);
    }
    
    // 确保布局扩展可用
    _ensureLayoutExtensions() {
        // 检查cose-bilkent布局
        if (typeof cytoscapeCoseBilkent !== 'undefined') {
            try {
                cytoscape.use(cytoscapeCoseBilkent);
                this.layout = 'cose-bilkent';
                console.log("已注册cose-bilkent布局");
            } catch (error) {
                console.warn("注册cose-bilkent布局失败:", error);
                this.layout = 'cose';
            }
        } else {
            console.warn("cytoscapeCoseBilkent未定义，使用默认cose布局");
            this.layout = 'cose';
        }
        
        // 确保force布局可用（通过别名）
        if (cytoscape.layouts && !cytoscape.layouts.force) {
            cytoscape.layouts.force = cytoscape.layouts.cose;
            console.log("已创建force布局别名指向cose");
        }
    }

    // 注册图形交互事件
    _registerEvents() {
        // 节点点击事件
        this.cy.on('tap', 'node', (event) => {
            const node = event.target;
            this.selectedNode = node;
            
            // 触发自定义事件
            const nodeData = node.data();
            const customEvent = new CustomEvent('node:selected', { 
                detail: { id: nodeData.id } 
            });
            document.dispatchEvent(customEvent);
        });

        // 边点击事件
        this.cy.on('tap', 'edge', (event) => {
            const edge = event.target;
            
            // 触发自定义事件
            const edgeData = edge.data();
            const customEvent = new CustomEvent('edge:selected', { 
                detail: { id: edgeData.id } 
            });
            document.dispatchEvent(customEvent);
        });

        // 背景点击事件（取消选择）
        this.cy.on('tap', (event) => {
            if (event.target === this.cy) {
                this.selectedNode = null;
                
                // 触发自定义事件
                const customEvent = new CustomEvent('selection:cleared');
                document.dispatchEvent(customEvent);
            }
        });

        // 右键菜单
        this.cy.on('cxttap', 'node', (event) => {
            const node = event.target;
            this.selectedNode = node;
            
            // 触发自定义事件
            const nodeData = node.data();
            const customEvent = new CustomEvent('node:contextmenu', { 
                detail: { 
                    id: nodeData.id,
                    position: {
                        x: event.originalEvent.clientX,
                        y: event.originalEvent.clientY
                    }
                } 
            });
            document.dispatchEvent(customEvent);
        });
    }

    // 加载数据
    loadData(nodes, edges) {
        // 清空现有数据
        this.cy.elements().remove();
        
        // 准备节点数据
        const nodeElements = nodes.map(node => {
            return {
                data: {
                    id: node.id.toString(),
                    name: node.name,
                    path: node.path,
                    is_url: node.is_url,
                    note: node.note
                }
            };
        });
        
        // 准备边数据
        const edgeElements = edges.map(edge => {
            return {
                data: {
                    id: edge.id.toString(),
                    source: edge.source_id.toString(),
                    target: edge.target_id.toString(),
                    label: edge.label || ''
                }
            };
        });
        
        // 添加元素到图中
        this.cy.add([...nodeElements, ...edgeElements]);
        
        // 应用节点样式
        this._applyNodeStyles();
        
        // 运行布局
        this.runLayout();
    }

    // 应用节点样式
    _applyNodeStyles() {
        this.cy.nodes().forEach(node => {
            const isUrl = node.data('is_url');
            const style = isUrl ? this.nodeStyle.url : this.nodeStyle.file;
            
            Object.entries(style).forEach(([property, value]) => {
                node.style(property, value);
            });
        });
    }

    // 添加节点
    addNode(nodeData) {
        try {
            console.log("添加节点到关系图:", nodeData);
            
            const node = this.cy.add({
                group: 'nodes',
                data: {
                    id: nodeData.id.toString(),
                    name: nodeData.name,
                    path: nodeData.path,
                    is_url: nodeData.is_url,
                    note: nodeData.note
                },
                position: {
                    x: this.cy.width() / 2,
                    y: this.cy.height() / 2
                }
            });
            
            // 应用样式
            const style = nodeData.is_url ? this.nodeStyle.url : this.nodeStyle.file;
            Object.entries(style).forEach(([property, value]) => {
                node.style(property, value);
            });
            
            // 运行布局
            this.runLayout();
            
            console.log("节点添加成功:", node.id());
            return node;
        } catch (error) {
            console.error("添加节点到关系图失败:", error);
            throw error;
        }
    }

    // 更新节点
    updateNode(id, nodeData) {
        const node = this.cy.getElementById(id.toString());
        if (!node.empty()) {
            node.data('name', nodeData.name);
            node.data('path', nodeData.path);
            node.data('is_url', nodeData.is_url);
            node.data('note', nodeData.note);
            
            // 更新样式
            const style = nodeData.is_url ? this.nodeStyle.url : this.nodeStyle.file;
            Object.entries(style).forEach(([property, value]) => {
                node.style(property, value);
            });
        }
    }

    // 删除节点
    removeNode(id) {
        const node = this.cy.getElementById(id.toString());
        if (!node.empty()) {
            this.cy.remove(node);
        }
    }

    // 添加边
    addEdge(edgeData) {
        const edge = this.cy.add({
            group: 'edges',
            data: {
                id: edgeData.id.toString(),
                source: edgeData.source_id.toString(),
                target: edgeData.target_id.toString(),
                label: edgeData.label || ''
            }
        });
        
        // 运行布局
        this.runLayout();
        
        return edge;
    }

    // 更新边
    updateEdge(id, edgeData) {
        const edge = this.cy.getElementById(id.toString());
        if (!edge.empty()) {
            edge.data('label', edgeData.label || '');
        }
    }

    // 删除边
    removeEdge(id) {
        const edge = this.cy.getElementById(id.toString());
        if (!edge.empty()) {
            this.cy.remove(edge);
        }
    }

    // 运行布局
    runLayout(layoutName = null) {
        try {
            if (layoutName) {
                // 验证布局是否存在
                if (cytoscape.layouts[layoutName]) {
                    this.layout = layoutName;
                } else {
                    console.warn(`布局 ${layoutName} 不存在，使用默认布局 ${this.layout}`);
                }
            }
            
            console.log("运行布局:", this.layout);
            
            const layout = this.cy.layout({
                name: this.layout,
                animate: true,
                animationDuration: 500,
                nodeDimensionsIncludeLabels: true,
                randomize: false,
                fit: true,
                padding: 30
            });
            
            layout.run();
        } catch (error) {
            console.error("运行布局失败:", error);
            
            // 尝试使用备用布局
            try {
                console.log("尝试使用备用布局: cose");
                const backupLayout = this.cy.layout({
                    name: 'cose',
                    animate: true,
                    animationDuration: 500
                });
                
                backupLayout.run();
            } catch (backupError) {
                console.error("备用布局也失败:", backupError);
            }
        }
    }

    // 聚焦到节点
    focusNode(id) {
        const node = this.cy.getElementById(id.toString());
        if (!node.empty()) {
            this.cy.animate({
                center: {
                    eles: node
                },
                zoom: 1.5,
                duration: 500
            });
            
            node.select();
            this.selectedNode = node;
        }
    }

    // 获取选中的节点
    getSelectedNode() {
        return this.selectedNode ? this.selectedNode.data() : null;
    }

    // 搜索节点
    searchNodes(query) {
        if (!query) return [];
        
        query = query.toLowerCase();
        return this.cy.nodes().filter(node => {
            const name = node.data('name').toLowerCase();
            const path = node.data('path').toLowerCase();
            const note = (node.data('note') || '').toLowerCase();
            
            return name.includes(query) || path.includes(query) || note.includes(query);
        });
    }

    // 高亮搜索结果
    highlightSearchResults(nodes) {
        // 重置所有节点样式
        this.cy.nodes().forEach(node => {
            node.style('opacity', 0.3);
        });
        
        // 高亮匹配的节点
        nodes.forEach(node => {
            node.style('opacity', 1);
        });
        
        // 如果没有搜索结果，显示所有节点
        if (nodes.length === 0) {
            this.cy.nodes().forEach(node => {
                node.style('opacity', 1);
            });
        }
    }

    // 重置搜索高亮
    resetHighlight() {
        this.cy.nodes().forEach(node => {
            node.style('opacity', 1);
        });
    }

    // 导出图数据
    exportData() {
        const nodes = this.cy.nodes().map(node => node.data());
        const edges = this.cy.edges().map(edge => edge.data());
        
        return { nodes, edges };
    }
}
