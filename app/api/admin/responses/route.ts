import {database} from "../../../../lib/db";
import {cookies} from "next/headers";
import {COOKIE,validSession} from "../../../../lib/auth";
export const dynamic="force-dynamic";
export async function GET(request:Request) {
  if(!validSession((await cookies()).get(COOKIE)?.value)) return Response.json({error:"조사자만 볼 수 있어요."},{status:403,headers:{"Cache-Control":"no-store"}});
  try {
    const rows=await database()`SELECT id, received_at, payload FROM study_responses ORDER BY received_at DESC LIMIT 10000`;
    const version = new URL(request.url).searchParams.get("version") ?? "panel-study-v22";
    const items=rows.map(r=>({...JSON.parse(r.payload),receivedAt:r.received_at})).filter(r=>r.version===version);
    if(new URL(request.url).searchParams.get("format")==="csv") {
      const cells=(row:unknown[])=>row.map(v=>'"'+String(v??"").replace(/^(\s*[=+@-])/, "'$1").replaceAll('"','""')+'"').join(',');
      const lines=[cells(["response_id","received_at","version","order","variant","comfort","trust","wait","duration_ms","reduced_motion","preference","feedback"])];
      for(const r of items) for(const t of r.trials) lines.push(cells([r.id,r.receivedAt,r.version,r.order.join(""),t.variant,t.ratings.comfort,t.ratings.trust,t.ratings.wait,t.durationMs,t.reducedMotion,r.preference,r.reason ?? ""]));
      return new Response('\uFEFF'+lines.join('\r\n'),{headers:{"Content-Type":"text/csv; charset=utf-8","Content-Disposition":'attachment; filename="careerform-responses.csv"',"Cache-Control":"no-store"}});
    }
    return Response.json({responses:items},{headers:{"Cache-Control":"no-store"}});
  } catch { return Response.json({error:"응답을 불러오지 못했어요."},{status:503}); }
}
