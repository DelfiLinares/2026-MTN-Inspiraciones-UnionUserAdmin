FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY . .

ARG VITE_API_URL=/api
ARG VITE_USE_MOCKS=false
ARG VITE_AUTH_GOOGLE_REDIRECT_URL=
ARG VITE_AUTH_GITHUB_REDIRECT_URL=
ARG VITE_GEOLOCATION_ENABLED_DEFAULT=false

RUN npm run build

FROM nginx:stable-alpine AS runtime

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget -q -O /dev/null http://127.0.0.1/healthz || exit 1

CMD ["nginx", "-g", "daemon off;"]
