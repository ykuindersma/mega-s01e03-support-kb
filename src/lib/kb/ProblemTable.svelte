<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import type { Report } from '#lib/kb/causes';
  import { tenantOf } from '#lib/kb/locales';
  import { PROBLEMS, splitTicket, type Problem } from '#lib/kb/problems';

  let { ticket, issues }: { ticket: number; issues: Partial<Record<Problem, string>> } = $props();

  const split = $derived(splitTicket(reports as Report[], ticket, tenantOf, notes.oneDayMove));
  const list = (n: Record<string, number>) =>
    Object.entries(n)
      .sort((a, b) => b[1] - a[1])
      .map(([k, v]) => `${k} ×${v}`)
      .join(' · ');
</script>

<p class="sum">
  <strong>{split.reports}</strong> reports merged into #{ticket}
  ({split.exportedRows} rows in the export; {split.exportedRows - split.reports} came twice) ·
  <strong>{split.groups.length}</strong> problems
</p>

<table>
  <thead>
    <tr><th>problem</th><th>reports</th><th>tenants</th><th>channels</th><th>intake tagged</th><th>seen</th><th>ticket</th></tr>
  </thead>
  <tbody>
    {#each split.groups as g (g.problem)}
      <tr>
        <td><code>{g.problem}</code><br /><span class="what">{g.problem === 'unplaced' ? 'no tenant on file' : PROBLEMS[g.problem]}</span></td>
        <td><strong>{g.ids.length}</strong></td>
        <td>{g.tenants.length}</td>
        <td class="small">{list(g.channels)}</td>
        <td class="small">{list(g.taggedAs)}</td>
        <td class="small">{g.firstSeen} → {g.lastSeen}</td>
        <td>{#if g.problem !== 'unplaced' && issues[g.problem]}<a href={issues[g.problem]}>{issues[g.problem]?.replace(/^.*\/issues\//, 'issue ')}</a>{:else}none{/if}</td>
      </tr>
    {/each}
  </tbody>
</table>

<details>
  <summary>Report ids per problem</summary>
  {#each split.groups as g (g.problem)}
    <p class="small"><code>{g.problem}</code> ({g.ids.length}): {g.ids.join(', ')}</p>
  {/each}
</details>

<style>
  .sum { font-size: 1.1rem; }
  .what, .small { color: var(--muted); font-size: 0.85em; }
</style>
