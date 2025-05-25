from flask import Blueprint, request, jsonify
from src.models.models import db, UserSettings

settings_bp = Blueprint('settings', __name__)

@settings_bp.route('/', methods=['GET'])
def get_settings():
    """获取用户设置"""
    # 获取唯一的用户设置（简化版本，实际应用可能需要用户认证）
    settings = UserSettings.query.first()
    
    # 如果没有设置，创建默认设置
    if not settings:
        settings = UserSettings()
        db.session.add(settings)
        db.session.commit()
    
    return jsonify({
        'success': True,
        'data': settings.to_dict()
    }), 200

@settings_bp.route('/', methods=['PUT'])
def update_settings():
    """更新用户设置"""
    settings = UserSettings.query.first()
    
    # 如果没有设置，创建默认设置
    if not settings:
        settings = UserSettings()
        db.session.add(settings)
    
    data = request.json
    
    if data.get('theme'):
        settings.theme = data.get('theme')
    if data.get('layout'):
        settings.layout = data.get('layout')
    if 'auto_save' in data:
        settings.auto_save = data.get('auto_save')
    if data.get('last_opened_node_id'):
        settings.last_opened_node_id = data.get('last_opened_node_id')
    
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': '设置更新成功',
        'data': settings.to_dict()
    }), 200
