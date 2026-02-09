from rules import predicate

# 定義角色權限規則

class OwnerPredicateMixin:
    @classmethod
    def is_owner_role(cls, *args, **kwargs):
        @predicate(bind=True)
        def fn(self, user, target):
            return target.user == user

        return fn
