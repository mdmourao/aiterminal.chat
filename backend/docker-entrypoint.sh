#!/bin/sh

set -e

echo "Waiting for PostgreSQL to be ready..."
until pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME"; do
  >&2 echo "PostgreSQL is unavailable - sleeping"
  sleep 1
done
echo "PostgreSQL is up - starting migrations and application."

echo "Running Knex migrations..."
/app/node_modules/.bin/knex --knexfile database/knexfile.js migrate:latest || { echo "ERROR: Knex migration failed. Exiting."; exit 1; }
/app/node_modules/.bin/knex --knexfile database/knexfile.js seed:run || { echo "ERROR: Knex seeding failed. Exiting."; exit 1; }

echo "Migrations completed. Starting Node.js application."

exec "$@"