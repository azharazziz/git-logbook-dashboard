import { NormalizedCommit } from "@/types/commit";
import dayjs from "dayjs";

interface FormalReportOptions {
  title?: string;
  institution?: string;
  department?: string;
  authorName?: string;
  supervisorName?: string;
  reportNumber?: string;
  periodFrom?: Date;
  periodTo?: Date;
}

/* ── Smart Analysis Helpers ─────────────────────────────────────── */

function categorizeCommit(message: string): string {
  const msg = message.toLowerCase();
  if (/^feat(\(|:|\s)/i.test(msg) || msg.includes("add ") || msg.includes("tambah") || msg.includes("implement")) return "Fitur Baru";
  if (/^fix(\(|:|\s)/i.test(msg) || msg.includes("bug") || msg.includes("perbaik") || msg.includes("hotfix")) return "Perbaikan Bug";
  if (/^refactor/i.test(msg) || msg.includes("refactor") || msg.includes("cleanup") || msg.includes("restructure")) return "Refactoring";
  if (/^style/i.test(msg) || msg.includes("ui") || msg.includes("css") || msg.includes("design") || msg.includes("tampilan")) return "Perbaikan UI/UX";
  if (/^docs/i.test(msg) || msg.includes("readme") || msg.includes("dokumentasi")) return "Dokumentasi";
  if (/^test/i.test(msg) || msg.includes("test") || msg.includes("spec")) return "Testing";
  if (/^(chore|build|ci)/i.test(msg) || msg.includes("deploy") || msg.includes("config") || msg.includes("dependency")) return "Maintenance";
  if (/^perf/i.test(msg) || msg.includes("optimiz") || msg.includes("performance")) return "Optimisasi";
  return "Pengembangan Umum";
}

function getDayName(date: string): string {
  const names = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  return names[dayjs(date).day()];
}

function generateNarrativeSummary(
  commits: NormalizedCommit[],
  days: [string, NormalizedCommit[]][],
  repoStats: Record<string, number>,
  categoryStats: Record<string, number>,
  startDate: dayjs.Dayjs,
  endDate: dayjs.Dayjs
): string {
  if (commits.length === 0) return "<p>Tidak ada aktivitas pada periode ini.</p>";

  const totalDays = endDate.diff(startDate, "day") + 1;
  const activeDays = days.length;
  const activePercent = totalDays > 0 ? Math.round((activeDays / totalDays) * 100) : 0;
  const avgPerDay = activeDays > 0 ? (commits.length / activeDays).toFixed(1) : "0";

  // Weekly breakdown
  const weeklyGroups: Record<string, number> = {};
  commits.forEach((c) => {
    const weekStart = dayjs(c.date).startOf("week").format("DD MMM YYYY");
    weeklyGroups[weekStart] = (weeklyGroups[weekStart] || 0) + 1;
  });

  // Most/least productive day of week
  const dayOfWeekCount: Record<number, number> = {};
  commits.forEach((c) => {
    const dow = dayjs(c.date).day();
    dayOfWeekCount[dow] = (dayOfWeekCount[dow] || 0) + 1;
  });
  const dayNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const sortedDows = Object.entries(dayOfWeekCount).sort((a, b) => Number(b[1]) - Number(a[1]));
  const busiestDay = sortedDows[0] ? dayNames[Number(sortedDows[0][0])] : "-";

  // Hour distribution
  const hourBuckets: Record<string, number> = { "Pagi (06-12)": 0, "Siang (12-17)": 0, "Malam (17-22)": 0, "Dini Hari (22-06)": 0 };
  commits.forEach((c) => {
    const h = dayjs(c.date).hour();
    if (h >= 6 && h < 12) hourBuckets["Pagi (06-12)"]++;
    else if (h >= 12 && h < 17) hourBuckets["Siang (12-17)"]++;
    else if (h >= 17 && h < 22) hourBuckets["Malam (17-22)"]++;
    else hourBuckets["Dini Hari (22-06)"]++;
  });
  const peakHour = Object.entries(hourBuckets).sort((a, b) => b[1] - a[1])[0];

  // Top category
  const sortedCategories = Object.entries(categoryStats).sort((a, b) => b[1] - a[1]);
  const topCategory = sortedCategories[0];

  // Authors
  const authorStats: Record<string, number> = {};
  commits.forEach((c) => { authorStats[c.author] = (authorStats[c.author] || 0) + 1; });
  const sortedAuthors = Object.entries(authorStats).sort((a, b) => b[1] - a[1]);

  // Most active single day
  const busiestSingleDay = days.sort((a, b) => b[1].length - a[1].length)[0];

  // Build narrative paragraphs
  let narrative = "";

  // Para 1: Overview
  narrative += `<p>Selama periode pelaporan (${startDate.format("DD MMMM YYYY")} hingga ${endDate.format("DD MMMM YYYY")}), 
    tim pengembangan telah menunjukkan produktivitas yang konsisten dengan total <strong>${commits.length} commit</strong> 
    yang tersebar di <strong>${activeDays} hari kerja aktif</strong> dari total ${totalDays} hari kalender 
    (tingkat aktivitas <strong>${activePercent}%</strong>). Rata-rata produktivitas harian mencapai 
    <strong>${avgPerDay} commit per hari aktif</strong>, yang menunjukkan ritme kerja yang ${
      Number(avgPerDay) >= 5 ? "sangat produktif" : Number(avgPerDay) >= 3 ? "baik dan teratur" : "stabil"
    }.</p>`;

  // Para 2: Category analysis
  if (topCategory) {
    narrative += `<p>Dari analisis kategorisasi commit, aktivitas pengembangan didominasi oleh kategori 
      <strong>"${topCategory[0]}"</strong> dengan ${topCategory[1]} commit (${Math.round((topCategory[1] / commits.length) * 100)}% dari total).`;
    if (sortedCategories.length > 1) {
      narrative += ` Diikuti oleh "${sortedCategories[1][0]}" (${sortedCategories[1][1]} commit)`;
      if (sortedCategories.length > 2) {
        narrative += ` dan "${sortedCategories[2][0]}" (${sortedCategories[2][1]} commit)`;
      }
      narrative += ".";
    }
    narrative += ` Distribusi ini mengindikasikan bahwa fase pengembangan saat ini berfokus pada ${
      topCategory[0] === "Fitur Baru" ? "penambahan fungsionalitas baru" :
      topCategory[0] === "Perbaikan Bug" ? "stabilisasi dan perbaikan kualitas" :
      topCategory[0] === "Refactoring" ? "peningkatan kualitas dan maintainability kode" :
      topCategory[0] === "Perbaikan UI/UX" ? "penyempurnaan antarmuka dan pengalaman pengguna" :
      "pengembangan dan pemeliharaan sistem"
    }.</p>`;
  }

  // Para 3: Time pattern
  narrative += `<p>Pola waktu kerja menunjukkan bahwa mayoritas aktivitas pengembangan dilakukan pada waktu 
    <strong>${peakHour?.[0] || "-"}</strong> dengan ${peakHour?.[1] || 0} commit. 
    Hari <strong>${busiestDay}</strong> tercatat sebagai hari paling produktif dalam seminggu. `;
  if (busiestSingleDay) {
    narrative += `Puncak aktivitas tertinggi dalam satu hari terjadi pada <strong>${dayjs(busiestSingleDay[0]).format("DD MMMM YYYY")} (${getDayName(busiestSingleDay[0])})</strong> 
      dengan <strong>${busiestSingleDay[1].length} commit</strong>.`;
  }
  narrative += `</p>`;

  // Para 4: Author contributions
  if (sortedAuthors.length > 0) {
    narrative += `<p>Dari sisi kontribusi individu, `;
    if (sortedAuthors.length === 1) {
      narrative += `seluruh pekerjaan dilakukan oleh <strong>${sortedAuthors[0][0]}</strong> dengan total ${sortedAuthors[0][1]} commit.`;
    } else {
      narrative += `kontributor paling aktif adalah <strong>${sortedAuthors[0][0]}</strong> dengan ${sortedAuthors[0][1]} commit 
        (${Math.round((sortedAuthors[0][1] / commits.length) * 100)}% dari total). `;
      if (sortedAuthors.length > 1) {
        const otherAuthors = sortedAuthors.slice(1).map(([name, count]) => `${name} (${count} commit)`).join(", ");
        narrative += `Kontributor lainnya meliputi: ${otherAuthors}.`;
      }
    }
    narrative += `</p>`;
  }

  // Para 5: Repository breakdown
  const sortedRepos = Object.entries(repoStats).sort((a, b) => b[1] - a[1]);
  if (sortedRepos.length > 1) {
    narrative += `<p>Distribusi aktivitas antar repository menunjukkan bahwa <strong>${sortedRepos[0][0]}</strong> 
      menjadi fokus utama pengembangan dengan ${sortedRepos[0][1]} commit 
      (${Math.round((sortedRepos[0][1] / commits.length) * 100)}% dari total). `;
    const otherRepos = sortedRepos.slice(1).map(([name, count]) => `${name} (${count} commit)`).join(", ");
    narrative += `Repository lainnya yang aktif: ${otherRepos}. `;
    narrative += `Hal ini menggambarkan prioritas dan alokasi sumber daya pengembangan yang ${
      sortedRepos.length <= 2 ? "terfokus" : "terdiversifikasi dengan baik"
    }.</p>`;
  }

  // Para 6: Weekly trend
  const weekEntries = Object.entries(weeklyGroups).sort((a, b) => a[0].localeCompare(b[0]));
  if (weekEntries.length > 1) {
    const firstWeek = weekEntries[0][1];
    const lastWeek = weekEntries[weekEntries.length - 1][1];
    const trend = lastWeek > firstWeek ? "meningkat" : lastWeek < firstWeek ? "menurun" : "stabil";
    narrative += `<p>Tren produktivitas mingguan menunjukkan pola yang <strong>${trend}</strong>: `;
    narrative += weekEntries.map(([w, c]) => `minggu ${w} (${c} commit)`).join(", ");
    narrative += `. ${trend === "meningkat" 
      ? "Peningkatan ini menunjukkan akselerasi positif dalam proses pengembangan." 
      : trend === "menurun" 
      ? "Penurunan ini mungkin disebabkan oleh fase stabilisasi atau pengerjaan task yang lebih kompleks." 
      : "Konsistensi ini menunjukkan alur kerja yang terorganisir dengan baik."
    }</p>`;
  }

  return narrative;
}

/* ── Report Generator ───────────────────────────────────────────── */

export function generateFormalReport(commits: NormalizedCommit[], options: FormalReportOptions = {}) {
  const {
    title = "LAPORAN AKTIVITAS PENGEMBANGAN PERANGKAT LUNAK",
    institution = "Nama Instansi / Perusahaan",
    department = "Divisi Teknologi Informasi",
    authorName = "........................",
    supervisorName = "........................",
    reportNumber = `LAP/${dayjs().format("YYYYMMDD")}/${String(Math.floor(Math.random() * 999)).padStart(3, "0")}`,
  } = options;

  // Group by date
  const grouped: Record<string, NormalizedCommit[]> = {};
  commits.forEach((c) => {
    const day = dayjs(c.date).format("YYYY-MM-DD");
    if (!grouped[day]) grouped[day] = [];
    grouped[day].push(c);
  });
  const days = Object.entries(grouped).sort((a, b) => a[0].localeCompare(b[0]));

  // Stats
  const totalCommits = commits.length;
  const activeRepos = [...new Set(commits.map((c) => c.repo))];
  const authors = [...new Set(commits.map((c) => c.author))];
  const startDate = options.periodFrom ? dayjs(options.periodFrom) : (commits.length > 0 ? dayjs(commits[commits.length - 1].date) : dayjs());
  const endDate = options.periodTo ? dayjs(options.periodTo) : (commits.length > 0 ? dayjs(commits[0].date) : dayjs());

  const repoStats: Record<string, number> = {};
  commits.forEach((c) => { repoStats[c.repo] = (repoStats[c.repo] || 0) + 1; });

  // Category stats
  const categoryStats: Record<string, number> = {};
  commits.forEach((c) => {
    const cat = categorizeCommit(c.message);
    categoryStats[cat] = (categoryStats[cat] || 0) + 1;
  });

  // Daily activity rows
  let activityRows = "";
  let rowNum = 1;
  days.forEach(([day, items]) => {
    const formattedDay = dayjs(day).format("DD MMMM YYYY");
    items.forEach((c, i) => {
      const cat = categorizeCommit(c.message);
      activityRows += `
        <tr>
          ${i === 0 ? `<td rowspan="${items.length}" class="center">${rowNum}</td><td rowspan="${items.length}">${formattedDay}<br><small style="color:#666">${getDayName(day)}</small></td>` : ""}
          <td>${c.message.split("\n")[0]}</td>
          <td><span class="cat-badge">${cat}</span></td>
          <td>${c.repo}</td>
          <td>${c.author}</td>
        </tr>`;
    });
    rowNum++;
  });

  // Repo summary rows
  const repoRows = Object.entries(repoStats)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count], i) => {
      const pct = Math.round((count / totalCommits) * 100);
      return `<tr><td class="center">${i + 1}</td><td>${name}</td><td class="center">${count}</td><td class="center">${pct}%</td></tr>`;
    })
    .join("");

  // Category rows
  const categoryRows = Object.entries(categoryStats)
    .sort((a, b) => b[1] - a[1])
    .map(([cat, count], i) => {
      const pct = Math.round((count / totalCommits) * 100);
      return `<tr><td class="center">${i + 1}</td><td>${cat}</td><td class="center">${count}</td><td class="center">${pct}%</td>
        <td><div class="bar-bg"><div class="bar-fill" style="width:${pct}%"></div></div></td></tr>`;
    })
    .join("");

  // Smart narrative
  const narrativeHTML = generateNarrativeSummary(commits, [...days], repoStats, categoryStats, startDate, endDate);

  const html = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    @page { size: A4; margin: 2cm 2.5cm; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Times New Roman', 'Serif', serif;
      font-size: 12pt;
      line-height: 1.6;
      color: #000;
      padding: 2cm 2.5cm;
      max-width: 21cm;
      margin: 0 auto;
      background: #fff;
    }

    .kop {
      text-align: center;
      border-bottom: 3px double #000;
      padding-bottom: 12px;
      margin-bottom: 24px;
    }
    .kop h1 { font-size: 16pt; letter-spacing: 1px; margin-bottom: 2px; }
    .kop h2 { font-size: 13pt; font-weight: normal; margin-bottom: 2px; }
    .kop p { font-size: 10pt; color: #444; }

    .report-title {
      text-align: center;
      margin: 24px 0;
    }
    .report-title h3 {
      font-size: 14pt;
      text-decoration: underline;
      letter-spacing: 0.5px;
    }
    .report-title p { font-size: 11pt; margin-top: 4px; }

    .section { margin-bottom: 20px; }
    .section-title {
      font-size: 12pt;
      font-weight: bold;
      margin-bottom: 8px;
    }
    .section p { text-align: justify; text-indent: 2em; margin-bottom: 6px; }

    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 11pt;
      margin: 8px 0 16px 0;
    }
    th, td {
      border: 1px solid #000;
      padding: 6px 8px;
      vertical-align: top;
    }
    th {
      background: #f0f0f0;
      font-weight: bold;
      text-align: center;
    }
    .center { text-align: center; }

    .cat-badge {
      display: inline-block;
      font-size: 9pt;
      padding: 1px 6px;
      border-radius: 3px;
      background: #e8e8e8;
      white-space: nowrap;
    }

    .bar-bg {
      width: 100%;
      height: 14px;
      background: #e0e0e0;
      border-radius: 3px;
      overflow: hidden;
    }
    .bar-fill {
      height: 100%;
      background: #4a90d9;
      border-radius: 3px;
    }

    .highlight-box {
      background: #f8f9fa;
      border-left: 4px solid #4a90d9;
      padding: 12px 16px;
      margin: 12px 0;
      font-size: 11pt;
    }
    .highlight-box p { text-indent: 0; }

    .signature {
      margin-top: 48px;
      display: flex;
      justify-content: space-between;
      page-break-inside: avoid;
    }
    .sig-block {
      text-align: center;
      width: 45%;
    }
    .sig-block .line {
      margin-top: 72px;
      border-bottom: 1px solid #000;
      width: 80%;
      margin-left: auto;
      margin-right: auto;
    }
    .sig-block p { font-size: 11pt; }

    .footer-note {
      margin-top: 32px;
      font-size: 9pt;
      color: #666;
      text-align: center;
      border-top: 1px solid #ccc;
      padding-top: 8px;
    }

    @media print {
      body { padding: 0; }
      .no-print { display: none !important; }
    }

    .print-bar {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: #1a1a1a;
      padding: 8px 24px;
      display: flex;
      gap: 8px;
      z-index: 999;
    }
    .print-bar button {
      background: #3b82f6;
      color: #fff;
      border: none;
      padding: 6px 16px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 11pt;
    }
    .print-bar button:hover { background: #2563eb; }
  </style>
</head>
<body>
  <div class="print-bar no-print">
    <button onclick="window.print()">🖨️ Cetak / Print</button>
    <button onclick="window.close()">✕ Tutup</button>
  </div>

  <!-- KOP SURAT -->
  <div class="kop">
    <h1>${institution.toUpperCase()}</h1>
    <h2>${department}</h2>
    <p>Nomor Laporan: ${reportNumber}</p>
  </div>

  <!-- JUDUL -->
  <div class="report-title">
    <h3>${title}</h3>
    <p>Periode: ${startDate.format("DD MMMM YYYY")} s/d ${endDate.format("DD MMMM YYYY")}</p>
  </div>

  <!-- I. PENDAHULUAN -->
  <div class="section">
    <p class="section-title">I. PENDAHULUAN</p>
    <p>
      Laporan ini disusun sebagai bentuk pertanggungjawaban atas aktivitas pengembangan perangkat lunak
      yang telah dilaksanakan selama periode ${startDate.format("DD MMMM YYYY")} sampai dengan ${endDate.format("DD MMMM YYYY")}.
      Selama periode tersebut, tercatat sebanyak <strong>${totalCommits} commit</strong> pada
      <strong>${activeRepos.length} repository</strong> yang dikerjakan oleh
      <strong>${authors.length} kontributor</strong> dalam <strong>${days.length} hari kerja aktif</strong>.
    </p>
    <p>
      Laporan ini mencakup ringkasan kuantitatif, analisis distribusi aktivitas berdasarkan kategori pekerjaan,
      pola waktu kerja, kontribusi individu, serta tren produktivitas selama periode pelaporan.
      Data bersumber langsung dari sistem version control (Git) sehingga menjamin akurasi dan objektivitas informasi.
    </p>
  </div>

  <!-- II. RINGKASAN PER REPOSITORY -->
  <div class="section">
    <p class="section-title">II. RINGKASAN AKTIVITAS PER REPOSITORY</p>
    <table>
      <thead>
        <tr>
          <th style="width:35px">No</th>
          <th>Nama Repository / Proyek</th>
          <th style="width:80px">Commit</th>
          <th style="width:70px">Proporsi</th>
        </tr>
      </thead>
      <tbody>
        ${repoRows}
        <tr>
          <td colspan="2" style="text-align:right;font-weight:bold;">Total</td>
          <td class="center" style="font-weight:bold;">${totalCommits}</td>
          <td class="center" style="font-weight:bold;">100%</td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- III. DISTRIBUSI KATEGORI PEKERJAAN -->
  <div class="section">
    <p class="section-title">III. DISTRIBUSI KATEGORI PEKERJAAN</p>
    <p>
      Setiap commit diklasifikasikan secara otomatis berdasarkan pesan commit ke dalam kategori berikut
      untuk memberikan gambaran mengenai fokus dan jenis pekerjaan yang dilakukan.
    </p>
    <table>
      <thead>
        <tr>
          <th style="width:35px">No</th>
          <th>Kategori</th>
          <th style="width:70px">Jumlah</th>
          <th style="width:70px">Proporsi</th>
          <th style="width:120px">Visual</th>
        </tr>
      </thead>
      <tbody>
        ${categoryRows}
      </tbody>
    </table>
  </div>

  <!-- IV. ANALISIS NARATIF -->
  <div class="section">
    <p class="section-title">IV. ANALISIS DAN EVALUASI</p>
    <div class="highlight-box">
      <p><strong>📊 Ringkasan Cerdas (Smart Summary)</strong></p>
      <p><em>Analisis berikut dihasilkan berdasarkan data commit secara otomatis.</em></p>
    </div>
    ${narrativeHTML}
  </div>

  <!-- V. RINCIAN AKTIVITAS HARIAN -->
  <div class="section">
    <p class="section-title">V. RINCIAN AKTIVITAS HARIAN</p>
    <table>
      <thead>
        <tr>
          <th style="width:30px">No</th>
          <th style="width:110px">Tanggal</th>
          <th>Deskripsi Pekerjaan</th>
          <th style="width:100px">Kategori</th>
          <th style="width:100px">Repository</th>
          <th style="width:90px">Pelaksana</th>
        </tr>
      </thead>
      <tbody>
        ${activityRows || '<tr><td colspan="6" class="center" style="color:#999;">Tidak ada aktivitas pada periode ini</td></tr>'}
      </tbody>
    </table>
  </div>

  <!-- VI. KESIMPULAN -->
  <div class="section">
    <p class="section-title">VI. KESIMPULAN DAN REKOMENDASI</p>
    <p>
      Berdasarkan data dan analisis di atas, selama periode pelaporan telah dilakukan total <strong>${totalCommits} perubahan kode</strong>
      (commit) pada <strong>${activeRepos.length} repository</strong> proyek. Repository dengan aktivitas tertinggi adalah
      <strong>${Object.entries(repoStats).sort((a, b) => b[1] - a[1])[0]?.[0] || "-"}</strong>
      dengan ${Object.entries(repoStats).sort((a, b) => b[1] - a[1])[0]?.[1] || 0} commit.
    </p>
    <p>
      Secara keseluruhan, pekerjaan pengembangan berjalan sesuai dengan rencana yang telah ditetapkan.
      Tim menunjukkan konsistensi dalam melakukan commit secara berkala, yang mencerminkan
      disiplin dalam proses pengembangan dan penggunaan version control yang baik.
    </p>
    <p>
      <strong>Rekomendasi:</strong> Untuk meningkatkan kualitas pengembangan ke depan, disarankan untuk:
      (1) mempertahankan konsistensi commit harian,
      (2) memperbanyak penulisan unit test untuk menjamin stabilitas aplikasi,
      dan (3) melakukan code review secara rutin untuk menjaga kualitas kode.
    </p>
  </div>

  <!-- VII. PENUTUP -->
  <div class="section">
    <p class="section-title">VII. PENUTUP</p>
    <p>
      Demikian laporan ini dibuat dengan sebenar-benarnya berdasarkan data yang tercatat pada sistem version control.
      Laporan ini dapat dipergunakan sebagai bahan evaluasi kinerja pengembangan perangkat lunak
      serta dokumentasi resmi aktivitas tim selama periode yang bersangkutan.
    </p>
  </div>

  <!-- TANDA TANGAN -->
  <div class="signature">
    <div class="sig-block">
      <p>Dibuat oleh,</p>
      <div class="line"></div>
      <p><strong>${authorName}</strong></p>
      <p><em>Developer</em></p>
    </div>
    <div class="sig-block">
      <p>Mengetahui,</p>
      <div class="line"></div>
      <p><strong>${supervisorName}</strong></p>
      <p><em>Atasan / Supervisor</em></p>
    </div>
  </div>

  <div class="footer-note">
    Dokumen ini di-generate secara otomatis oleh Git Logbook Dashboard pada ${dayjs().format("DD MMMM YYYY, HH:mm")} WIB
  </div>
</body>
</html>`;

  return html;
}

export function printFormalReport(commits: NormalizedCommit[], options?: FormalReportOptions) {
  const html = generateFormalReport(commits, options);
  const w = window.open("", "_blank");
  if (!w) return;
  w.document.write(html);
  w.document.close();
}
