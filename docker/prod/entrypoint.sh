#!/bin/sh
set -e

# Fix uploads directory permissions
if [ -d "/app/uploads" ]; then
    chown -R elyos:nodejs /app/uploads
fi

# Drop privileges and run the app as elyos user
exec su-exec elyos "$@"
