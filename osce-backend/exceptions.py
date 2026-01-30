import sys
import traceback

import rest_framework.exceptions
from django.core.exceptions import (
    ObjectDoesNotExist,
    PermissionDenied,
    ValidationError,
)
from django.db import IntegrityError, InternalError, OperationalError
from django.http import Http404
from requests import HTTPError
from rest_framework.exceptions import APIException
from rest_framework.views import exception_handler
from rest_framework_simplejwt.exceptions import AuthenticationFailed, InvalidToken


class AuthenticationFaileds(APIException):
    status_code = 401
    default_detail = "User not found."
    default_code = "user_not_found"


class InvalidTokens(APIException):
    status_code = 401
    default_detail = "Given token not valid for any token type."
    default_code = "token_not_valid"


class ServiceUnavailable(APIException):
    status_code = 503
    default_detail = "Service temporarily unavailable, try again later."
    default_code = "service_unavailable"


class InternalServerError(APIException):
    status_code = 500
    default_detail = "Internal Server Error"
    default_code = "internal_server_error"


class ObjectdoesNotExist(APIException):
    status_code = 404
    default_detail = "Object does not exist"
    default_code = "object_does_not_exist"


class RequestsException(APIException):
    status_code = 422
    default_detail = "Requests Exceptions"
    default_code = "requests_exceptions"


class FileIsExisted(APIException):
    status_code = 400
    default_detail = "File Is Existed"
    default_code = "file_is_exist"


class BadRequest(APIException):
    status_code = 400
    default_detail = "Bad Request"
    default_code = "bad_request"


class ValidationErrors(APIException):
    status_code = 400
    default_detail = "Validation Error"
    default_code = "Validation_Error"


def _check_exceptions(exc, context):
    if exc.__class__.__module__ == "rest_framework.exceptions":
        return exc, context

    elif isinstance(exc, (InvalidToken, AuthenticationFailed)):
        error = eval(f"{exc.__class__.__name__}s")(detail=exc.args[0], code=exc.default_code)
        return error, context

    elif isinstance(exc, (ServiceUnavailable, FileIsExisted, BadRequest)):
        error = exc.__class__(detail=exc.args[0])
        return error, context

    elif isinstance(exc, (IntegrityError, InternalError, OperationalError)):
        if len(exc.args) >1:
            error = InternalServerError(detail=exc.args[1])
        else:
            error = InternalServerError(detail=exc.args[0])
        return error, context

    elif isinstance(exc, HTTPError):
        error = RequestsException(detail=exc.args[0])
        return error, context

    elif isinstance(exc, PermissionDenied):
        error = rest_framework.exceptions.PermissionDenied()
        return error, context

    elif isinstance(exc, (ObjectDoesNotExist, Http404)):
        error = ObjectdoesNotExist(detail=exc.args[0])
        return error, context

    elif isinstance(exc, ValidationError):
        error = ValidationErrors(detail=exc.args[0])
        return error, context

    else:
        detail = None
        if exc.args:
            detail = exc.args[0] if len(exc.args) == 1 else exc.args[1]
        error = InternalServerError(detail=detail)
        return error, context


def csmu_exception_handler(exc, context):
    # Call REST framework's default exception handler first,
    # to get the standard error response.

    exc, context = _check_exceptions(exc, context)
    response = exception_handler(exc, context)
    _, _, tb = sys.exc_info()
    callstacks = traceback.extract_tb(tb)[:-1]
    trace = ",".join([f"F:{'/'.join(stack[0].split('/')[-4:])}, L:{stack[1]}, I:{stack[2]}" for stack in callstacks])

    if isinstance(exc, rest_framework.exceptions.ValidationError):
        # The format is different so using the default format
        pass
    elif isinstance(exc, (InvalidTokens, AuthenticationFaileds)):
        response.data["code"] = exc.default_code
    # Now add the HTTP status code to the response.
    elif isinstance(response.data, list):
        response.data = [data for data in response.data if data]
        for i, data in enumerate(response.data):
            if not data.get("code"):
                data["code"] = exc[i].get_codes()
    else:
        if not response.data.get("code"):
            response.data["code"] = exc.get_codes()
    setattr(response, "trace", {"trace": trace})
    return response