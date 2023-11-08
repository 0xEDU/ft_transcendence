# base image
FROM python:3.8

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
RUN pip install -r requirements/local.txt

# port where the Django app runs
EXPOSE 8000

# start server
ENTRYPOINT [ "python3" ]
CMD ["manage.py", "runserver", "0.0.0.0:8000"]
