import http from 'http';
import path from 'path';
import express from 'express';
import { WebSocketServer } from 'ws';
import { createServer as createViteServer } from 'vite';
import { ServerAntiCheatEngine } from './server/anticheat/serverAntiCheat';
import { ClientSocket, queue, checkMatchTimeouts } from './server/matchmaking';
import { handleWsMessage, handleWsClose } from './server/wsMessageHandler';

const app = express();
const PORT = 3000;
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });
const antiCheat = new ServerAntiCheatEngine();

setInterval(checkMatchTimeouts, 2000);

wss.on('connection', (ws: ClientSocket) => {
  ws.id = `usr_${Math.random().toString(36).slice(2, 9)}`;
  antiCheat.registerPlayer(ws.id);

  ws.on('message', (raw) => {
    handleWsMessage(ws, raw, antiCheat);
  });

  ws.on('close', () => {
    handleWsClose(ws, antiCheat);
  });
});

async function start() {
  app.use((_req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', '*');
    next();
  });

  app.get('/api/health', (_, res) => res.json({ status: 'ok', queueSize: queue.length }));

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: 'spa' });
    app.use(vite.middlewares);
  } else {
    // In production, server.cjs is in the dist folder.
    const distPath = __dirname;
    console.log(`[Production] Serving static files from: ${distPath}`);
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      const indexPath = path.join(distPath, 'index.html');
      res.sendFile(indexPath, (err) => {
        if (err) {
          console.error(`[Error] Failed to serve index.html: ${err.message}`);
          res.status(500).send('Internal Server Error - index.html missing');
        }
      });
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Minecraft Web Game server listening on http://0.0.0.0:${PORT}`);
  });
}

start();
