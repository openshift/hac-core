FROM quay.io/redhat-cloud-services/releaser as build-stage
WORKDIR /build
COPY . ./
RUN ./build.sh

FROM registry.access.redhat.com/ubi8/nginx-118
COPY ./nginx.conf /opt/app-root/etc/nginx/conf.d/default.conf
COPY --from=build-stage /build/frontend/dist /opt/app-root/src
ADD ./nginx.conf "${NGINX_CONFIGURATION_PATH}"
CMD ["nginx", "-g", "daemon off;"]
