#!/bin/bash

PURPLE='\033[0;35m'
RESET='\033[0m'

# Check if a container name argument is provided
if [ $# -eq 0 ]; then
    echo "Usage: $0 <container_name>"
    exit 1
fi

CONTAINER_NAME="$1"

# Escape special characters in the container name using printf
ESCAPED_NAME=$(printf "%q" "$CONTAINER_NAME")

# Check if the container is running
if docker ps -q --filter "name=^/$ESCAPED_NAME$" | grep -q . ; then
    printf "Stopping container ${PURPLE}${ESCAPED_NAME}${RESET}...\n"
    docker stop ${ESCAPED_NAME}
else
    printf "Container ${PURPLE}${ESCAPED_NAME}${RESET} is not running. No action needed.\n"
fi
