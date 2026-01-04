from channels.db import database_sync_to_async
from django.db.models import Q, Prefetch, Count, Max
from .models import ConversationModel, MessageModel
from .serializers import ConversationSerializer, MessageSerializer
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()

@database_sync_to_async
def get_all_conversations(user):
    convo = ConversationModel.objects.filter(
        Q(vendor=user) | Q(buyer=user)
    ).select_related("vendor", "buyer").prefetch_related(
        Prefetch(
            "messages",
            queryset=MessageModel.objects.select_related('sender')
        )
    ).annotate(
        unread_count_db=Count(
            'messages',
            filter=Q(messages__is_read=False) & ~Q(messages__sender=user)
        ),
        last_message_time_db=Max('messages__timestamp')
    ).order_by('-last_message_time_db')


    serializer = ConversationSerializer(
        convo, 
        many=True,
        context = {"request_user": user}
    )


    return serializer.data


@database_sync_to_async
def store_message(sender, conversation_id, text):
    conversation = ConversationModel.objects.get(id=conversation_id)
    message = MessageModel.objects.create(
        conversation=conversation,
        sender=sender,
        text=text,
    )

    return {
        'text': message.text,
        'sender': message.sender.id,
        'timestamp': message.timestamp.isoformat(),
        'is_read': message.is_read
    }


@database_sync_to_async
def mark_as_read(conversation_id, sender):
    MessageModel.objects.filter(
            conversation_id=conversation_id,
            is_read=False
        ).exclude(sender=sender).update(is_read=True)
    

@database_sync_to_async
def load_user_messages(conversation_id):
    messages_qs = MessageModel.objects.filter(conversation_id=conversation_id).select_related('sender')
    serializer = MessageSerializer(messages_qs, many=True)

    return serializer.data


@database_sync_to_async
def change_online_status(user, status):
    User.objects.filter(id=user.id).update(online=status, last_seen=timezone.now())
