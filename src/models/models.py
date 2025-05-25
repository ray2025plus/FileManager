from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class Node(db.Model):
    """节点模型，用于存储文件路径或网址"""
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)  # 节点名称
    path = db.Column(db.String(1024), nullable=False)  # 文件路径或网址
    is_url = db.Column(db.Boolean, default=False)  # 是否为网址
    note = db.Column(db.Text, nullable=True)  # 备注
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # 关系 - 作为源节点
    outgoing_edges = db.relationship('Edge', 
                                    foreign_keys='Edge.source_id',
                                    backref='source_node', 
                                    lazy='dynamic',
                                    cascade='all, delete-orphan')
    
    # 关系 - 作为目标节点
    incoming_edges = db.relationship('Edge', 
                                    foreign_keys='Edge.target_id',
                                    backref='target_node', 
                                    lazy='dynamic',
                                    cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'path': self.path,
            'is_url': self.is_url,
            'note': self.note,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class Edge(db.Model):
    """边模型，用于存储节点之间的关系"""
    id = db.Column(db.Integer, primary_key=True)
    source_id = db.Column(db.Integer, db.ForeignKey('node.id'), nullable=False)
    target_id = db.Column(db.Integer, db.ForeignKey('node.id'), nullable=False)
    label = db.Column(db.String(255), nullable=True)  # 关系标签
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'source_id': self.source_id,
            'target_id': self.target_id,
            'label': self.label,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class UserSettings(db.Model):
    """用户设置模型，用于存储用户偏好"""
    id = db.Column(db.Integer, primary_key=True)
    theme = db.Column(db.String(50), default='light')  # 主题设置
    layout = db.Column(db.String(50), default='force')  # 图布局算法
    auto_save = db.Column(db.Boolean, default=True)  # 自动保存设置
    last_opened_node_id = db.Column(db.Integer, db.ForeignKey('node.id'), nullable=True)  # 上次打开的节点
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'theme': self.theme,
            'layout': self.layout,
            'auto_save': self.auto_save,
            'last_opened_node_id': self.last_opened_node_id,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
