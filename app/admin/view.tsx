"use client";
import {useEffect,useState} from "react";
type Result={id:string;receivedAt:string;preference:string;order:string[];trials:{variant:string;ratings:{comfort:number;trust:number;wait:number}}[]};
const names:Record<string,string>={A:"완료 작업 수형",B:"로딩바형",C:"남은 작업 수형",none:"차이 없음"};
export default function Admin(){
 const [version,setVersion]=useState("panel-study-v22");
 const [rows,setRows]=useState<Result[]>([]),[message,setMessage]=useState("불러오는 중이에요"),[loading,setLoading]=useState(true);
 async function refresh(){setLoading(true);try{const r=await fetch(`/api/admin/responses?version=${version}`,{cache:"no-store"});if(!r.ok)throw Error();const d=await r.json() as {responses:Result[]};setRows(d.responses);setMessage(d.responses.length?"":"아직 제출된 응답이 없어요.");}catch{setMessage("응답을 불러오지 못했어요. 다시 시도해 주세요.");}finally{setLoading(false);}}
 useEffect(()=>{void refresh();},[version]);
 return <main style={{maxWidth:1100,margin:"40px auto",padding:24,color:"#483528",fontFamily:"sans-serif"}}>
 <p>커리어폼 · 조사자 전용</p><h1 style={{fontSize:30,fontWeight:700}}>체험 응답 {rows.length}건</h1>
 <div style={{display:"flex",gap:20,margin:"20px 0"}}><button disabled={loading} onClick={refresh}>새로고침</button><a href={`/api/admin/responses?format=csv&version=${version}`}>CSV 내려받기</a><a href="/experiment/index.html">체험 보기</a><button onClick={async()=>{await fetch("/api/admin/logout",{method:"POST"});window.location.reload()}}>로그아웃</button></div>
 <label>실험 버전 <select value={version} onChange={e=>{setRows([]);setVersion(e.target.value)}}><option value="panel-study-v22">v22 · 패널 강조 (현재)</option><option value="panel-study-v21">v21 · 변경 전</option></select></label>
 <p role="status">{message}</p>
 <div style={{display:"flex",gap:16,flexWrap:"wrap",margin:"24px 0"}}>{["A","B","C"].map(v=>{const scores=rows.flatMap(r=>r.trials.filter(t=>t.variant===v));const avg=(k:"comfort"|"trust"|"wait")=>scores.length?(scores.reduce((n,t)=>n+t.ratings[k],0)/scores.length).toFixed(2):"—";return <section key={v} style={{background:"#faf5ee",padding:20,borderRadius:14,minWidth:220}}><h2>{names[v]}</h2><p>선호 {rows.filter(r=>r.preference===v).length}명</p><p>편안함 {avg("comfort")} · 신뢰감 {avg("trust")}</p><p>체감 대기 {avg("wait")}</p></section>;})}</div>
 <p>차이 없음 {rows.filter(r=>r.preference==="none").length}명 · 체감 대기는 점수가 높을수록 길게 느낀 응답입니다.</p>
 <div style={{overflowX:"auto"}}><table style={{width:"100%",textAlign:"left",borderCollapse:"collapse"}}><thead><tr><th>수신 시각</th><th>순서</th><th>선호</th><th>응답 번호</th></tr></thead><tbody>{rows.map(r=><tr key={r.id} style={{borderTop:"1px solid #e8dfd2"}}><td style={{padding:"14px 0"}}>{new Date(r.receivedAt).toLocaleString("ko-KR",{timeZone:"Asia/Seoul"})}</td><td>{r.order.join(" → ")}</td><td>{names[r.preference]}</td><td>{r.id.slice(0,8)}</td></tr>)}</tbody></table></div>
 </main>;
}
