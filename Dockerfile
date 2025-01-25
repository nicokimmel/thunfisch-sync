FROM node:lts-bullseye-slim

COPY . /sync

RUN cd /sync && \
    npm run install && \
    npm run build

WORKDIR /sync

CMD ["npm", "start"]