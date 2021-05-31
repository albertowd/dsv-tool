FROM node:lts-alpine AS builder

WORKDIR /build
COPY package*.json .

RUN npm ci --no-optional

COPY . .
RUN npm run generate

FROM nginx:latest

RUN mkdir -p /usr/share/nginx/html/dsv-tool
COPY --from=builder /build/dist /usr/share/nginx/html/dsv-tool
