import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'extension/manifest.json'),'utf8'));
const pkg=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'));
assert.equal(manifest.manifest_version,3);
assert.equal(manifest.version,pkg.version);
assert.deepEqual(manifest.permissions,['storage']);
assert.deepEqual(manifest.host_permissions,['https://openrouter.ai/*','https://media.licdn.com/*']);
assert.equal(manifest.web_accessible_resources,undefined);
assert.equal(manifest.key,undefined);
function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);}
const files=walk(path.join(root,'extension'));
for(const file of files){
  if(!/\.(js|json|css|html|svg|md)$/.test(file))continue;
  const text=new TextDecoder('utf8',{fatal:true}).decode(fs.readFileSync(file));
  assert(!/sk-or-(?:v1-)?[a-zA-Z0-9_-]{20,}/.test(text),`Possible embedded API key: ${file}`);
  assert(!/\beval\s*\(|\bnew\s+Function\s*\(|<script[^>]+src=["']https?:/i.test(text),`Executable remote code: ${file}`);
  if(file.endsWith('.js'))execFileSync(process.execPath,['--check',file]);
}
for(const [size,name] of Object.entries(manifest.icons)){
  const png=fs.readFileSync(path.join(root,'extension',name));
  assert.equal(png.readUInt32BE(16),Number(size));assert.equal(png.readUInt32BE(20),Number(size));
}
for(const page of ['extension/popup.html','preview-settings.html']){
  const html=fs.readFileSync(path.join(root,page),'utf8');
  assert(html.includes(`>${manifest.version}</span>`),`Stale version: ${page}`);
  assert(html.indexOf('id="cloud-consent"')<html.indexOf('<nav'),`Disclosure must be visible above tabs: ${page}`);
}
console.log(`Validated MV3 manifest, versions, permissions, encoding, icons and ${files.length} extension files.`);
