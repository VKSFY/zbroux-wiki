import { solve, buildTable, BLOCKS, tableInfo, ROTATIONS, fbLength, rank, type Solve, type Side } from "./solver.ts";
import type { EodCase, ZbCase } from "./breakdown.ts";
import { parse } from "./cube.ts";

let eod = new Map<string, EodCase>(), zb = new Map<string, ZbCase>();
const post = (m: unknown) => (self as unknown as Worker).postMessage(m);

self.onmessage = (ev: MessageEvent) => {
  const msg = ev.data;
  if (msg.type === "init") {
    eod = new Map((msg.eod as EodCase[]).map((c) => [c.k, c]));
    zb = new Map((msg.zb as ZbCase[]).map((c) => [c.k, c]));
    return;
  }
  if (msg.type !== "solve") return;
  const t0 = performance.now(), budget: number = msg.budget;
  const over = () => performance.now() - t0 > budget;
  if (!String(msg.scramble).trim()) { post({ type: "done", error: "Paste a scramble." }); return; }
  try { parse(msg.scramble); } catch (e) { post({ type: "done", error: `Scramble: ${(e as Error).message}.` }); return; }
  try {
    post({ type: "progress", text: "Building the first-block table" });
    buildTable(BLOCKS.FB);
    post({ type: "progress", text: "Building the second-block tables" });
    buildTable(BLOCKS.SB);
    buildTable(BLOCKS.SBL);
    const tables = { ms: performance.now() - t0, info: tableInfo() };
    if (over()) { post({ type: "done", error: "The time budget ran out while building the tables.", tables }); return; }
    const plan: { rot: string; side: Side }[] = [{ rot: "", side: "left" }, { rot: "", side: "right" }];
    if (msg.rotations) {
      plan.push(...ROTATIONS.filter(Boolean).map((rot) => ({ rot, fb: fbLength(msg.scramble, rot) }))
        .sort((a, b) => a.fb - b.fb).map(({ rot }) => ({ rot, side: "left" as Side })));
    }
    const results: Solve[] = [];
    let searched = 0, failed = 0, cut = false, firstError: string | undefined;
    for (const { rot, side } of plan) {
      if (over()) { cut = true; break; }
      post({ type: "progress", text: plan.length > 2 ? `Placement ${searched + 1} of ${plan.length}` : `First block on the ${side}` });
      const r = solve(msg.scramble, eod, zb, rot, side);
      searched++;
      if (r.ok) results.push(r); else { failed++; firstError ??= r.error; }
    }
    results.sort(rank);
    post({ type: "done", results, searched, total: plan.length, cut, failed, tables, ms: performance.now() - t0, firstError });
  } catch (e) {
    post({ type: "done", error: (e as Error).message });
  }
};
