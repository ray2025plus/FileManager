import sys
sys.path.insert(0, '/home/ubuntu/file_graph_manager/file_graph_app')

from src.main import app
from src.models.models import db, Node, Edge

# 使用应用上下文
with app.app_context():
    # 检查节点数据
    print('数据库节点内容:')
    nodes = Node.query.all()
    for node in nodes:
        print(f"ID: {node.id}, 名称: {node.name}, 路径: {node.path}, 是否URL: {node.is_url}, 备注: {node.note}")
    
    print('\n数据库边内容:')
    edges = Edge.query.all()
    for edge in edges:
        print(f"ID: {edge.id}, 源节点: {edge.source_id}, 目标节点: {edge.target_id}, 标签: {edge.label}")
    
    print(f"\n总计: {len(nodes)}个节点, {len(edges)}条边")
