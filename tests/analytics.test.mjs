import test from 'node:test';import assert from 'node:assert/strict';
import {track} from '../source/frontend/site/experiment/analytics.ts';
test('analytics excludes admin, allows only safe properties and tolerates failure',async()=>{
 const calls=[];const storage=new Map();globalThis.location={hostname:'careerform-panel-study.vercel.app',pathname:'/admin'};
 globalThis.sessionStorage={getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)};globalThis.fetch=async(url,options)=>{calls.push({url,...options});return {ok:true}};
 track('study_opened');assert.equal(calls.length,0);
 location.pathname='/experiment/index.html';track('trial_rated',{variant:'B',trial:2,ratings:{comfort:5},password:'secret'},true);track('trial_rated',{variant:'B',trial:2},true);
 assert.equal(calls.length,1);const payload=JSON.parse(calls[0].body);assert.deepEqual(Object.keys(payload.properties).sort(),['$geoip_disable','$process_person_profile','study_version','trial','variant'].sort());assert.equal(payload.properties.variant,'B');assert.equal(calls[0].referrerPolicy,'no-referrer');
 globalThis.fetch=async()=>{throw Error('offline')};assert.doesNotThrow(()=>track('response_submit_failed'));await new Promise(r=>setTimeout(r,0));
});
