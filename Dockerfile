FROM quay.io/cloudservices/caddy-ubi:11145b1

ENV CADDY_TLS_MODE http_port 8000

COPY ./Caddyfile /opt/app-root/src/Caddyfile
COPY ./frontend/dist /opt/app-root/src/dist
COPY ./frontend/package.json /opt/app-root/src
WORKDIR /opt/app-root/src
CMD ["caddy", "run", "--config", "/opt/app-root/src/Caddyfile"]
