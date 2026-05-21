__version__ = "1.0.0"
__author__ = "X-Drone"


from .db import DB
from .base import Base
# from .models import User

db = DB()

__all__ = [
    "__version__",
    "__author__",
    'db',
    'Base',
    # 'User',
]
