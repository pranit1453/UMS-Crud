from functools import wraps

from flask_login import current_user


def role_required(*allowed_roles):
    """Decorator to restrict route access to users with specified roles."""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            if not current_user.is_authenticated:
                return {"error": "Authentication required"}, 401
            user_role = current_user.role
            if not user_role or user_role.name not in allowed_roles:
                return {"error": "Insufficient permissions"}, 403
            return func(*args, **kwargs)
        return wrapper
    return decorator