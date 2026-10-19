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

## MCP

Über MCP können Clients den Raumzustand abfragen, Videos starten und die Queue verwalten. Trage im MCP-Client diese URL als HTTP-Endpunkt ein:

```text
https://sync.example.org/mcp/STANDARD
```

Ersetze Server-Adresse und Raum-ID. Der Raum muss bereits existieren. Der Endpunkt verarbeitet JSON-RPC per HTTP-POST; ein SSE-Stream per GET wird nicht angeboten.

### Tools

| Tool | Argumente | Funktion |
| --- | --- | --- |
| `get-room` | keine | Aktuelles Video, Wiedergabe, Zuschauerzahl und Queue abfragen |
| `play-video` | `video` | YouTube-Video sofort abspielen |
| `queue-add` | `video` | YouTube-Video an die Queue anhängen |
| `queue-move` | `from`, `to` | Video innerhalb der Queue verschieben |
| `queue-delete` | `index` | Video aus der Queue entfernen |
| `play` | keine | Wiedergabe fortsetzen |
| `pause` | keine | Wiedergabe pausieren |

`video` akzeptiert eine YouTube-Video-URL oder Video-ID, keine Suchbegriffe. Queue-Indizes beginnen bei `0`.

### Beispiel

Ein Video per curl zur Queue hinzufügen:

```bash
curl -X POST 'https://sync.example.org/mcp/STANDARD' \
  -H 'Content-Type: application/json' \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "queue-add",
      "arguments": { "video": "https://www.youtube.com/watch?v=p5WxxAAh-1U" }
    }
  }'
```

Erfolgreiche Tool-Aufrufe liefern den aktuellen Raumzustand als JSON-Text in `result.content[0].text`. Zeiten sind in Sekunden angegeben; eine Videodauer von `-1` kennzeichnet einen Livestream. Bei Tool-Fehlern ist `result.isError` auf `true` gesetzt. Die Tool-Liste inklusive Argument-Schemas lässt sich mit der JSON-RPC-Methode `tools/list` abfragen.

## Webhooks

Webhooks senden bei Raum-Events einen HTTP-POST mit JSON an deine URL. Der Raum muss bereits existieren. Ersetze in den Beispielen Server-Adresse, Raum-ID und Ziel-URL.

### Registrieren

```bash
curl -X POST 'https://sync.example.org/hook/STANDARD' \
  -H 'Content-Type: application/json' \
  -d '{
    "url": "https://example.org/webhook",
    "events": ["queue"],
    "headers": { "Authorization": "Bearer TOKEN" },
    "threshold": 3
  }'
```

- `url`: Ziel-URL mit `http://` oder `https://` (Pflicht).
- `events`: Events, die gesendet werden sollen. Ohne Angabe werden alle Events gesendet.
- `headers`: Optionale HTTP-Header für den Aufruf der Ziel-URL. Werte müssen Strings sein.
- `threshold`: Optionale nichtnegative Ganzzahl. Ein `queue`-Event wird nur gesendet, wenn die Anzahl wartender Videos **kleiner** als dieser Wert ist. Das laufende Video zählt nicht mit. Andere Events bleiben ungefiltert.

Bei `threshold: 3` werden Queue-Events bei 0, 1 oder 2 wartenden Videos gesendet. Das gilt für jedes Queue-Event unterhalb der Grenze, auch beim Hinzufügen oder Umsortieren. Die Registrierung selbst löst kein Event aus. Bei `threshold: 0` werden keine Queue-Events gesendet.

Verfügbare Events: `video`, `play`, `pause`, `seek`, `queue`, `speed`, `loop`, `sponsorblock`, `remove`.

Eine erfolgreiche Registrierung antwortet mit HTTP `201` und dem Raumzustand. Dieselbe URL erneut zu registrieren ersetzt ihre gesamte Konfiguration; weggelassene Optionen werden zurückgesetzt. Pro Raum sind maximal 10 Webhooks möglich.

### Empfang

Der Empfänger erhält JSON mit dieser Struktur:

```json
{
  "event": "queue",
  "room": {
    "id": "STANDARD",
    "queue": []
  }
}
```

`room` enthält den vollständigen Raumzustand und ist hier gekürzt dargestellt. Konfigurierte Header werden als HTTP-Header mitgesendet.

### Löschen

```bash
curl -X DELETE 'https://sync.example.org/hook/STANDARD' \
  -H 'Content-Type: application/json' \
  -d '{"url":"https://example.org/webhook"}'
```

Die Antwort ist HTTP `204` ohne Body.

Webhooks werden nur im Arbeitsspeicher gehalten und gehen beim Server-Neustart oder beim Entfernen des Raums verloren. Der Versand hat ein Timeout von 5 Sekunden; fehlgeschlagene Aufrufe werden nicht wiederholt.
