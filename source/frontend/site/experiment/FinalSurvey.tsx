import { useEffect, useRef, useState } from "react";
import { LoadingVariant } from "./LoadingVariant";
import { exportStudy, type Preference, type Study } from "./study";
import styles from "./Experiment.module.css";
const ordinals = ["첫 번째", "두 번째", "세 번째"];
export function FinalSurvey({
  study,
  onChange,
}: {
  study: Study;
  onChange: (preference: Preference, reason: string) => void;
}) {
  const [preference, setPreference] = useState<Preference | "">(
    study.final?.preference ?? "",
  );
  const reason = "";
  const [message, setMessage] = useState("");
  const heading = useRef<HTMLHeadingElement>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [locked, setLocked] = useState(false);
  const sending = useRef(false);
  const submission = useRef<Record<string, unknown> | null>(null);
  useEffect(() => {
    heading.current?.focus();
    try {
      const cached = sessionStorage.getItem(`${study.version}-submission`);
      if (cached) {
        const payload = JSON.parse(cached);
        if (JSON.stringify(payload.trials) === JSON.stringify(study.trials) && JSON.stringify(payload.order) === JSON.stringify(study.order)) {
          submission.current = payload;
          setPreference(payload.preference);
          setLocked(true);
        } else sessionStorage.removeItem(`${study.version}-submission`);
      }
    } catch { /* Storage may be unavailable. */ }
  }, []);
  const submit = async () => {
    if (!preference || sending.current || saved) return;
    sending.current = true; setSaving(true); setLocked(true); setMessage("");
    try {
      if (!submission.current) {
        const key = `${study.version}-submission`;
        try { const cached = sessionStorage.getItem(key); if (cached) submission.current = JSON.parse(cached); } catch { /* preserve in-memory retry */ }
        if (!submission.current) {
          submission.current = { id: crypto.randomUUID(), ...exportStudy(study, preference, reason) };
          try { sessionStorage.setItem(key, JSON.stringify(submission.current)); } catch { /* retain same id in memory */ }
        }
      }
      const response = await fetch("/api/responses", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submission.current), signal: AbortSignal.timeout(15000),
      });
      const result = await response.json();
      if (!response.ok || result.saved !== true) throw new Error(result.error || "응답을 저장하지 못했어요.");
      setSaved(true); setMessage("응답이 안전하게 저장됐어요. 참여해 주셔서 감사합니다!");
    } catch (error) {
      setMessage(`${error instanceof Error && error.name !== "TimeoutError" ? error.message : "연결이 지연되고 있어요."} 선택한 응답은 유지됩니다. 다시 저장해 주세요.`);
    } finally { sending.current=false; setSaving(false); }
  };
  return (
    <form
      className={`${styles.card} ${styles.survey} ${styles.finalSurvey}`}
      onSubmit={(event) => {
        event.preventDefault();
        void submit();
      }}
    >
      <h2 ref={heading} tabIndex={-1}>
        마지막으로, 어떤 체험이 가장 좋았나요?
      </h2>
      <p>
        체험했던 순서대로 세 화면을 나란히 보여드려요. 하나를 선택해 주세요.
      </p>
      <p className={styles.scrollHint}>
        좁은 화면에서는 좌우로 밀어 비교할 수 있어요.
      </p>
      <fieldset disabled={locked}>
        <legend>가장 선호한 체험</legend>
        <div
          className={styles.previews}
          role="group"
          aria-label="체험 화면 비교"
          tabIndex={0}
        >
          {study.order.map((variant, index) => (
            <div className={styles.preview} key={variant}>
              <label>
                <input
                  type="radio"
                  name="preference"
                  value={variant}
                  checked={preference === variant}
                  onChange={() => {
                    setPreference(variant);
                    onChange(variant, reason);
                  }}
                />
                {ordinals[index]} 체험
              </label>
              <div aria-hidden="true" inert>
                <LoadingVariant
                  variant={variant}
                  completed={20}
                  reducedMotion
                />
              </div>
            </div>
          ))}
        </div>
        <label className={styles.none}>
          <input
            type="radio"
            name="preference"
            value="none"
            checked={preference === "none"}
            onChange={() => {
              setPreference("none");
              onChange("none", reason);
            }}
          />
          차이 없음
        </label>
      </fieldset>
      <p>
        저장 버튼을 누르면 조사자에게 응답이 제출돼요. 예제 지원서 정보는 전송하지 않아요.
      </p>
      <button type="submit" disabled={!preference || saving || saved}>
        {saved ? "응답 저장 완료" : saving ? "응답 저장 중…" : "응답 저장하기"}
      </button>
      {message && <p role="status">{message}</p>}
    </form>
  );
}
