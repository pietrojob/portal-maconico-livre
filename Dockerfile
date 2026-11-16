FROM node:24-bookworm-slim
WORKDIR /app
COPY functions ./functions
COPY public ./public
COPY storage.mjs server.mjs setup.mjs ./
ENV NODE_ENV=production PORTAL_DATA=/data
USER 10001:10001
CMD ["node", "server.mjs"]
