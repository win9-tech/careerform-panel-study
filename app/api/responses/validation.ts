const sequences = new Set(["ABC","ACB","BAC","BCA","CAB","CBA"]);
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export function validateSubmission(raw: unknown) {
  if (!raw || typeof raw !== "object") throw new Error("Invalid response");
  const x = raw as Record<string, any>;
  if (!uuid.test(x.id ?? "") || x.version !== "panel-study-v21" || !Array.isArray(x.order) || x.order.length !== 3 || !sequences.has(x.order.join("")) || !Array.isArray(x.trials) || x.trials.length !== 3 || !["A","B","C","none"].includes(x.preference)) throw new Error("Incomplete response");
  const trials = x.trials.map((t: any, i: number) => {
    if (!t || t.variant !== x.order[i] || !t.ratings || !["comfort","trust","wait"].every(k => Number.isInteger(t.ratings[k]) && t.ratings[k]>=1 && t.ratings[k]<=5) || !Number.isFinite(t.durationMs) || t.durationMs<6615 || t.durationMs>3600000 || typeof t.reducedMotion !== "boolean") throw new Error("Invalid trial");
    return {variant:t.variant, ratings:{comfort:t.ratings.comfort,trust:t.ratings.trust,wait:t.ratings.wait},durationMs:t.durationMs,reducedMotion:t.reducedMotion};
  });
  return {id:x.id as string,version:x.version as string,order:[...x.order] as string[],trials,preference:x.preference as string};
}
