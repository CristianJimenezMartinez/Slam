// set-env.js
// Genera src/environments/environment.ts a partir de variables de entorno.
// Usado en Cloudflare Pages: Build command → node set-env.js && ng build
// Variables de entorno requeridas en Cloudflare:
//   SUPABASE_URL, SUPABASE_ANON_KEY

const { writeFileSync, mkdirSync } = require('fs');
const { join } = require('path');

const supabaseUrl = process.env['SUPABASE_URL'] || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = process.env['SUPABASE_ANON_KEY'] || 'YOUR_SUPABASE_ANON_KEY';
const isProd = process.env['NODE_ENV'] === 'production';

const content = `// AUTO-GENERATED — do not edit manually
export const environment = {
  production: ${isProd},
  supabaseUrl: '${supabaseUrl}',
  supabaseAnonKey: '${supabaseAnonKey}',
};
`;

const dir = join(__dirname, 'src', 'environments');
mkdirSync(dir, { recursive: true });
writeFileSync(join(dir, 'environment.ts'), content, { encoding: 'utf8' });
if (isProd) {
  writeFileSync(join(dir, 'environment.prod.ts'), content, { encoding: 'utf8' });
}

console.log('[set-env] environment.ts generado correctamente.');
