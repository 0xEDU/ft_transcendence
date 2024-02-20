# base image
FROM python:3.11.3

# setup environment variable
ENV TRANSCENDENCE_DIR=/ft_transcendence
ENV TRANSCENDENCE_PROTOCOL=https
ENV POSTGRES_PORT=5432
ENV POSTGRES_HOST=postgres

# set work directory
RUN mkdir -p $TRANSCENDENCE_DIR

# where your code lives
WORKDIR $TRANSCENDENCE_DIR

# install dependencies
RUN pip install --upgrade pip

# copy whole project to your docker home directory.
COPY . $TRANSCENDENCE_DIR

RUN pip install psycopg2

# run this command to install all dependencies
RUN pip install -r requirements.txt

# create certificates for ssl/https
RUN openssl req -newkey rsa:2048 -nodes -keyout /private.key -x509 -days 365 -out /certificate.pem -subj "/C=BR/ST=SP/L=SãoPaulo/O=42sp/CN=pong.42"

# migrate db
RUN python3 manage.py migrate

# port where the Django app runs
EXPOSE 8000
