FROM node:lts-bullseye-slim

COPY . /sync

RUN cd /sync && \
    npm i && \
    npm run build

WORKDIR /sync

CMD ["npm", "start"]