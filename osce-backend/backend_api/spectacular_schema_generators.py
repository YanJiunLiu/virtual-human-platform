from django.contrib.admindocs.utils import (
    replace_named_groups,
    replace_unnamed_groups,
)
from drf_spectacular.generators import *
from rest_framework.schemas.generators import _PATH_PARAMETER_COMPONENT_RE


def simplify_regex(pattern):
    r"""
    Clean up urlpattern regexes into something more readable by humans. For
    example, turn "^(?P<sport_slug>\w+)/athletes/(?P<athlete_slug>\w+)/$"
    into "/<sport_slug>/athletes/<athlete_slug>/".
    """
    pattern = replace_named_groups(pattern)
    pattern = replace_unnamed_groups(pattern)
    # clean up any outstanding regex-y characters.
    # change original replace method
    # replace ^ and ?
    # replace /$ or $/ to /
    # replace \$ to $ # this means we have $ in the url
    pattern = re.sub(r"(/\$) |(\$/)", "/", pattern.replace("^", "").rstrip("$").replace("?", "")).replace(r"\$", "$")
    if not pattern.startswith("/"):
        pattern = "/" + pattern
    return pattern


class EndpointEnumerator(EndpointEnumerator):
    def get_path_from_regex(self, path_regex):
        path = simplify_regex(path_regex)

        # Strip Django 2.0 convertors as they are incompatible with uritemplate format
        path = re.sub(_PATH_PARAMETER_COMPONENT_RE, r"{\g<parameter>}", path)
        # bugfix oversight in DRF regex stripping
        path = path.replace("\\.", ".")
        return path


class CSMUSchemaGenerator(SchemaGenerator):
    endpoint_inspector_cls = EndpointEnumerator


    def parse(self, input_request, public):
        """ Iterate endpoints generating per method path operations. """
        result = {}
        self._initialise_endpoints()
        all_endpoints = self._get_paths_and_endpoints()
        app_name = input_request.path.split("/")[1]
        endpoints=[]
        for path, path_regex, method, view in all_endpoints:
            if path.startswith(f"/{app_name}/"):
                endpoints.append((path, path_regex, method, view))
        if spectacular_settings.SCHEMA_PATH_PREFIX is None:
            # estimate common path prefix if none was given. only use it if we encountered more
            # than one view to prevent emission of erroneous and unnecessary fallback names.
            non_trivial_prefix = len(set([view.__class__ for _, _, _, view in endpoints])) > 1
            if non_trivial_prefix:
                path_prefix = os.path.commonpath([path for path, _, _, _ in endpoints])
                path_prefix = re.escape(path_prefix)  # guard for RE special chars in path
            else:
                path_prefix = '/'
        else:
            path_prefix = spectacular_settings.SCHEMA_PATH_PREFIX
        if not path_prefix.startswith('^'):
            path_prefix = '^' + path_prefix  # make sure regex only matches from the start

        for path, path_regex, method, view in endpoints:
            # emit queued up warnings/error that happened prior to generation (decoration)
            for w in get_override(view, 'warnings', []):
                warn(w)
            for e in get_override(view, 'errors', []):
                error(e)

            view.request = spectacular_settings.GET_MOCK_REQUEST(method, path, view, input_request)

            if not (public or self.has_view_permissions(path, method, view)):
                continue

            if view.versioning_class and not is_versioning_supported(view.versioning_class):
                warn(
                    f'using unsupported versioning class "{view.versioning_class}". view will be '
                    f'processed as unversioned view.'
                )
            elif view.versioning_class:
                version = (
                        self.api_version  # explicit version from CLI, SpecView or SpecView request
                        or view.versioning_class.default_version  # fallback
                )
                if not version:
                    continue
                path = modify_for_versioning(self.inspector.patterns, method, path, view, version)
                if not operation_matches_version(view, version):
                    continue

            assert isinstance(view.schema, AutoSchema), (
                f'Incompatible AutoSchema used on View {view.__class__}. Is DRF\'s '
                f'DEFAULT_SCHEMA_CLASS pointing to "drf_spectacular.openapi.AutoSchema" '
                f'or any other drf-spectacular compatible AutoSchema?'
            )
            with add_trace_message(getattr(view, '__class__', view)):
                operation = view.schema.get_operation(
                    path, path_regex, path_prefix, method, self.registry
                )

            # operation was manually removed via @extend_schema
            if not operation:
                continue

            if spectacular_settings.SCHEMA_PATH_PREFIX_TRIM:
                path = re.sub(pattern=path_prefix, repl='', string=path, flags=re.IGNORECASE)

            if spectacular_settings.SCHEMA_PATH_PREFIX_INSERT:
                path = spectacular_settings.SCHEMA_PATH_PREFIX_INSERT + path

            if not path.startswith('/'):
                path = '/' + path

            if spectacular_settings.CAMELIZE_NAMES:
                path, operation = camelize_operation(path, operation)

            result.setdefault(path, {})
            result[path][method.lower()] = operation

        return result
