__version__ = "1.0.0"
__author__ = "X-Drone"


from .config import Settings

settings = Settings()


__all__ = [
    "__version__",
    "__author__",
    'settings',
]
