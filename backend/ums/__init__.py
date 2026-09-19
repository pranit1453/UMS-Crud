from flask import Flask
from flask_cors import CORS
from ums.config import Config
from ums.extensions import db, migrate
from ums.routes.user_routes import user_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    CORS(app)
    db.init_app(app)
    migrate.init_app(app, db)

    app.register_blueprint(user_bp)

    with app.app_context():
        db.create_all()

    @app.get("/")
    def index():
        return {
            "message": "User Management System REST API is running",
            "endpoints": {
                "health": "/health",
                "users": "/api/users"
            }
        }, 200

    @app.get("/health")
    def health():
        return {
            "status": "UP"
        }, 200

    return app
