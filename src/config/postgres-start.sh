#!/bin/bash
set -e

SERVER="movies_mgmt";

SCRIPT_DIR=$(dirname "$0")

echo "Default db username is 'postgres'"

echo "Enter Database password: "
read PASSWORD


PW=$PASSWORD;
DB="movies_mgmt_db";
DB_TEST="movies_mgmt_test_db";


echo "echo stop & remove old docker [$SERVER] and starting new fresh instance of [$SERVER]"
(docker kill $SERVER || :) && \
  (docker rm -f $SERVER || :) && \
  docker run --name $SERVER -e POSTGRES_PASSWORD=$PW \
  -e PGPASSWORD=$PW \
  -p 5432:5432 \
  -d postgres

# wait for pg to start
echo "sleep wait for pg-server [$SERVER] to start";
SLEEP 5;

# create the db 
echo "CREATE DATABASE $DB ENCODING 'UTF-8';" | docker exec -i $SERVER psql -U postgres
# create the test db 
echo "CREATE DATABASE $DB_TEST ENCODING 'UTF-8';" | docker exec -i $SERVER psql -U postgres
echo "\l" | docker exec -i $SERVER psql -U postgres

docker run -p 80:80 -e 'PGADMIN_DEFAULT_EMAIL=admin@admin.com' -e 'PGADMIN_DEFAULT_PASSWORD=admin' -d dpage/pgadmin4