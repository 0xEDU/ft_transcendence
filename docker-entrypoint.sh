#!/bin/sh

# Apply database migrations
echo "Apply database migrations"
python manage.py migrate

# Start server
echo "Starting server"
python manage.py runserver_plus --cert-file cert.pem --key-file key.pem 0.0.0.0:8000
