import {neon} from '@neondatabase/serverless';
export function database(){const url=process.env.DATABASE_URL;if(!url)throw Error('Database not configured');return neon(url);}
