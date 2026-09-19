from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from ums.extensions import db
from ums.models.user import User


def create_user(data):
    email_clean = data["email"].strip().lower()
    existing_user = db.session.scalars(
        select(User).where(User.email == email_clean)
    ).first()

    if existing_user:
        raise ValueError("A user with this email address already exists")

    user = User(
        first_name=data["firstName"].strip(),
        last_name=data["lastName"].strip(),
        email=email_clean,
        phone=data.get("phone", "").strip() if data.get("phone") else None
    )
    try:
        db.session.add(user)
        db.session.commit()
        return user
    except IntegrityError:
        db.session.rollback()
        raise ValueError("Database constraint error: duplicate entry or invalid field value")


def get_all_users():
    return list(db.session.scalars(select(User).order_by(User.id.asc())).all())


def get_user(user_id):
    return db.session.get(User, user_id)


def update_user(user_id, data):
    user = db.session.get(User, user_id)
    if not user:
        return None

    if "email" in data and data["email"]:
        new_email = data["email"].strip().lower()
        if new_email != user.email:
            existing = db.session.scalars(
                select(User).where(User.email == new_email)
            ).first()
            if existing:
                raise ValueError("A user with this email address already exists")
            user.email = new_email

    if "firstName" in data and data["firstName"]:
        user.first_name = data["firstName"].strip()

    if "lastName" in data and data["lastName"]:
        user.last_name = data["lastName"].strip()

    if "phone" in data:
        user.phone = data["phone"].strip() if data["phone"] else None

    try:
        db.session.commit()
        return user
    except IntegrityError:
        db.session.rollback()
        raise ValueError("Database constraint error during update")


def delete_user(user_id):
    user = db.session.get(User, user_id)
    if not user:
        return False
    db.session.delete(user)
    db.session.commit()
    return True