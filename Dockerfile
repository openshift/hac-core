FROM quay.io/cloudservices/caddy-ubi:357c825
COPY ./Caddyfile /opt/app-root/src/Caddyfile
COPY ./frontend/dist /opt/app-root/src/dist
COPY ./frontend/package.json /opt/app-root/src
WORKDIR /opt/app-root/src
CMD ["caddy", "run", "--config", "/opt/app-root/src/Caddyfile"]
