from flask import Blueprint, request, jsonify
from src.models.models import db, Node, Edge, UserSettings
import traceback

nodes_bp = Blueprint('nodes', __name__)

@nodes_bp.route('/', methods=['GET'])
def get_all_nodes():
    """获取所有节点"""
    try:
        nodes = Node.query.all()
        return jsonify({
            'success': True,
            'data': [node.to_dict() for node in nodes]
        }), 200
    except Exception as e:
        print(f"获取所有节点时出错: {str(e)}")
        print(traceback.format_exc())
        return jsonify({
            'success': False,
            'message': f'获取节点失败: {str(e)}'
        }), 500

@nodes_bp.route('/<int:node_id>', methods=['GET'])
def get_node(node_id):
    """获取单个节点"""
    try:
        node = Node.query.get(node_id)
        if not node:
            return jsonify({
                'success': False,
                'message': '节点不存在'
            }), 404
        
        return jsonify({
            'success': True,
            'data': node.to_dict()
        }), 200
    except Exception as e:
        print(f"获取节点 {node_id} 时出错: {str(e)}")
        print(traceback.format_exc())
        return jsonify({
            'success': False,
            'message': f'获取节点失败: {str(e)}'
        }), 500

@nodes_bp.route('/', methods=['POST'])
def create_node():
    """创建新节点"""
    try:
        data = request.json
        
        if not data or not data.get('name') or not data.get('path'):
            return jsonify({
                'success': False,
                'message': '节点名称和路径不能为空'
            }), 400
        
        # 检查字段长度
        if len(data.get('name', '')) > 255:
            return jsonify({
                'success': False,
                'message': '节点名称不能超过255个字符'
            }), 400
            
        if len(data.get('path', '')) > 1024:
            return jsonify({
                'success': False,
                'message': '路径不能超过1024个字符'
            }), 400
        
        # 创建新节点
        new_node = Node(
            name=data.get('name'),
            path=data.get('path'),
            is_url=data.get('is_url', False),
            note=data.get('note')
        )
        
        db.session.add(new_node)
        db.session.commit()
        
        # 如果指定了连接节点，创建边
        if data.get('connect_to_id'):
            try:
                target_node = Node.query.get(data.get('connect_to_id'))
                if target_node:
                    new_edge = Edge(
                        source_id=new_node.id,
                        target_id=target_node.id,
                        label=data.get('edge_label', '')
                    )
                    db.session.add(new_edge)
                    db.session.commit()
            except Exception as edge_error:
                print(f"创建边时出错: {str(edge_error)}")
                print(traceback.format_exc())
                # 节点已创建成功，边创建失败不影响节点创建结果
        
        return jsonify({
            'success': True,
            'message': '节点创建成功',
            'data': new_node.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        print(f"创建节点时出错: {str(e)}")
        print(traceback.format_exc())
        return jsonify({
            'success': False,
            'message': f'节点创建失败: {str(e)}'
        }), 500

@nodes_bp.route('/<int:node_id>', methods=['PUT'])
def update_node(node_id):
    """更新节点"""
    try:
        node = Node.query.get(node_id)
        if not node:
            return jsonify({
                'success': False,
                'message': '节点不存在'
            }), 404
        
        data = request.json
        
        # 检查字段长度
        if data.get('name') and len(data.get('name')) > 255:
            return jsonify({
                'success': False,
                'message': '节点名称不能超过255个字符'
            }), 400
            
        if data.get('path') and len(data.get('path')) > 1024:
            return jsonify({
                'success': False,
                'message': '路径不能超过1024个字符'
            }), 400
        
        if data.get('name'):
            node.name = data.get('name')
        if data.get('path'):
            node.path = data.get('path')
        if 'is_url' in data:
            node.is_url = data.get('is_url')
        if 'note' in data:
            node.note = data.get('note')
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': '节点更新成功',
            'data': node.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        print(f"更新节点 {node_id} 时出错: {str(e)}")
        print(traceback.format_exc())
        return jsonify({
            'success': False,
            'message': f'节点更新失败: {str(e)}'
        }), 500

@nodes_bp.route('/<int:node_id>', methods=['DELETE'])
def delete_node(node_id):
    """删除节点"""
    try:
        node = Node.query.get(node_id)
        if not node:
            return jsonify({
                'success': False,
                'message': '节点不存在'
            }), 404
        
        db.session.delete(node)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': '节点删除成功'
        }), 200
    except Exception as e:
        db.session.rollback()
        print(f"删除节点 {node_id} 时出错: {str(e)}")
        print(traceback.format_exc())
        return jsonify({
            'success': False,
            'message': f'节点删除失败: {str(e)}'
        }), 500

@nodes_bp.route('/search', methods=['GET'])
def search_nodes():
    """搜索节点"""
    try:
        query = request.args.get('q', '')
        
        if not query:
            return jsonify({
                'success': False,
                'message': '搜索关键词不能为空'
            }), 400
        
        nodes = Node.query.filter(
            (Node.name.ilike(f'%{query}%')) | 
            (Node.path.ilike(f'%{query}%')) | 
            (Node.note.ilike(f'%{query}%'))
        ).all()
        
        return jsonify({
            'success': True,
            'data': [node.to_dict() for node in nodes]
        }), 200
    except Exception as e:
        print(f"搜索节点时出错: {str(e)}")
        print(traceback.format_exc())
        return jsonify({
            'success': False,
            'message': f'搜索节点失败: {str(e)}'
        }), 500
