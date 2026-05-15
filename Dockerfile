FROM node:lts-alpine AS build

RUN apk add --no-cache python3 make g++

WORKDIR /build

COPY . .

RUN cd client && npm install --no-audit --no-fund
RUN cd server && npm install --no-audit --no-fund

RUN cd client && npm run build

RUN cd server && npm prune --omit=dev


FROM node:lts-alpine

RUN apk add --no-cache tini

WORKDIR /sync

COPY --from=build /build/server/node_modules ./server/node_modules
COPY --from=build /build/server/src ./server/src
COPY --from=build /build/server/package.json ./server/package.json
COPY --from=build /build/client/dist ./client/dist

EXPOSE 3000

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "server/src/index.js"]
