// Public ingestion token: no read/admin access. No SDK autocapture or replay.
const PROJECT_TOKEN = 'phc_miLGVcwbxN7DSE5h6AUTCWDUS6r7pQR7LL3mPcfQsjpN';
const ENDPOINT = 'https://us.i.posthog.com/i/v0/e/';
type Event = 'study_opened' | 'study_started' | 'trial_started' | 'trial_completed' | 'trial_rated' | 'response_submit_started' | 'response_submitted' | 'response_submit_failed';
let anonymousId: string | undefined;
const sent = new Set<string>();
export function track(event: Event, details: {variant?: string; trial?: number} = {}, once = false) {
  // Analytics cannot interrupt the experiment, even when storage/network is blocked.
  try {
    if (location.hostname !== 'careerform-panel-study.vercel.app' || !location.pathname.startsWith('/experiment')) return;
    const marker = `panel-study-analytics-${event}-${details.trial ?? ''}`;
    if (once && (sent.has(marker) || sessionStorage.getItem(marker))) return;
    anonymousId ??= sessionStorage.getItem('panel-study-analytics-id') ?? crypto.randomUUID();
    sessionStorage.setItem('panel-study-analytics-id', anonymousId);
    const properties: Record<string, unknown> = {$process_person_profile:false,$geoip_disable:true,study_version:'panel-study-v21'};
    if (['A','B','C'].includes(details.variant ?? '')) properties.variant=details.variant;
    if (Number.isInteger(details.trial) && details.trial! >= 1 && details.trial! <= 3) properties.trial=details.trial;
    if (once) { sent.add(marker); sessionStorage.setItem(marker,'1'); }
    void fetch(ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json'},credentials:'omit',referrerPolicy:'no-referrer',keepalive:true,body:JSON.stringify({api_key:PROJECT_TOKEN,event,distinct_id:anonymousId,properties})}).catch(()=>{});
  } catch { /* Analytics is optional. */ }
}
