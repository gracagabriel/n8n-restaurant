#!/usr/bin/env node

/**
 * Servidor HTTP simples para servir test-websocket.html
 * Permite testar WebSocket sem problemas de CORS com file://
 * 
 * Uso: node test-server.js
 * Acesse: http://localhost:8080
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;

const server = http.createServer((req, res) => {
  // CORS headers para desenvolvimento
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Servir arquivo HTML
  if (req.url === '/' || req.url === '/test-websocket.html') {
    const filePath = path.join(__dirname, 'test-websocket.html');
    fs.readFile(filePath, 'utf8', (err, content) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Erro ao carregar arquivo: ' + err.message);
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(content);
    });
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Arquivo não encontrado');
  }
});

server.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════╗
║  🧪 WebSocket Test Server rodando com sucesso!        ║
╠════════════════════════════════════════════════════════╣
║  📍 URL: http://localhost:${PORT}                    ║
║  📁 Arquivo: test-websocket.html                      ║
║  🔌 Backend: http://localhost:3000 (namespace /admin) ║
║                                                        ║
║  Passos:                                               ║
║  1. Abra http://localhost:${PORT} no navegador       ║
║  2. Cole o JWT token do Teste 1 (Login)              ║
║  3. Clique em "Conectar WebSocket"                    ║
║                                                        ║
║  Pressione Ctrl+C para parar o servidor               ║
╚════════════════════════════════════════════════════════╝
  `);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Erro: Porta ${PORT} já está em uso!`);
    console.error('Tente: netstat -ano | findstr :8080 (Windows)');
  } else {
    console.error('Erro no servidor:', err.message);
  }
  process.exit(1);
});
