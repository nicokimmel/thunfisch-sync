FROM node:lts-bullseye

COPY . /sync

RUN cd /sync && \
    npm i && \
    npm run build

WORKDIR /sync

CMD ["npm", "start"]