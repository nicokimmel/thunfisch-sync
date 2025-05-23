# Thunfisch Sync

Schau dir Youtube Videos mit deinen Freunden an. 🐟  
  
Es handelt sich um eine simple Watch2Gether Alternative, das bedeutet man kann sich YouTube Videos synchron mit seinen Freunden anschauen.

## Installation

1. Git Repository klonen
2. Node Dependencies mit `npm run install` installieren
3. Projekt mit `npm run build` builden
4. Eine Datei `.env` erstellen, die den Port, einen [YouTube API Key](https://console.developers.google.com/projectcreate) und und optional eine Liste geblockter YouTube Kanäle (Channel ID mit Komma getrennt) enthält:

```
PORT=3000
YOUTUBE_API_KEY="XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
CHANNEL_FILTER="XXXXXXXXXXXXXXXXXXXXXXXX,XXXXXXXXXXXXXXXXXXXXXXXX"
```

5. Der Server öffnet einen Webserver unter dem Port 3000 wenn kein Port angegeben wurde. Falls ein Reverse-Proxy zum Einsatz kommen soll, muss man dort die Schnittstelle zu Socket.IO durchreichen. Hier ein (SSL) Beispiel für NGINX:

```
server {
    listen      192.168.2.100:443 ssl http2;
    server_name sync.example.org;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location /socket.io/ {
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_pass "http://192.168.2.100:3000/socket.io/";
    }

    location / {
        proxy_pass http://192.168.2.100:3000;
    }
}
```

6. Die Applikation mit `npm start` ausführen