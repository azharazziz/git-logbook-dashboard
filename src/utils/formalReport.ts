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
  const startDate = commits.length > 0 ? dayjs(commits[commits.length - 1].date) : dayjs();
  const endDate = commits.length > 0 ? dayjs(commits[0].date) : dayjs();

  const repoStats: Record<string, number> = {};
  commits.forEach((c) => { repoStats[c.repo] = (repoStats[c.repo] || 0) + 1; });

  // Daily activity rows for table
  let activityRows = "";
  let rowNum = 1;
  days.forEach(([day, items]) => {
    const formattedDay = dayjs(day).format("DD MMMM YYYY");
    items.forEach((c, i) => {
      activityRows += `
        <tr>
          ${i === 0 ? `<td rowspan="${items.length}" class="center">${rowNum}</td><td rowspan="${items.length}">${formattedDay}</td>` : ""}
          <td>${c.message.split("\n")[0]}</td>
          <td>${c.repo}</td>
          <td>${c.author}</td>
        </tr>`;
    });
    rowNum++;
  });

  // Repo summary rows
  const repoRows = Object.entries(repoStats)
    .map(([name, count], i) => `<tr><td class="center">${i + 1}</td><td>${name}</td><td class="center">${count}</td></tr>`)
    .join("");

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

    /* Header / Kop */
    .kop {
      text-align: center;
      border-bottom: 3px double #000;
      padding-bottom: 12px;
      margin-bottom: 24px;
    }
    .kop h1 { font-size: 16pt; letter-spacing: 1px; margin-bottom: 2px; }
    .kop h2 { font-size: 13pt; font-weight: normal; margin-bottom: 2px; }
    .kop p { font-size: 10pt; color: #444; }

    /* Title */
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

    /* Sections */
    .section { margin-bottom: 20px; }
    .section-title {
      font-size: 12pt;
      font-weight: bold;
      margin-bottom: 8px;
    }
    .section p { text-align: justify; text-indent: 2em; }

    /* Tables */
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

    /* Signature */
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

    /* Footer */
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

    /* Print button */
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

  <!-- JUDUL LAPORAN -->
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
  </div>

  <!-- II. RINGKASAN AKTIVITAS -->
  <div class="section">
    <p class="section-title">II. RINGKASAN AKTIVITAS PER REPOSITORY</p>
    <table>
      <thead>
        <tr>
          <th style="width:40px">No</th>
          <th>Nama Repository / Proyek</th>
          <th style="width:80px">Jumlah Commit</th>
        </tr>
      </thead>
      <tbody>
        ${repoRows}
        <tr>
          <td colspan="2" style="text-align:right;font-weight:bold;">Total</td>
          <td class="center" style="font-weight:bold;">${totalCommits}</td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- III. RINCIAN AKTIVITAS HARIAN -->
  <div class="section">
    <p class="section-title">III. RINCIAN AKTIVITAS HARIAN</p>
    <table>
      <thead>
        <tr>
          <th style="width:35px">No</th>
          <th style="width:130px">Tanggal</th>
          <th>Deskripsi Pekerjaan</th>
          <th style="width:120px">Repository</th>
          <th style="width:100px">Pelaksana</th>
        </tr>
      </thead>
      <tbody>
        ${activityRows || '<tr><td colspan="5" class="center" style="color:#999;">Tidak ada aktivitas pada periode ini</td></tr>'}
      </tbody>
    </table>
  </div>

  <!-- IV. KESIMPULAN -->
  <div class="section">
    <p class="section-title">IV. KESIMPULAN</p>
    <p>
      Berdasarkan data di atas, selama periode pelaporan telah dilakukan total ${totalCommits} perubahan kode
      (commit) pada ${activeRepos.length} repository proyek. Repository dengan aktivitas tertinggi adalah
      <strong>${Object.entries(repoStats).sort((a, b) => b[1] - a[1])[0]?.[0] || "-"}</strong>
      dengan ${Object.entries(repoStats).sort((a, b) => b[1] - a[1])[0]?.[1] || 0} commit.
      Secara keseluruhan, pekerjaan pengembangan berjalan sesuai dengan rencana yang telah ditetapkan.
    </p>
  </div>

  <!-- V. PENUTUP -->
  <div class="section">
    <p class="section-title">V. PENUTUP</p>
    <p>
      Demikian laporan ini dibuat dengan sebenar-benarnya untuk dapat dipergunakan sebagaimana mestinya.
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
