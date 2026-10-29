from flask import Flask
from flask_cors import CORS
from ums.config import Config
from ums.extensions import db, migrate, login_manager
from ums.routes.user_routes import user_bp
from ums.routes.auth_routes import auth_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    CORS(app)
    db.init_app(app)
    migrate.init_app(app, db)
    login_manager.init_app(app)

    app.register_blueprint(user_bp)
    app.register_blueprint(auth_bp)

    with app.app_context():
        try:
            db.create_all()
        except Exception:
            pass  # Database tables may be created via migrations

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
