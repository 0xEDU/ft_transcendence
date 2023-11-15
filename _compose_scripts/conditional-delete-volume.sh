#!/bin/bash

GREEN='\033[32m'
RESET='\033[0m'

# Check if a volume name argument is provided
if [ $# -eq 0 ]; then
    echo "Usage: $0 <volume_name>"
    exit 1
fi

VOLUME_NAME="$1"

# Escape special characters in the volume name using printf
ESCAPED_NAME=$(printf "%q" "$VOLUME_NAME")

# Check if the volume exists
if docker volume ls | grep -q ${ESCAPED_NAME} ; then
    printf "Deleting volume ${GREEN}${ESCAPED_NAME}${RESET}...\n"
    docker volume rm ${ESCAPED_NAME}
else
    printf "Volume ${GREEN}${ESCAPED_NAME}${RESET} does not exist. No action needed.\n"
fi
