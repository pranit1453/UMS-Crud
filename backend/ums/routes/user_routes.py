from flask import Blueprint, request
import ums.services.user_service as user_service

user_bp = Blueprint(
    "users",
    __name__,
    url_prefix="/api/users"
)

@user_bp.post("")
def create_user():
    data = request.get_json() or {}
    required_fields = ["firstName", "lastName", "email"]

    for field in required_fields:
        if not data.get(field) or not str(data.get(field)).strip():
            return {
                "error": f"Field '{field}' is required and cannot be empty"
            }, 400

    try:
        user = user_service.create_user(data)
        return {
            "message": "User created successfully",
            "data": user.to_dict()
        }, 201
    except ValueError as e:
        return {
            "error": str(e)
        }, 400
    except Exception as e:
        return {
            "error": f"An unexpected error occurred: {str(e)}"
        }, 500

@user_bp.get("")
def get_users():
    try:
        users = user_service.get_all_users()
        return {
            "count": len(users),
            "data": [user.to_dict() for user in users]
        }, 200
    except Exception as e:
        return {
            "error": f"Failed to fetch users: {str(e)}"
        }, 500

@user_bp.get("/<int:user_id>")
def get_user(user_id):
    try:
        user = user_service.get_user(user_id)
        if not user:
            return {
                "error": f"User with ID {user_id} not found"
            }, 404
        return {
            "data": user.to_dict()
        }, 200
    except Exception as e:
        return {
            "error": f"Error fetching user: {str(e)}"
        }, 500

@user_bp.put("/<int:user_id>")
def update_user(user_id):
    data = request.get_json() or {}
    try:
        user = user_service.update_user(user_id, data)
        if not user:
            return {
                "error": f"User with ID {user_id} not found"
            }, 404
        return {
            "message": "User updated successfully",
            "data": user.to_dict()
        }, 200
    except ValueError as e:
        return {
            "error": str(e)
        }, 400
    except Exception as e:
        return {
            "error": f"Error updating user: {str(e)}"
        }, 500

@user_bp.delete("/<int:user_id>")
def delete_user(user_id):
    try:
        deleted = user_service.delete_user(user_id)
        if not deleted:
            return {
                "error": f"User with ID {user_id} not found"
            }, 404
        return {
            "message": f"User with ID {user_id} deleted successfully"
        }, 200
    except Exception as e:
        return {
            "error": f"Error deleting user: {str(e)}"
        }, 500