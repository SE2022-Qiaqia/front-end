FROM node:16.3 AS build

RUN mkdir /app
WORKDIR /app

COPY ./ ./
RUN cp ./src/docker/apiSource.ts ./src/api/_source.ts

ENV YARN_CACHE_FOLDER=/usr/local/yarn-cache
VOLUME /usr/local/yarn-cache

RUN yarn
RUN yarn run build


FROM nginx:latest AS web-server

COPY --from=build /app/dist/ /usr/share/nginx/html/
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf
