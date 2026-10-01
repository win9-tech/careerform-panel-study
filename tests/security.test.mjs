import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {validateSubmission} from '../app/api/responses/validation.ts';
import {createSession,validSession,passwordValid,sameOrigin} from '../lib/auth.ts';
const response=()=>({id:randomUUID(),version:'panel-study-v22',order:['C','A','B'],preference:'B',trials:['C','A','B'].map(variant=>({variant,ratings:{comfort:4,trust:3,wait:2},durationMs:7015,reducedMotion:false}))});
test('only approved data is retained and variant labels survive randomized order',()=>{const p=response();p.profile={name:'DO NOT STORE'};const clean=validateSubmission(p);assert.equal('profile' in clean,false);assert.deepEqual(clean.order,['C','A','B']);assert.equal(clean.trials[0].variant,'C')});
test('reject incomplete, mismatched, invalid scores and IDs',()=>{for(const change of [p=>p.trials.pop(),p=>p.trials[0].variant='A',p=>p.trials[0].ratings.wait=6,p=>p.id='invalid',p=>p.order=['A','A','C']]){const p=response();change(p);assert.throws(()=>validateSubmission(p))}});
test('admin sessions require a configured secret and reject tampering',()=>{process.env.ADMIN_PASSWORD='a-very-long-test-password-only';process.env.SESSION_SECRET='a-test-session-secret-with-32-characters';assert.equal(passwordValid('wrong'),false);assert.equal(passwordValid(process.env.ADMIN_PASSWORD),true);const session=createSession();assert.equal(validSession(session),true);assert.equal(validSession(session+'f'),false);assert.equal(validSession('1.'+session.split('.')[1]),false);delete process.env.SESSION_SECRET;assert.equal(validSession(session),false)});
test('reject cross-origin writes',()=>{assert.equal(sameOrigin(new Request('https://survey.example/api/responses',{headers:{Origin:'https://evil.example'}})),false);assert.equal(sameOrigin(new Request('https://survey.example/api/responses',{headers:{Origin:'https://survey.example'}})),true)});

test('optional feedback is trimmed, length-limited and backward compatible',()=>{const p=response();assert.equal('reason' in validateSubmission(p),false);p.reason='  보기 편했어요  ';assert.equal(validateSubmission(p).reason,'보기 편했어요');p.reason='x'.repeat(301);assert.throws(()=>validateSubmission(p));p.reason={};assert.throws(()=>validateSubmission(p));});
