import {neon} from '@neondatabase/serverless';import {readFileSync} from 'node:fs';
if(!process.env.DATABASE_URL)throw Error('Set DATABASE_URL to the isolated study database');
await neon(process.env.DATABASE_URL).query(readFileSync(new URL('../migrations/001_responses.sql',import.meta.url),'utf8'));console.log('Study schema ready');
