# base image
FROM python:3.10-alpine

# setup environment variable
ENV TRANSCENDENCE_DIR=/ft_transcendence
ENV TRANSCENDENCE_PROTOCOL=https
ENV POSTGRES_PORT=5432
ENV POSTGRES_HOST=postgres-transcendence
ENV GANACHE_HOST=ganache-transcendence

COPY requirements.txt $TRANSCENDENCE_DIR/

# install dependencies
RUN pip install --no-cache-dir --no-compile -q -r $TRANSCENDENCE_DIR/requirements.txt

# set work directory
RUN mkdir -p $TRANSCENDENCE_DIR; apk add --no-cache openssl

# where your code lives
WORKDIR $TRANSCENDENCE_DIR

# copy whole project to your docker home directory.
COPY . $TRANSCENDENCE_DIR

# create certificates for ssl/https
RUN openssl req -newkey rsa:2048 -nodes -keyout /private.key -x509 -days 365 -out /certificate.pem -subj "/C=BR/ST=SP/L=SãoPaulo/O=42sp/CN=pong.42"

# port where the Django app runs
EXPOSE 8000

ENTRYPOINT [ "sh", "docker-entrypoint.sh" ]
