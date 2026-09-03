import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import {defineConfig, Plugin} from 'vite';

function notesApiPlugin(): Plugin {
  const dataDir = path.resolve(__dirname, 'data');
  const filePath = path.join(dataDir, 'notes.json');

  const ensureFile = () => {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify([], null, 2), 'utf-8');
    }
  };

  return {
    name: 'notes-api-plugin',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === '/api/notes' && req.method === 'GET') {
          ensureFile();
          try {
            const content = fs.readFileSync(filePath, 'utf-8');
            res.setHeader('Content-Type', 'application/json');
            res.end(content);
          } catch {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify([]));
          }
          return;
        }

        if (req.url === '/api/notes' && req.method === 'POST') {
          ensureFile();
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', () => {
            try {
              const parsed = JSON.parse(body);
              if (Array.isArray(parsed)) {
                fs.writeFileSync(filePath, JSON.stringify(parsed, null, 2), 'utf-8');
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: true, count: parsed.length }));
                return;
              }
            } catch (err) {
              console.error('Error saving notes:', err);
            }
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'Invalid data' }));
          });
          return;
        }

        next();
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), notesApiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
