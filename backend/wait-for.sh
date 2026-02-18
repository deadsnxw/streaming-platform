#!/bin/sh
set -e

# Simple POSIX-compatible wait-for Postgres
host="$1"
shift

while ! pg_isready -h "$host" -p 5432 >/dev/null 2>&1; do
  echo "Waiting for postgres..."
  sleep 2
done

exec "$@"