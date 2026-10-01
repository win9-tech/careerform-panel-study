import {useEffect,useState} from 'react';
import {LoadingVariant} from './LoadingVariant';
export function LocalPreview(){
 const [count,setCount]=useState(8),[playing,setPlaying]=useState(false);
 useEffect(()=>{if(!playing)return;const timer=setInterval(()=>setCount(c=>{if(c>=40){setPlaying(false);return 40}return c+1}),220);return()=>clearInterval(timer)},[playing]);
 return <main style={{maxWidth:1140,margin:'48px auto',padding:24,color:'#483528'}}>
 <p style={{fontWeight:700,color:'#996536'}}>로컬 디자인 미리보기 · 배포 전</p><h1 style={{fontSize:30,margin:'12px 0'}}>같은 진행 상황, 세 가지 표현</h1>
 <p style={{lineHeight:1.8}}>캐릭터·색상·크기는 같게 유지하고, 완료한 양 / 진행 비율 / 남은 양만 비교합니다.</p>
 <div style={{display:'flex',alignItems:'center',gap:16,flexWrap:'wrap',margin:'24px 0',padding:18,background:'#f4ecdf',borderRadius:16}}>
 <button onClick={()=>{setCount(0);setPlaying(true)}} style={{padding:'10px 18px',borderRadius:10,background:'#744624',color:'white',border:0}}>처음부터 재생</button>
 <button onClick={()=>setPlaying(false)} style={{padding:'10px 18px',borderRadius:10,border:'1px solid #d8c7b0'}}>멈추기</button>
 <label>입력된 항목 {count} / 40 <input aria-label="진행 상황 조절" type="range" min="0" max="40" value={count} onChange={e=>{setPlaying(false);setCount(Number(e.target.value))}} style={{marginLeft:12,verticalAlign:'middle'}}/></label></div>
 <div style={{display:'grid',gridTemplateColumns:'repeat(3,minmax(260px,1fr))',gap:20,overflowX:'auto'}}>
 {(['A','B','C'] as const).map((variant,i)=><section key={variant} style={{background:'#fff',border:'1px solid #e6d9c7',borderRadius:24,overflow:'hidden'}}><h2 style={{padding:'18px 22px',margin:0,fontSize:15,borderBottom:'1px solid #eee4d8'}}>{['완료 작업 수형','로딩바형','남은 작업 수형'][i]}</h2><LoadingVariant variant={variant} completed={count} reducedMotion={false}/></section>)}
 </div><p style={{marginTop:24}}><a href="/experiment/">실제 체험 흐름으로 보기 →</a></p></main>
}
