import {defineConfig} from 'vite';
import fs from 'fs';
import path from 'path';

// Scan 'demo' directory for subdirectories containing 'index.html'
export const entryPoints = {};
const demoFolder = './demo';

fs.readdirSync(demoFolder, {withFileTypes: true})
  .filter(dirent => dirent.isDirectory())
  .forEach(dirent => {
    const subdirPath = path.join(demoFolder, dirent.name);
    if (fs.existsSync(path.join(subdirPath, 'index.html'))) {
      entryPoints[dirent.name] = path.join(subdirPath, 'index.html');
    }
  });

export default defineConfig({
  build: {
    rollupOptions: {
      input: entryPoints,
    },
  },
  server: {
    open: '/demo/index.html',
  },
});
