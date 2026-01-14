#!/bin/bash
# Render.com start script for Django Channels with Daphne

# Run migrations
python manage.py migrate --noinput

# Collect static files
python manage.py collectstatic --noinput

# Start Daphne ASGI server (required for WebSocket support)
daphne -b 0.0.0.0 -p $PORT Pymarket.asgi:application
