import type { Level, Participant } from "./types";

export const LVL_SCORE: Record<Level, number> = {
  Beginner: 1,
  Intermediate: 2,
  Advanced: 3,
};

export function initials(name: string) {
  return name
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/** Balanced team builder (snake deal by level) */
export function buildBalancedTeams(pool: Participant[], perTeam: number) {
  const sorted = [...pool].sort(
    (a, b) => LVL_SCORE[b.level] - LVL_SCORE[a.level]
  );
  const A: Participant[] = [];
  const B: Participant[] = [];
  let toggle = true;
  for (const p of sorted) {
    if ((toggle && A.length < perTeam) || B.length >= perTeam) A.push(p);
    else B.push(p);
    toggle = !toggle;
  }
  return { A, B };
}
