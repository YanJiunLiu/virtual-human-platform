
def load_system(request, system):
    return system(request)

def decorator_request(request, system):
    request.system = load_system(request=request, system=system)
    return request