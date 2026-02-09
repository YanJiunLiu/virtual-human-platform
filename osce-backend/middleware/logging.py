import asyncio
import json
import logging
import re

import arrow
from django.views.decorators.debug import sensitive_variables


@sensitive_variables("payload")
def _clean_payload(payload):
    """
    Clean a dictionary of payload of potentially sensitive info before
    sending to less secure logging.
    """
    sensitive_payload = re.compile("username|email|api|token|key|secret|password|signature", re.I)
    cleansed_substitute = "**********"
    for key in payload:
        if sensitive_payload.search(key):
            payload[key] = cleansed_substitute
    return payload


def _shorten_payload(payload):
    """
    Reduce a dictionary of payload with less content.
    """
    content = str(payload)[:200] + "..."
    return content


class ActivityMiddleware:
    logger = logging.getLogger("activity")
    sync_capable = True
    async_capable = True

    def __init__(self, get_response):
        self.get_response = get_response
        # One-time configuration and initialization.

    def _preprocess_view(self, request):
        event = {
            "start": arrow.utcnow().isoformat(),
            "category": "activity",
            "hostname": request.get_host(),
            "request": request.get_full_path(),
            "method": request.method,
            "client_ip": request.META.get("REMOTE_ADDR"),
            "user_agent": request.META.get("HTTP_USER_AGENT"),
        }
        return event

    def _postprocess_view(self, event, request, response):
        if hasattr(request.resolver_match, "app_name"):
            event["service"] = request.resolver_match.app_name
        event["end"] = arrow.utcnow().isoformat()
        event["status"] = response.status_code
        event["user"] = request.user.id


        if hasattr(request, "backend"):
            event["backend"] = request.backend.name
        if hasattr(request, "data") and request.method in ["POST", "PUT", "PATCH"]:
            event["data"] = _shorten_payload(_clean_payload(request.data))
        if hasattr(response, "exception") and response.exception:
            if isinstance(response.data, list):
                response.data.append(response.trace)
            else:
                response.data.update(response.trace)
            event["error"] = response.data
            self.logger.exception(json.dumps(event, default=str))
        elif hasattr(response, "data"):
            if isinstance(response.data, dict):
                # if has pagination or not
                if response.data.get("results"):
                    if isinstance(response.data.get("results"), list):
                        event["response"] = _shorten_payload(list(map(_clean_payload, response.data.get("results"))))
                    else:
                        event["response"] = _shorten_payload(_clean_payload(response.data.get("results")))
                else:
                    event["response"] = _shorten_payload(_clean_payload(response.data))
            elif isinstance(response.data, list):
                event["response"] = _shorten_payload(list(map(_clean_payload, response.data)))
            else:
                event["response"] = response.data

            self.logger.info(json.dumps(event, default=str))

    def __call__(self, request):
        if asyncio.iscoroutinefunction(self.get_response):
            return self.__acall__(request)

        # Code to be executed for each request before
        # the view (and later middleware) are called.
        event = self._preprocess_view(request)
        response = self.get_response(request)
        # Code to be executed for each request/response after
        # the view is called.
        self._postprocess_view(event, request, response)
        return response

    async def __acall__(self, request):
        """
        Async version of __call__ that is swapped in when an async request
        is running.
        """
        # Code to be executed for each request before
        # the view (and later middleware) are called.
        event = self._preprocess_view(request)
        response = await self.get_response(request)
        # Code to be executed for each request/response after
        # the view is called.
        return response
