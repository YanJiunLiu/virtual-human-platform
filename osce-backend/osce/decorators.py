from functools import wraps
from backend_api.decorators import decorator_request
from backend_api.system import CSMUSystem

def osce():
    def decorator(func):
        @wraps(func)
        def wrapper(view, request, *args, **kwargs):
            request = decorator_request(request, CSMUSystem, *args, **kwargs)
            return func(view, request, *args, **kwargs)

        return wrapper

    return decorator