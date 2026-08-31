import fs from 'fs';
const html = fs.readFileSync('dist/index.html','utf8');
const jsFile = fs.readdirSync('dist/assets').find(f=>f.endsWith('.js'));
const js = fs.readFileSync(`dist/assets/${jsFile}`,'utf8');
const offline = html.replace(
  `<script type="module" src="/src/app.js"></script>`,
  `<script type="module">\n${js}\n</script>`
).replace(
  /src="\/assets\/.*?"/,
  ''
);
// tulis tool offline single file
fs.writeFileSync('output/TOOL_OFFLINE_BACA_SHOPEE.html', offline, 'utf8');
console.log('✅ TOOL_OFFLINE_BACA_SHOPEE.html created - bisa dibuka tanpa server, tanpa internet');
