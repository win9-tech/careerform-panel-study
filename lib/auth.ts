import {createHmac, timingSafeEqual,createHash} from 'node:crypto';
export const COOKIE='study_admin';
function equal(a:string,b:string){return timingSafeEqual(createHash('sha256').update(a).digest(),createHash('sha256').update(b).digest())}
export function passwordValid(password:string){return !!process.env.ADMIN_PASSWORD && process.env.ADMIN_PASSWORD.length>=20 && equal(password,process.env.ADMIN_PASSWORD)}
export function createSession(){if(!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length<32)throw Error('Session secret not configured');const expiry=String(Date.now()+8*3600000);return expiry+'.'+createHmac('sha256',process.env.SESSION_SECRET).update(expiry).digest('hex')}
export function validSession(value:string|undefined){if(!value || !process.env.SESSION_SECRET)return false;const [expiry,signature,...extra]=value.split('.');return !extra.length && /^\d+$/.test(expiry) && Number(expiry)>Date.now() && Number(expiry)<=Date.now()+8*3600000 && !!signature && equal(signature,createHmac('sha256',process.env.SESSION_SECRET).update(expiry).digest('hex'))}
export function sameOrigin(request:Request){return request.headers.get('origin')===new URL(request.url).origin}
