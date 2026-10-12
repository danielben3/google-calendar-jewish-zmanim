import { execSync } from 'node:child_process';
import { copyFileSync, existsSync } from 'node:fs';
import * as esbuild from 'esbuild';

console.log('🚀 Starting extension build...');

// 1. Build popup via Vite
console.log('📦 Step 1: Building popup UI with Vite...');
execSync('npx vite build', { stdio: 'inherit' });

// 2. Bundle Content Script (IIFE, self-contained, no module chunks)
console.log('📜 Step 2: Bundling content script with esbuild...');
await esbuild.build({
  entryPoints: ['src/content/contentScript.ts'],
  outfile: 'dist/content.js',
  bundle: true,
  format: 'iife',
  target: 'chrome100',
  minify: false,
  sourcemap: false
});

// 3. Copy content CSS
console.log('🎨 Step 3: Copying content style...');
copyFileSync('src/content/contentStyle.css', 'dist/content.css');

// 4. Bundle Background Service Worker
console.log('⚙️ Step 4: Bundling background service worker...');
await esbuild.build({
  entryPoints: ['src/background/background.ts'],
  outfile: 'dist/background.js',
  bundle: true,
  format: 'esm',
  target: 'chrome100',
  minify: false,
  sourcemap: false
});

console.log('✅ Extension build completed successfully! Output in ./dist');
