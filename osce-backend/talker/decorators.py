from functools import wraps
from backend_api.decorators import decorator_request
from backend_api.system import WhisperSystem

def talker():
    def decorator(func):
        @wraps(func)
        def wrapper(view, request, *args, **kwargs):
            request = decorator_request(request, WhisperSystem, *args, **kwargs)
            return func(view, request, *args, **kwargs)

        return wrapper

    return decorator

def atalker():
    def decorator(func):
        @wraps(func)
        async def wrapper(view, request, *args, **kwargs):
            request = decorator_request(request, WhisperSystem, *args, **kwargs)
            return await func(view, request, *args, **kwargs)
        return wrapper
    return decorator
