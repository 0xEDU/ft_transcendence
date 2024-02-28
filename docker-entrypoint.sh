#!/bin/sh

#Add a little sleep to wait for postgres start
sleep 15

# Apply database migrations
echo "Apply database migrations"
python manage.py migrate

# Start server
echo "Starting server"
python manage.py runserver_plus --cert-file cert.pem --key-file key.pem 0.0.0.0:8000
