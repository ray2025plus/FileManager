from flask import Blueprint, request, jsonify
from src.models.models import db, Edge, Node

edges_bp = Blueprint('edges', __name__)

@edges_bp.route('/', methods=['GET'])
def get_all_edges():
    """获取所有边（关系）"""
    edges = Edge.query.all()
    return jsonify({
        'success': True,
        'data': [edge.to_dict() for edge in edges]
    }), 200

@edges_bp.route('/<int:edge_id>', methods=['GET'])
def get_edge(edge_id):
    """获取单个边（关系）"""
    edge = Edge.query.get(edge_id)
    if not edge:
        return jsonify({
            'success': False,
            'message': '关系不存在'
        }), 404
    
    return jsonify({
        'success': True,
        'data': edge.to_dict()
    }), 200

@edges_bp.route('/', methods=['POST'])
def create_edge():
    """创建新边（关系）"""
    data = request.json
    
    if not data or not data.get('source_id') or not data.get('target_id'):
        return jsonify({
            'success': False,
            'message': '源节点和目标节点不能为空'
        }), 400
    
    # 验证节点是否存在
    source_node = Node.query.get(data.get('source_id'))
    target_node = Node.query.get(data.get('target_id'))
    
    if not source_node or not target_node:
        return jsonify({
            'success': False,
            'message': '源节点或目标节点不存在'
        }), 404
    
    new_edge = Edge(
        source_id=data.get('source_id'),
        target_id=data.get('target_id'),
        label=data.get('label')
    )
    
    db.session.add(new_edge)
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': '关系创建成功',
        'data': new_edge.to_dict()
    }), 201

@edges_bp.route('/<int:edge_id>', methods=['PUT'])
def update_edge(edge_id):
    """更新边（关系）"""
    edge = Edge.query.get(edge_id)
    if not edge:
        return jsonify({
            'success': False,
            'message': '关系不存在'
        }), 404
    
    data = request.json
    
    if data.get('label'):
        edge.label = data.get('label')
    
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': '关系更新成功',
        'data': edge.to_dict()
    }), 200

@edges_bp.route('/<int:edge_id>', methods=['DELETE'])
def delete_edge(edge_id):
    """删除边（关系）"""
    edge = Edge.query.get(edge_id)
    if not edge:
        return jsonify({
            'success': False,
            'message': '关系不存在'
        }), 404
    
    db.session.delete(edge)
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': '关系删除成功'
    }), 200

@edges_bp.route('/node/<int:node_id>', methods=['GET'])
def get_node_edges(node_id):
    """获取与特定节点相关的所有边（关系）"""
    node = Node.query.get(node_id)
    if not node:
        return jsonify({
            'success': False,
            'message': '节点不存在'
        }), 404
    
    # 获取所有相关的边
    outgoing = node.outgoing_edges.all()
    incoming = node.incoming_edges.all()
    
    return jsonify({
        'success': True,
        'data': {
            'outgoing': [edge.to_dict() for edge in outgoing],
            'incoming': [edge.to_dict() for edge in incoming]
        }
    }), 200
