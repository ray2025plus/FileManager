import sys
sys.path.insert(0, '/home/ubuntu/file_graph_manager/file_graph_app')

from src.main import app
from src.models.models import db

with app.app_context():
    db.create_all()
    print('数据库表创建成功')
