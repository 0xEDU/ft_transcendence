# base image
FROM python:3.8.10

# setup environment variable
ENV TRANSCENDENCE_DIR=/ft_transcendence

# set work directory
RUN mkdir -p $TRANSCENDENCE_DIR

# where your code lives
WORKDIR $TRANSCENDENCE_DIR

# install dependencies
RUN pip install --upgrade pip

# copy whole project to your docker home directory.
COPY . $TRANSCENDENCE_DIR

# run this command to install all dependencies
RUN pip install -r requirements.txt

# create certificates for ssl/https
RUN openssl req -newkey rsa:2048 -nodes -keyout /private.key -x509 -days 365 -out /certificate.pem -subj "/C=BR/ST=SP/L=SãoPaulo/O=42sp/CN=pong.42"

# port where the Django app runs
EXPOSE 8000
