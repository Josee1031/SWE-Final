#!/bin/bash
set -e

# Wait for MySQL to be ready
echo "Waiting for MySQL..."
while ! python -c "import MySQLdb; MySQLdb.connect(host='${DB_HOST}', user='${DB_USER}', passwd='${DB_PASSWORD}', db='${DB_NAME}')" 2>/dev/null; do
    sleep 1
done
echo "MySQL is ready!"

# Run migrations
echo "Running migrations..."
python manage.py migrate --noinput

# Load mock data on first run (use marker file to prevent re-loading)
MARKER_FILE="/app/.data_loaded"
if [ ! -f "$MARKER_FILE" ]; then
    echo "Loading initial mock data..."
    python manage.py load_data
    touch "$MARKER_FILE"
    echo "Mock data loaded successfully!"
else
    echo "Mock data already loaded, skipping..."
fi

# Start the Django development server
echo "Starting Django server..."
exec python manage.py runserver 0.0.0.0:8000
