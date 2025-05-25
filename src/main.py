from flask import Flask, render_template, send_from_directory
from flask_sqlalchemy import SQLAlchemy
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))  # DON'T CHANGE THIS !!!

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///file_graph.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# 初始化数据库
from src.models.models import db
db.init_app(app)

# 注册蓝图
from src.routes.nodes import nodes_bp
from src.routes.edges import edges_bp
from src.routes.settings import settings_bp

app.register_blueprint(nodes_bp, url_prefix='/api/nodes')
app.register_blueprint(edges_bp, url_prefix='/api/edges')
app.register_blueprint(settings_bp, url_prefix='/api/settings')

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/static/<path:path>')
def serve_static(path):
    return send_from_directory('static', path)

# 创建数据库表
with app.app_context():
    db.create_all()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
