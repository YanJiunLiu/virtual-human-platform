from django.contrib.auth import (
    sensitive_variables, _get_compatible_backends, PermissionDenied, user_login_failed, _clean_credentials)



@sensitive_variables("credentials")
def authenticate_teacher(request=None, **credentials):
    """
    If the given credentials are valid, return a User object.
    """
    for backend, backend_path in _get_compatible_backends(request, **credentials):
        try:
            user = backend.authenticate(request, **credentials)
        except PermissionDenied:
            # This backend says to stop in our tracks - this user should not be
            # allowed in at all.
            break
        if user is None:
            continue
        # handle superuser or not
        if role:= user.role:
            if role.name == 'Student':
                continue
        else:
            if not user.is_superuser:
                continue

        # Annotate the user object with the path of the backend.
        user.backend = backend_path
        return user

    # The credentials supplied are invalid to all backends, fire signal
    user_login_failed.send(
        sender=__name__, credentials=_clean_credentials(credentials), request=request
    )

@sensitive_variables("credentials")
def authenticate_user(request=None, **credentials):
    """
    If the given credentials are valid, return a User object.
    """
    for backend, backend_path in _get_compatible_backends(request, **credentials):
        try:
            user = backend.authenticate(request, **credentials)
        except PermissionDenied:
            # This backend says to stop in our tracks - this user should not be
            # allowed in at all.
            break
        if user is None:
            continue
        # handle superuser or no role
        if not user.is_superuser and not user.role:
            continue
        # Annotate the user object with the path of the backend.
        user.backend = backend_path
        return user

    # The credentials supplied are invalid to all backends, fire signal
    user_login_failed.send(
        sender=__name__, credentials=_clean_credentials(credentials), request=request
    )