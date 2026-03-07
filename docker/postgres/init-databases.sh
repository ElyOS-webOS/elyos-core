#!/bin/bash
# Create additional databases listed in POSTGRES_EXTRA_DATABASES (comma-separated)
# The primary database (POSTGRES_DB) is created automatically by the postgres image.

set -e

if [ -z "$POSTGRES_EXTRA_DATABASES" ]; then
  exit 0
fi

IFS=',' read -ra DBS <<< "$POSTGRES_EXTRA_DATABASES"
for db in "${DBS[@]}"; do
  db=$(echo "$db" | xargs) # trim whitespace
  echo "Creating extra database: $db"
  psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    SELECT 'CREATE DATABASE "$db"' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '$db')\gexec
EOSQL
done
