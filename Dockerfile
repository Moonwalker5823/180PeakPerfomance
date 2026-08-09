# --- build -------------------------------------------------------------------
FROM node:22-alpine AS build

WORKDIR /app

# Install against the lockfile first so this layer caches across source edits.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Vite inlines VITE_* at build time, so they have to be present *here*, not at
# runtime. On Railway, declare them as build args in the service settings.
ARG VITE_CALENDLY_URL
ARG VITE_CONTACT_EMAIL
ARG VITE_SITE_URL
ENV VITE_CALENDLY_URL=$VITE_CALENDLY_URL
ENV VITE_CONTACT_EMAIL=$VITE_CONTACT_EMAIL
ENV VITE_SITE_URL=$VITE_SITE_URL

RUN npm run build

# --- serve -------------------------------------------------------------------
FROM caddy:2-alpine

COPY Caddyfile /etc/caddy/Caddyfile
COPY --from=build /app/dist /srv

EXPOSE 80
CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile", "--adapter", "caddyfile"]
