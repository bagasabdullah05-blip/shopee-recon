import fs from 'fs';
let html = fs.readFileSync('dist/index.html','utf8');
let js = fs.readFileSync('dist/assets/index-ClEINXpF.js','utf8');
let tag = '<script type="module" crossorigin src="/assets/index-ClEINXpF.js"></script>';
html = html.split(tag).join('<script type="module">\n' + js + '\n</script>');
fs.writeFileSync('output/TOOL_OFFLINE_BACA_SHOPEE.html', html);
console.log('size', fs.statSync('output/TOOL_OFFLINE_BACA_SHOPEE.html').size);
