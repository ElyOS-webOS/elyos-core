FROM postgres:18
RUN mkdir /var/lib/postgresql/json_schema
COPY ./extension/json_schema /var/lib/postgresql/json_schema
RUN apt-get update && apt-get install -y make && cd /var/lib/postgresql/json_schema && make install
COPY --chmod=755 ./init-databases.sh /docker-entrypoint-initdb.d/10-init-databases.sh