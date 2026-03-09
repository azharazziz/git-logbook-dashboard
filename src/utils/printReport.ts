import { NormalizedCommit } from "@/types/commit";
import dayjs from "dayjs";

export function generatePrintReport(commits: NormalizedCommit[], title = "Git Logbook Report") {
  const grouped: Record<string, NormalizedCommit[]> = {};
  commits.forEach((c) => {
    const day = dayjs(c.date).format("MMMM D, YYYY");
    if (!grouped[day]) grouped[day] = [];
    grouped[day].push(c);
  });

  const days = Object.entries(grouped);

  // Stats
  const totalCommits = commits.length;
  const activeRepos = new Set(commits.map((c) => c.repo)).size;
  const authors = [...new Set(commits.map((c) => c.author))];
  const dateRange = commits.length > 0
    ? `${dayjs(commits[commits.length - 1].date).format("MMM D, YYYY")} — ${dayjs(commits[0].date).format("MMM D, YYYY")}`
    : "—";

  const repoStats: Record<string, number> = {};
  commits.forEach((c) => { repoStats[c.repo] = (repoStats[c.repo] || 0) + 1; });

  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>${title}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', system-ui, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; color: #1a1a1a; }
    .header { text-align: center; margin-bottom: 32px; border-bottom: 2px solid #e5e7eb; padding-bottom: 24px; }
    .header h1 { font-size: 22px; margin-bottom: 4px; }
    .header p { color: #6b7280; font-size: 13px; }
    .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 32px; }
    .stat { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; text-align: center; }
    .stat-value { font-size: 20px; font-weight: 700; }
    .stat-label { font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; }
    .section { margin-bottom: 24px; }
    .section h2 { font-size: 14px; font-weight: 600; margin-bottom: 8px; color: #374151; border-left: 3px solid #3b82f6; padding-left: 8px; }
    .commit-list { list-style: none; }
    .commit-list li { padding: 4px 0; font-size: 13px; border-bottom: 1px solid #f3f4f6; display: flex; gap: 8px; }
    .commit-list li:last-child { border-bottom: none; }
    .repo-tag { background: #eff6ff; color: #2563eb; font-size: 10px; padding: 1px 6px; border-radius: 4px; white-space: nowrap; }
    .author-tag { color: #6b7280; font-size: 11px; }
    .repo-summary { margin-bottom: 24px; }
    .repo-summary table { width: 100%; border-collapse: collapse; font-size: 13px; }
    .repo-summary th, .repo-summary td { padding: 6px 12px; border: 1px solid #e5e7eb; text-align: left; }
    .repo-summary th { background: #f9fafb; font-weight: 600; }
    .footer { text-align: center; color: #9ca3af; font-size: 11px; margin-top: 40px; border-top: 1px solid #e5e7eb; padding-top: 16px; }
    @media print { body { padding: 20px; } .no-print { display: none; } }
  </style>
</head>
<body>
  <div class="header">
    <h1>${title}</h1>
    <p>Generated on ${dayjs().format("MMMM D, YYYY HH:mm")} · Period: ${dateRange}</p>
  </div>

  <div class="stats">
    <div class="stat"><div class="stat-value">${totalCommits}</div><div class="stat-label">Total Commits</div></div>
    <div class="stat"><div class="stat-value">${activeRepos}</div><div class="stat-label">Repositories</div></div>
    <div class="stat"><div class="stat-value">${authors.length}</div><div class="stat-label">Authors</div></div>
    <div class="stat"><div class="stat-value">${days.length}</div><div class="stat-label">Active Days</div></div>
  </div>

  <div class="repo-summary">
    <h2 style="font-size:14px;font-weight:600;margin-bottom:8px;border-left:3px solid #3b82f6;padding-left:8px;">Repository Summary</h2>
    <table>
      <thead><tr><th>Repository</th><th>Commits</th></tr></thead>
      <tbody>${Object.entries(repoStats).map(([name, count]) => `<tr><td>${name}</td><td>${count}</td></tr>`).join("")}</tbody>
    </table>
  </div>

  ${days.map(([day, items]) => `
    <div class="section">
      <h2>${day}</h2>
      <ul class="commit-list">
        ${items.map((c) => `
          <li>
            <span>${c.message.split("\n")[0]}</span>
            <span class="repo-tag">${c.repo}</span>
            <span class="author-tag">${c.author}</span>
          </li>
        `).join("")}
      </ul>
    </div>
  `).join("")}

  <div class="footer">
    Git Logbook Dashboard · Auto-generated report
  </div>
</body>
</html>`;

  return html;
}

export function printReport(commits: NormalizedCommit[], title?: string) {
  const html = generatePrintReport(commits, title);
  const w = window.open("", "_blank");
  if (!w) return;
  w.document.write(html);
  w.document.close();
  setTimeout(() => w.print(), 400);
}
