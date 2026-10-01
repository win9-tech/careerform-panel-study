import {StudyProgress, NextTrial} from "./StudyProgress";
import { track } from "./analytics";
import { useEffect, useRef, useState } from "react";
import { PanelPreview } from "../demo/PanelPreview";
import { experimentRepository } from "./profile";
import { ApplicationForm } from "./ApplicationForm";
import { LoadingVariant } from "./LoadingVariant";
import { startScenario, SCENARIO_DURATION_MS } from "./scenario";
import {
  createStudy,
  loadStudy,
  saveStudy,
  recordTrial,
  VARIANT_COUNT,
  type Ratings,
} from "./study";
import { TrialSurvey } from "./TrialSurvey";
import { FinalSurvey } from "./FinalSurvey";
import demo from "../demo/Simulation.module.css";
import styles from "./Experiment.module.css";
const ordinals = ["첫 번째", "두 번째", "세 번째"];
export function Experiment() {
  const [study, setStudy] = useState(() => {
    const assigned = new URLSearchParams(window.location.search).get("order");
    const saved = loadStudy();
    const orders = ["ABC", "ACB", "BAC", "BCA", "CAB", "CBA"];
    const orderIndex = orders.indexOf(assigned ?? "");
    if (orderIndex >= 0) {
      return saved?.order.join("") === assigned
        ? saved
        : createStudy((orderIndex + 0.5) / orders.length);
    }
    return saved ?? createStudy();
  });
  const [stage, setStage] = useState<
    "ready" | "running" | "complete" | "survey"
  >("ready");
  const [betweenTrials, setBetweenTrials] = useState(false);
  const [introduced, setIntroduced] = useState(false);
  const [completed, setCompleted] = useState(0);
  const [panelOpen, setPanelOpen] = useState(true);
  const [attempt, setAttempt] = useState(0);
  const [notice, setNotice] = useState("");
  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => {
    const context = (document as Document & { modelContext?: { registerTool: (tool: unknown, options: unknown) => Promise<void> | void } }).modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    Promise.resolve(context.registerTool({ name: "read_study_progress", description: "Read study progress without answering or submitting participant ratings.", inputSchema: { type: "object", properties: {}, additionalProperties: false }, annotations: { readOnlyHint: true }, execute: () => ({stage,completedTrials:study.trials.length,totalTrials:3,completedFields:completed}) }, {signal:lifecycle.signal})).catch(() => {});
    return () => lifecycle.abort();
  }, [stage,study.trials.length,completed]);
  const root = useRef<HTMLDivElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const running = useRef(false);
  const cancel = useRef(() => {});
  const duration = useRef(0);
  const completionTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const reset = () => {
    clearTimeout(completionTimer.current);
    cancel.current();
    running.current = false;
    duration.current = 0;
    setCompleted(0);
    setStage("ready");
    setAttempt((n) => n + 1);
  };
  useEffect(() => {
    saveStudy(study);
  }, [study]);
  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === "hidden" && running.current) {
        reset();
        setNotice(
          "화면을 벗어나 체험을 중단했어요. 같은 체험을 다시 시작해 주세요.",
        );
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      clearTimeout(completionTimer.current);
      cancel.current();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);
  useEffect(() => {
    if (stage === "complete" || stage === "survey") heading.current?.focus();
    if (stage === "ready")
      root.current
        ?.querySelector<HTMLButtonElement>("[data-autofill-start]")
        ?.focus();
  }, [stage, attempt, panelOpen]);
  const start = async () => {
    if (
      running.current ||
      stage !== "ready" ||
      !root.current ||
      document.visibilityState === "hidden"
    )
      return;
    running.current = true;
    setNotice("");
    setReducedMotion(
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false,
    );
    track("trial_started", {variant: study.order[study.trials.length], trial: study.trials.length + 1});
    setStage("running");
    cancel.current = startScenario({
      root: root.current,
      onProgress: setCompleted,
      onComplete: (ms) => {
        duration.current = ms;
        completionTimer.current = setTimeout(() => {
          running.current = false;
          track("trial_completed", {variant: study.order[study.trials.length], trial: study.trials.length + 1});
          setStage("complete");
        }, 400);
      },
      onError: () => {
        reset();
        setNotice("입력을 완료하지 못했어요. 같은 체험을 다시 시작해 주세요.");
      },
    });
  };
  const rate = (ratings: Ratings) => {
    if (stage !== "survey" || duration.current < SCENARIO_DURATION_MS) return;
    track("trial_rated", {variant: study.order[study.trials.length], trial: study.trials.length + 1}, true);
    setStudy(
      recordTrial(study, {
        variant: study.order[study.trials.length]!,
        ratings,
        durationMs: duration.current,
        reducedMotion,
      }),
    );
    reset();
    if (study.trials.length + 1 < VARIANT_COUNT) setBetweenTrials(true);
  };
  if (betweenTrials) return <NextTrial completed={study.trials.length} onContinue={() => {setBetweenTrials(false);setPanelOpen(true);window.scrollTo(0,0);}} />;
  if (!introduced && (study.trials.length === 0 || (import.meta.env.DEV && new URLSearchParams(location.search).get("view") === "intro")))
    return (
      <main className={`${styles.page} ${styles.onboarding}`}>
        <div className={styles.introCard}>
          <p className={styles.eyebrow}>커리어폼 · 사용자 경험 조사</p>
          <h1>
            기다리는 동안,<br />어떤 느낌이 드나요?
          </h1>
          <p className={styles.introLead}>세 가지 대기 화면을 체험하고 평가해 주세요.</p>
          <div className={styles.focusInstruction}>
            <span className={styles.focusTag}>체험할 때는 이렇게</span>
            <p><strong>‘자동 기입’을 누른 뒤,<br />사이드패널이 주는 느낌에 집중해 주세요.</strong></p>
            <span>지원서가 채워지는 동안 패널을 지켜봐 주세요.</span>
          </div>
          <p className={styles.introSummary}>3가지 체험 <span>·</span> 약 1~2분 <span>·</span> 정답 없음</p>
          <button type="button" onClick={() => { track("study_started", {}, true); setIntroduced(true); }}>
            체험 시작하기
          </button>
          <p className={styles.introFootnote}>예제 정보로 진행하며 실제 지원서는 제출되지 않아요.</p>
          <details className={styles.collectionNote}><summary>데이터 수집 안내</summary><p>평가 응답을 저장하고, 진행 단계는 익명으로 분석합니다. 화면 녹화와 입력값 수집은 하지 않습니다.</p></details>
        </div>
      </main>
    );
  if (study.trials.length === VARIANT_COUNT)
    return (
      <div className={styles.page}>
        <StudyProgress current={4} />
        <FinalSurvey
          study={study}
          onChange={(preference, reason) =>
            setStudy((current) => ({
              ...current,
              final: { preference, reason },
            }))
          }
        />
      </div>
    );
  if (stage === "survey")
    return (
      <div className={styles.page}>
        <StudyProgress current={study.trials.length+1} />
        <TrialSurvey onSave={rate} trialNumber={study.trials.length+1} />
      </div>
    );
  return (
    <div className={styles.page} ref={root}>
      <StudyProgress current={study.trials.length+1} />
      <header className={styles.studyHeader}>
        <div>
          <p>커리어폼 · 화면 체험</p>
          <h1>
            {ordinals[study.trials.length]} 체험{" "}
            <small>/ {VARIANT_COUNT}</small>
          </h1>
        </div>
        <p>
          가상 지원서·예제 데이터로 체험합니다.
          <br />
          패널의 ‘자동 기입’을 눌러 시작해 주세요.
        </p>
      </header>
      {stage === "ready" && (
        <p className={styles.notice}>
          자동 기입 중에는 지원서가 흐리게 표시됩니다. 커리어폼 패널을 중심으로 살펴봐 주세요.
        </p>
      )}
      {notice && (
        <p role="alert" className={styles.notice}>
          {notice}
        </p>
      )}
      <div className={`${demo.workspace} ${styles.workspace}`} data-panel-focus={stage === "running"}>
        <ApplicationForm key={attempt} />
        <aside
          className={`${demo.sidebar} ${styles.sidebar}`}
          aria-label="지원서 패널"
        >
          <div className={demo.panelLocation}>커리어폼 · 지원서 패널</div>
          {panelOpen ? (
            <PanelPreview
              repository={experimentRepository}
              onAutofill={start}
              onReturn={reset}
              onClose={() => {
                reset();
                setPanelOpen(false);
              }}
              autofillView={
                stage === "running" ? (
                  <LoadingVariant
                    variant={study.order[study.trials.length]!}
                    completed={completed}
                    reducedMotion={reducedMotion}
                  />
                ) : stage === "complete" ? (
                  <section
                    className={`${styles.card} ${styles.completionCard}`}
                  >
                    <span className={styles.completionIcon} aria-hidden="true">
                      ✓
                    </span>
                    <h2 ref={heading} tabIndex={-1}>
                      {ordinals[study.trials.length]} 체험 완료
                    </h2>
                    <p>{study.trials.length < 2 ? `전체 3개 중 ${study.trials.length+1}번째 체험이에요. 짧게 평가한 뒤 다음 체험으로 넘어가요.` : "마지막 체험이에요. 평가한 뒤 최종 응답을 제출해 주세요."}</p>
                    <button
                      className={styles.evaluateButton}
                      type="button"
                      onClick={() => setStage("survey")}
                    >
                      이번 체험 평가하기 <span aria-hidden="true">→</span>
                    </button>
                    <small className={styles.evaluationHint}>
                      방금 체험에 대한 세 가지 질문이에요
                    </small>
                  </section>
                ) : undefined
              }
            />
          ) : (
            <div className={styles.card}>
              <button type="button" onClick={() => setPanelOpen(true)}>
                패널 다시 열기
              </button>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
