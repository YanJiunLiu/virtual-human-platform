from django.db.models import (
    Model, 
    ForeignKey, 
    CASCADE,
    CharField,
    DateTimeField,
    ManyToManyField,
)
from django.conf import settings

class ConversationDetail(Model):
    patient_message = CharField(max_length=255, null=True, blank=True)
    user_message = CharField(max_length=255, null=True, blank=True)
    timestamp = DateTimeField(auto_now_add=False)

# Create your models here.
class Conversation(Model):
    test_id = CharField(max_length=255, null=True, blank=True)
    patient_id = CharField(max_length=255, null=True, blank=True)
    conversation = ManyToManyField(ConversationDetail, related_name='conversation')
    created_at = DateTimeField(auto_now_add=True)
    created_by = ForeignKey(settings.AUTH_USER_MODEL, on_delete=CASCADE, null=True)

class Grade(Model):
    level = CharField(max_length=255, null=True, blank=True)
    label = CharField(max_length=255, null=True, blank=True)

class Category(Model):
    category = CharField(max_length=255, null=True, blank=True)
    feedback = CharField(max_length=255, null=True, blank=True)
    grade = ForeignKey(Grade, on_delete=CASCADE, null=True)
    
class Scoring(Model):
    score = ManyToManyField(Category, related_name='scoring')
    created_at = DateTimeField(auto_now_add=True)
    created_by = ForeignKey(settings.AUTH_USER_MODEL, on_delete=CASCADE, null=True)