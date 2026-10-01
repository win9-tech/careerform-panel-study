import { spawnSync } from 'node:child_process';
import { cpSync, mkdirSync } from 'node:fs';
const r=spawnSync('npm',['run','build:site'],{cwd:'source/frontend',stdio:'inherit'});
if(r.status!==0) process.exit(r.status??1);
mkdirSync('public/experiment',{recursive:true});
cpSync('source/frontend/dist-site/experiment/index.html','public/experiment/index.html');
cpSync('source/frontend/dist-site/assets','public/assets',{recursive:true});
