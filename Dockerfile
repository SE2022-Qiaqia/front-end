FROM node:16.3 AS build

RUN mkdir /app
WORKDIR /app

COPY ./ ./

RUN yarn
RUN yarn run build


FROM nginx:latest AS webServer

COPY --from=build /app/dist/ /usr/share/nginx/html/
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf
