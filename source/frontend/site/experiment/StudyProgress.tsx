import {useEffect,useRef} from 'react';
import styles from './Experiment.module.css';
export function StudyProgress({current}:{current:number}){return <ol className={styles.studyProgress} aria-label="전체 설문 진행 단계">{['첫 번째 체험','두 번째 체험','세 번째 체험','최종 제출'].map((label,i)=><li key={label} data-state={i+1<current?'done':i+1===current?'current':'next'} aria-current={i+1===current?'step':undefined}><span>{i+1<current?'✓':i+1}</span>{label}</li>)}</ol>}
export function NextTrial({completed,onContinue}:{completed:number;onContinue:()=>void}){
 const heading=useRef<HTMLHeadingElement>(null);useEffect(()=>{heading.current?.focus();window.scrollTo(0,0)},[]);
 return <main className={`${styles.page} ${styles.onboarding}`}><div className={styles.introCard}><StudyProgress current={completed+1}/><p className={styles.eyebrow}>{completed} / 3개 체험 평가 완료</p><h1 ref={heading} tabIndex={-1}>다음 화면도<br/>체험해 주세요.</h1><p>아직 {3-completed}개의 체험이 남아 있어요.</p><div className={styles.focusInstruction}><strong>같은 지원서, 다른 사이드패널</strong><p>지원서는 같지만 패널의 표시 방식이 달라져요. 다음에도 패널이 주는 느낌에 집중해 주세요.</p></div><button onClick={onContinue}>{completed===1?'두 번째':'세 번째'} 체험으로 이동 →</button><p className={styles.introFootnote}>세 체험을 모두 평가하고 마지막에 응답을 제출하면 끝나요.</p></div></main>
}
