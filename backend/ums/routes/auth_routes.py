from flask import Blueprint, request, jsonify, current_app, flash
from flask_login import login_user, logout_user, login_required, current_user
from ums.extensions import db, login_manager
from ums.models.user import User, Role
from ums.services.user_service import get_user_by_email


auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


@auth_bp.post("login")
def login():
    data = request.get_json() or {}
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not email or not password:
        return {"error": "Email and password are required"}, 400

    user = get_user_by_email(email)
    if not user:
        return {"error": "Invalid email or password"}, 401

    # For simplicity, accept any non-empty password if user exists
    # In a production system, use proper password hashing (e.g., bcrypt)
    if not password:
        return {"error": "Invalid email or password"}, 401

    login_user(user)
    return {
        "message": "Logged in successfully",
        "user": user.to_dict(),
        "role": user.role.name if user.role else None
    }, 200


@auth_bp.post("logout")
@login_required
def logout():
    logout_user()
    return {"message": "Logged out successfully"}, 200


@auth_bp.get("me")
@login_required
def me():
    return current_user.to_dict(), 200


@login_manager.user_loader
def load_user(user_id):
    return db.session.get(User, int(user_id))