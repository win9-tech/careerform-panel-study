import { database } from "../../../lib/db";
import { validateSubmission } from "./validation";
export const dynamic = "force-dynamic";
export async function POST(request: Request) {
  const json=(data:unknown,status=200)=>Response.json(data,{status,headers:{"Cache-Control":"no-store"}});
  const origin=request.headers.get("origin");
  if (!origin || origin!==new URL(request.url).origin) return json({error:"허용되지 않은 요청입니다."},403);
  if (!(request.headers.get("content-type")??"").startsWith("application/json")) return json({error:"잘못된 요청입니다."},415);
  let response;
  try { const text=await request.text(); if(text.length>16000) return json({error:"응답이 너무 큽니다."},413); response=validateSubmission(JSON.parse(text)); }
  catch { return json({error:"세 체험과 최종 선택을 모두 완료해 주세요."},400); }
  try {
    const db=database(); const payload=JSON.stringify(response);
    await db`INSERT INTO study_responses (id, received_at, version, sequence, preference, payload) VALUES (${response.id}, ${new Date().toISOString()}, ${response.version}, ${response.order.join("")}, ${response.preference}, ${payload}) ON CONFLICT(id) DO NOTHING`;
    const rows=await db`SELECT payload FROM study_responses WHERE id = ${response.id}`;
    const saved=rows[0];
    if (!saved) throw new Error("Save unconfirmed");
    if (saved.payload!==payload) return json({error:"이미 제출된 응답입니다. 기존 응답은 변경되지 않았어요."},409);
    return json({saved:true,id:response.id});
  } catch { return json({error:"저장하지 못했어요. 응답은 유지됩니다. 잠시 후 다시 시도해 주세요."},503); }
}
