from django.urls import re_path
from . import consumer

websocket_urlpatterns=[
    re_path(r'^ws/notifications/$', consumer.NotificationConsumer.as_asgi())

]



from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

channel_layer = get_channel_layer()
print(channel_layer)  


async_to_sync(channel_layer.group_send)(
    'notifications_21', 
    {
        'type': 'notification_message',
        'notification': {'test': 'data'}
    }
)