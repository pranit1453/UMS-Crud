from datetime import datetime, timezone
from typing import ClassVar
from sqlalchemy.orm import Mapped, mapped_column
from ums.extensions import db

class User(db.Model):
    __tablename__ = "users"

    query: ClassVar[db.Query]

    id: Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True
    )

    first_name: Mapped[str] = mapped_column(
        db.String(100),
        nullable=False
    )

    last_name: Mapped[str] = mapped_column(
        db.String(100),
        nullable=False
    )

    email: Mapped[str] = mapped_column(
        db.String(255),
        unique=True,
        nullable=False
    )

    phone: Mapped[str | None] = mapped_column(
        db.String(20),
        nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    updated_at: Mapped[datetime] = mapped_column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    def to_dict(self):
        return {
            "id": self.id,
            "firstName": self.first_name,
            "lastName": self.last_name,
            "email": self.email,
            "phone": self.phone,
            "createdAt": self.created_at.isoformat(),
            "updatedAt": self.updated_at.isoformat()
        }