// The problems inside a merged ticket. causes.ts places a report by tenant and channel; a report the
// desk read as a one-day move (desk-notes.json) is not a month flip at all, so it is its own problem.
import { causeOf, uniqueById, type Report, type Tenant } from '#lib/kb/causes';

export type Problem = 'parser' | 'hint' | 'shift';

export const PROBLEMS: Record<Problem, string> = {
  parser: 'Shared parser reads day-first dates month first',
  hint: 'booking-v3 form hint says MM/DD/YYYY at day-first tenants',
  shift: 'Invite lands one day off (time zone), not a month flip',
};

export function problemOf(r: Report, t: Tenant | undefined, shifted: ReadonlySet<string>): Problem | 'unplaced' {
  if (shifted.has(r.id)) return 'shift';
  return causeOf(r, t) ?? 'unplaced';
}

export type ProblemGroup = {
  problem: Problem | 'unplaced';
  ids: string[];
  tenants: string[];
  channels: Record<string, number>;
  taggedAs: Record<string, number>;
  firstSeen: string;
  lastSeen: string;
};

const tally = (xs: string[]) => xs.reduce<Record<string, number>>((n, x) => ({ ...n, [x]: (n[x] ?? 0) + 1 }), {});

export function splitTicket(
  exported: Report[],
  ticket: number,
  tenantOf: (r: Report) => Tenant | undefined,
  shifted: readonly string[],
): { exportedRows: number; reports: number; groups: ProblemGroup[] } {
  const merged = uniqueById(exported).filter((r) => r.mergedInto === ticket);
  const moved = new Set(shifted);
  const by = new Map<ProblemGroup['problem'], Report[]>();
  for (const r of merged) {
    const p = problemOf(r, tenantOf(r), moved);
    by.set(p, [...(by.get(p) ?? []), r]);
  }
  const groups = [...by.entries()]
    .map(([problem, rs]) => {
      const days = rs.map((r) => r.receivedAt.slice(0, 10)).sort();
      return {
        problem,
        ids: rs.map((r) => r.id),
        tenants: [...new Set(rs.map((r) => r.tenant))].sort(),
        channels: tally(rs.map((r) => r.channel)),
        taggedAs: tally(rs.map((r) => r.meta.intakeTag)),
        firstSeen: days[0],
        lastSeen: days[days.length - 1],
      };
    })
    .sort((a, b) => b.ids.length - a.ids.length);
  return { exportedRows: exported.filter((r) => r.mergedInto === ticket).length, reports: merged.length, groups };
}
