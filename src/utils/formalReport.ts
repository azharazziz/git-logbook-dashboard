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

/* ── Randomized Sentence Builder ────────────────────────────────── */

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
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

function productivityLabel(avg: number): string {
  if (avg >= 8) return pick(["sangat tinggi dan mengesankan", "luar biasa produktif", "sangat intens dan mengagumkan"]);
  if (avg >= 5) return pick(["cukup tinggi dan konsisten", "produktif serta terjaga", "baik dan menunjukkan etos kerja yang kuat"]);
  if (avg >= 3) return pick(["baik dan teratur", "memadai dengan ritme yang stabil", "cukup konsisten dan terstruktur"]);
  return pick(["stabil meskipun tergolong moderat", "terukur dan sesuai kapasitas", "terjaga dalam batas wajar"]);
}

function focusDescription(cat: string): string {
  const map: Record<string, string[]> = {
    "Fitur Baru": [
      "penambahan fungsionalitas baru yang bertujuan memperkaya kapabilitas sistem",
      "pengembangan fitur-fitur baru guna memenuhi kebutuhan pengguna yang terus berkembang",
      "implementasi modul dan komponen baru yang memperluas cakupan layanan aplikasi",
    ],
    "Perbaikan Bug": [
      "stabilisasi sistem melalui identifikasi dan perbaikan bug yang ditemukan",
      "upaya peningkatan reliabilitas dengan mengatasi berbagai isu teknis yang terdeteksi",
      "penanganan defect dan error untuk menjamin kualitas serta keandalan perangkat lunak",
    ],
    "Refactoring": [
      "peningkatan struktur dan kualitas kode internal tanpa mengubah fungsionalitas yang ada",
      "restrukturisasi arsitektur kode untuk meningkatkan maintainability jangka panjang",
      "penyempurnaan kode sumber agar lebih bersih, efisien, dan mudah dikembangkan ke depan",
    ],
    "Perbaikan UI/UX": [
      "penyempurnaan antarmuka pengguna dan pengalaman interaksi yang lebih intuitif",
      "peningkatan aspek visual dan usability agar aplikasi lebih nyaman digunakan",
      "perbaikan desain tampilan guna memberikan pengalaman pengguna yang lebih baik",
    ],
    "Dokumentasi": [
      "penyusunan dan pemutakhiran dokumentasi proyek untuk keperluan transfer knowledge",
      "penulisan dokumentasi teknis yang komprehensif sebagai referensi tim",
    ],
    "Testing": [
      "penguatan cakupan pengujian untuk menjamin stabilitas setiap rilis",
      "pengembangan test suite yang lebih lengkap guna mendeteksi regresi secara dini",
    ],
    "Maintenance": [
      "pemeliharaan rutin infrastruktur dan dependensi proyek",
      "pengelolaan konfigurasi, deployment, dan pembaruan dependensi sistem",
    ],
    "Optimisasi": [
      "peningkatan performa dan efisiensi sistem secara keseluruhan",
      "optimalisasi kecepatan dan penggunaan sumber daya aplikasi",
    ],
    "Pengembangan Umum": [
      "pengembangan dan pemeliharaan sistem secara menyeluruh",
      "berbagai aktivitas pengembangan yang mencakup beragam aspek teknis",
    ],
  };
  return pick(map[cat] || map["Pengembangan Umum"]);
}

/* ── Extended Narrative Generator ───────────────────────────────── */

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
  const avgPerDay = activeDays > 0 ? commits.length / activeDays : 0;
  const avgStr = avgPerDay.toFixed(1);

  // Weekly breakdown
  const weeklyGroups: Record<string, number> = {};
  commits.forEach((c) => {
    const weekStart = dayjs(c.date).startOf("week").format("DD MMM YYYY");
    weeklyGroups[weekStart] = (weeklyGroups[weekStart] || 0) + 1;
  });

  // Day of week distribution
  const dayOfWeekCount: Record<number, number> = {};
  commits.forEach((c) => {
    const dow = dayjs(c.date).day();
    dayOfWeekCount[dow] = (dayOfWeekCount[dow] || 0) + 1;
  });
  const dayNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const sortedDows = Object.entries(dayOfWeekCount).sort((a, b) => Number(b[1]) - Number(a[1]));
  const busiestDay = sortedDows[0] ? dayNames[Number(sortedDows[0][0])] : "-";
  const quietestDay = sortedDows.length > 1 ? dayNames[Number(sortedDows[sortedDows.length - 1][0])] : "-";

  // Hour distribution
  const hourBuckets: Record<string, number> = { "Pagi (06:00–12:00)": 0, "Siang (12:00–17:00)": 0, "Malam (17:00–22:00)": 0, "Dini Hari (22:00–06:00)": 0 };
  commits.forEach((c) => {
    const h = dayjs(c.date).hour();
    if (h >= 6 && h < 12) hourBuckets["Pagi (06:00–12:00)"]++;
    else if (h >= 12 && h < 17) hourBuckets["Siang (12:00–17:00)"]++;
    else if (h >= 17 && h < 22) hourBuckets["Malam (17:00–22:00)"]++;
    else hourBuckets["Dini Hari (22:00–06:00)"]++;
  });
  const sortedHours = Object.entries(hourBuckets).sort((a, b) => b[1] - a[1]);
  const peakHour = sortedHours[0];

  // Categories
  const sortedCategories = Object.entries(categoryStats).sort((a, b) => b[1] - a[1]);
  const topCategory = sortedCategories[0];

  // Authors
  const authorStats: Record<string, number> = {};
  commits.forEach((c) => { authorStats[c.author] = (authorStats[c.author] || 0) + 1; });
  const sortedAuthors = Object.entries(authorStats).sort((a, b) => b[1] - a[1]);

  // Busiest single day
  const sortedDays = [...days].sort((a, b) => b[1].length - a[1].length);
  const busiestSingleDay = sortedDays[0];

  // Commit message length analysis
  const avgMsgLen = Math.round(commits.reduce((s, c) => s + c.message.length, 0) / commits.length);

  // Streak analysis
  let maxStreak = 1, curStreak = 1;
  const sortedDayKeys = days.map(d => d[0]).sort();
  for (let i = 1; i < sortedDayKeys.length; i++) {
    if (dayjs(sortedDayKeys[i]).diff(dayjs(sortedDayKeys[i - 1]), "day") === 1) {
      curStreak++;
      if (curStreak > maxStreak) maxStreak = curStreak;
    } else {
      curStreak = 1;
    }
  }

  // Build narrative
  let n = "";

  // ── Paragraph 1: Executive Overview
  n += `<p>${pick([
    `Selama periode pelaporan yang berlangsung dari ${startDate.format("DD MMMM YYYY")} hingga ${endDate.format("DD MMMM YYYY")},`,
    `Dalam kurun waktu ${startDate.format("DD MMMM YYYY")} sampai dengan ${endDate.format("DD MMMM YYYY")},`,
    `Pada rentang periode ${startDate.format("DD MMMM YYYY")} s/d ${endDate.format("DD MMMM YYYY")},`,
  ])} ${pick([
    `tim pengembangan telah menunjukkan komitmen kerja yang solid dengan mencatatkan`,
    `aktivitas pengembangan perangkat lunak telah berjalan secara intensif dengan total`,
    `kegiatan pengembangan telah berlangsung dengan mencatat akumulasi sebanyak`,
  ])} <strong>${commits.length} commit</strong> ${pick([
    `yang tersebar di <strong>${activeDays} hari kerja aktif</strong> dari total ${totalDays} hari kalender.`,
    `dalam <strong>${activeDays} hari aktif</strong> dari keseluruhan ${totalDays} hari pada periode tersebut.`,
    `selama <strong>${activeDays} hari produktif</strong> dari ${totalDays} hari kalender yang tersedia.`,
  ])} ${pick([
    `Tingkat pemanfaatan waktu kerja mencapai <strong>${activePercent}%</strong>, yang menggambarkan`,
    `Rasio aktivitas terhadap total hari kalender berada pada angka <strong>${activePercent}%</strong>, mengindikasikan`,
    `Persentase hari aktif dibandingkan total periode adalah <strong>${activePercent}%</strong>, menunjukkan`,
  ])} ${pick([
    `dedikasi yang tinggi terhadap proses pengembangan.`,
    `komitmen yang kuat dalam menjalankan tugas-tugas pengembangan.`,
    `intensitas kerja yang memadai dalam siklus pengembangan ini.`,
  ])}</p>`;

  // ── Paragraph 2: Productivity Depth
  n += `<p>${pick([
    `Apabila dihitung secara rata-rata, produktivitas harian mencapai <strong>${avgStr} commit per hari aktif</strong>,`,
    `Dari segi produktivitas per hari, rata-rata commit yang dihasilkan adalah <strong>${avgStr} per hari kerja</strong>,`,
    `Secara kuantitatif, setiap hari aktif menghasilkan rata-rata <strong>${avgStr} commit</strong>,`,
  ])} ${pick([
    `sebuah angka yang dapat dikategorikan sebagai ${productivityLabel(avgPerDay)}.`,
    `suatu capaian yang tergolong ${productivityLabel(avgPerDay)}.`,
    `yang mencerminkan tingkat produktivitas ${productivityLabel(avgPerDay)}.`,
  ])} ${pick([
    `Angka ini menjadi indikator penting dalam mengukur efektivitas tim dalam memanfaatkan waktu pengembangan yang tersedia.`,
    `Metrik ini menggambarkan seberapa efisien sumber daya waktu dimanfaatkan untuk menghasilkan perubahan kode yang bermakna.`,
    `Data ini memberikan gambaran objektif mengenai ritme dan konsistensi kerja tim selama periode pelaporan berlangsung.`,
  ])} ${maxStreak > 1 ? pick([
    `Perlu dicatat pula bahwa terdapat streak produktivitas berturut-turut selama <strong>${maxStreak} hari</strong>, yang menandakan adanya momentum kerja yang baik.`,
    `Tercatat juga adanya rangkaian hari kerja berturut-turut selama <strong>${maxStreak} hari</strong> tanpa jeda, yang menunjukkan fokus dan kontinuitas pengembangan yang terjaga.`,
    `Selain itu, ditemukan periode kerja beruntun terpanjang selama <strong>${maxStreak} hari berturut-turut</strong>, sebuah indikasi positif dari disiplin kerja yang diterapkan.`,
  ]) : ""}</p>`;

  // ── Paragraph 3: Category Deep Analysis
  if (topCategory) {
    const topPct = Math.round((topCategory[1] / commits.length) * 100);
    n += `<p>${pick([
      `Hasil klasifikasi otomatis terhadap seluruh pesan commit menunjukkan bahwa`,
      `Berdasarkan analisis kategorisasi yang dilakukan terhadap setiap commit,`,
      `Dari hasil pengelompokan commit berdasarkan jenis pekerjaannya, teridentifikasi bahwa`,
    ])} ${pick([
      `aktivitas pengembangan didominasi oleh kategori <strong>"${topCategory[0]}"</strong> dengan <strong>${topCategory[1]} commit (${topPct}%)</strong> dari total keseluruhan.`,
      `kategori <strong>"${topCategory[0]}"</strong> menduduki posisi tertinggi dengan <strong>${topCategory[1]} kontribusi (${topPct}%)</strong>.`,
      `porsi terbesar ditempati oleh <strong>"${topCategory[0]}"</strong> sebanyak <strong>${topCategory[1]} commit</strong>, setara dengan <strong>${topPct}%</strong> dari seluruh aktivitas.`,
    ])} ${pick([
      `Dominasi kategori ini mengindikasikan bahwa fase pengembangan saat ini difokuskan pada ${focusDescription(topCategory[0])}.`,
      `Hal ini menggambarkan bahwa prioritas utama pengembangan pada periode ini adalah ${focusDescription(topCategory[0])}.`,
      `Komposisi ini mencerminkan bahwa alokasi upaya terbesar diarahkan untuk ${focusDescription(topCategory[0])}.`,
    ])}</p>`;

    if (sortedCategories.length > 1) {
      const otherCats = sortedCategories.slice(1, 4);
      n += `<p>${pick([
        `Di luar kategori utama tersebut, terdapat beberapa jenis pekerjaan lain yang turut memberikan kontribusi signifikan.`,
        `Selain kategori dominan di atas, aktivitas pengembangan juga mencakup beberapa area pekerjaan lainnya.`,
        `Tidak hanya terbatas pada kategori utama, tim juga mengalokasikan waktu untuk berbagai jenis pekerjaan pendukung.`,
      ])} ${otherCats.map((c, i) => {
        const pct = Math.round((c[1] / commits.length) * 100);
        const prefix = i === 0 ? pick(["Kategori", "Jenis pekerjaan", "Area"]) : (i === otherCats.length - 1 ? pick(["dan terakhir", "serta"]) : pick(["kemudian", "selanjutnya"]));
        return `${prefix} <strong>"${c[0]}"</strong> tercatat sebanyak ${c[1]} commit (${pct}%)`;
      }).join(", ")}. ${pick([
        `Distribusi multi-kategori ini menunjukkan bahwa tim tidak hanya fokus pada satu aspek saja, melainkan menjalankan pendekatan pengembangan yang holistik dan menyeluruh.`,
        `Keberagaman kategori pekerjaan ini mengindikasikan tim menerapkan strategi pengembangan yang seimbang antara penambahan fitur, pemeliharaan, dan peningkatan kualitas.`,
        `Variasi ini merupakan tanda bahwa proses pengembangan dilakukan secara komprehensif, mencakup berbagai aspek yang diperlukan untuk menghasilkan produk berkualitas.`,
      ])}</p>`;
    }
  }

  // ── Paragraph 4: Time Pattern Analysis
  n += `<p>${pick([
    `Analisis terhadap pola waktu kerja mengungkapkan informasi menarik mengenai kebiasaan kerja tim pengembangan.`,
    `Dari perspektif waktu pelaksanaan, terdapat pola-pola yang dapat diidentifikasi dari data commit yang tercatat.`,
    `Tinjauan terhadap distribusi waktu commit memberikan insight berharga tentang ritme dan kebiasaan kerja tim.`,
  ])} ${pick([
    `Mayoritas aktivitas commit dilakukan pada rentang waktu <strong>${peakHour?.[0] || "-"}</strong> dengan total <strong>${peakHour?.[1] || 0} commit</strong>,`,
    `Waktu yang paling produktif adalah <strong>${peakHour?.[0] || "-"}</strong> yang mencatat <strong>${peakHour?.[1] || 0} commit</strong>,`,
    `Konsentrasi tertinggi aktivitas pengembangan terjadi pada <strong>${peakHour?.[0] || "-"}</strong> dengan akumulasi <strong>${peakHour?.[1] || 0} commit</strong>,`,
  ])} ${pick([
    `yang menunjukkan bahwa tim cenderung bekerja paling efektif pada rentang waktu tersebut.`,
    `mengisyaratkan bahwa jam-jam tersebut merupakan golden hours bagi produktivitas tim.`,
    `sebuah fakta yang dapat dimanfaatkan untuk mengoptimalkan jadwal kerja dan meeting di masa mendatang.`,
  ])}</p>`;

  n += `<p>${pick([
    `Ditinjau dari distribusi per hari dalam seminggu, hari <strong>${busiestDay}</strong> tercatat sebagai hari dengan volume commit tertinggi.`,
    `Dalam perspektif mingguan, <strong>${busiestDay}</strong> menjadi hari paling produktif berdasarkan jumlah commit yang dihasilkan.`,
    `Data menunjukkan bahwa <strong>${busiestDay}</strong> merupakan hari di mana tim paling aktif melakukan perubahan kode.`,
  ])} ${quietestDay !== busiestDay ? pick([
    `Sementara itu, <strong>${quietestDay}</strong> mencatat aktivitas terendah, yang mungkin disebabkan oleh jadwal meeting, review, atau kegiatan non-coding lainnya.`,
    `Di sisi lain, <strong>${quietestDay}</strong> menunjukkan volume commit yang relatif lebih rendah, kemungkinan karena waktu tersebut digunakan untuk aktivitas pendukung seperti diskusi atau perencanaan.`,
  ]) : ""} ${busiestSingleDay ? pick([
    `Puncak aktivitas tertinggi dalam satu hari kalender terjadi pada <strong>${dayjs(busiestSingleDay[0]).format("DD MMMM YYYY")} (${getDayName(busiestSingleDay[0])})</strong> dengan pencapaian <strong>${busiestSingleDay[1].length} commit</strong> dalam satu hari, sebuah capaian yang menunjukkan intensitas kerja luar biasa pada hari tersebut.`,
    `Rekor produktivitas harian dipegang oleh tanggal <strong>${dayjs(busiestSingleDay[0]).format("DD MMMM YYYY")} (${getDayName(busiestSingleDay[0])})</strong> dimana <strong>${busiestSingleDay[1].length} commit</strong> berhasil diselesaikan, mengindikasikan adanya sprint atau deadline yang mendorong produktivitas tinggi.`,
  ]) : ""}</p>`;

  // ── Paragraph 5: Hour Distribution Table-like narrative
  n += `<p>${pick([
    `Untuk memberikan gambaran yang lebih rinci, berikut distribusi waktu kerja secara mendetail:`,
    `Secara lebih spesifik, persebaran aktivitas berdasarkan slot waktu dapat diuraikan sebagai berikut:`,
    `Bila dirinci lebih lanjut berdasarkan pembagian waktu dalam sehari, data menunjukkan:`,
  ])} ${sortedHours.map(([slot, count]) => {
    const pct = Math.round((count / commits.length) * 100);
    return `${slot}: ${count} commit (${pct}%)`;
  }).join("; ")}. ${pick([
    `Pola ini dapat menjadi acuan dalam menyusun jadwal kerja dan menentukan waktu yang tepat untuk kegiatan kolaboratif seperti standup meeting atau code review.`,
    `Informasi ini berguna sebagai dasar untuk mengoptimalkan alokasi waktu antara pengembangan mandiri dan kegiatan kolaboratif dalam tim.`,
    `Data distribusi waktu ini dapat dipertimbangkan dalam perencanaan sprint dan pengaturan jadwal kerja yang lebih efektif.`,
  ])}</p>`;

  // ── Paragraph 6: Author contributions
  if (sortedAuthors.length > 0) {
    n += `<p>${pick([
      `Dari dimensi kontribusi individu, analisis menunjukkan pola partisipasi sebagai berikut.`,
      `Aspek kontribusi per anggota tim juga menjadi hal penting untuk dievaluasi.`,
      `Tinjauan terhadap kontribusi masing-masing pengembang menghasilkan temuan yang signifikan.`,
    ])} `;
    if (sortedAuthors.length === 1) {
      n += pick([
        `Seluruh commit pada periode ini dikerjakan oleh <strong>${sortedAuthors[0][0]}</strong> dengan total <strong>${sortedAuthors[0][1]} commit</strong>. Hal ini menunjukkan bahwa proyek bersifat individual atau hanya memiliki satu kontributor utama pada periode pelaporan ini.`,
        `<strong>${sortedAuthors[0][0]}</strong> bertanggung jawab atas keseluruhan <strong>${sortedAuthors[0][1]} commit</strong> yang tercatat. Fakta ini mengindikasikan bahwa pengembangan dilakukan secara mandiri oleh satu orang pengembang selama periode berjalan.`,
      ]);
    } else {
      const topAuthorPct = Math.round((sortedAuthors[0][1] / commits.length) * 100);
      n += pick([
        `Kontributor paling aktif adalah <strong>${sortedAuthors[0][0]}</strong> dengan <strong>${sortedAuthors[0][1]} commit (${topAuthorPct}%)</strong> dari total, menunjukkan peran sentral dalam pengembangan.`,
        `<strong>${sortedAuthors[0][0]}</strong> memimpin sebagai kontributor tertinggi dengan <strong>${sortedAuthors[0][1]} commit (${topAuthorPct}%)</strong>, memperlihatkan dedikasi dan tanggung jawab yang besar.`,
      ]);
      const others = sortedAuthors.slice(1);
      n += ` ${pick([
        `Kontributor lainnya yang turut berpartisipasi aktif meliputi:`,
        `Selain itu, anggota tim yang juga memberikan kontribusi adalah:`,
      ])} ${others.map(([name, count]) => `<strong>${name}</strong> (${count} commit, ${Math.round((count / commits.length) * 100)}%)`).join(", ")}. `;
      n += pick([
        `Distribusi kontribusi ini menunjukkan adanya kolaborasi yang sehat di antara anggota tim, meskipun terdapat perbedaan volume yang wajar sesuai dengan peran dan tanggung jawab masing-masing.`,
        `Pola kontribusi ini mencerminkan dinamika tim yang positif, dimana setiap anggota berkontribusi sesuai dengan kapasitas dan area keahliannya.`,
      ]);
    }
    n += `</p>`;
  }

  // ── Paragraph 7: Repository analysis
  const sortedRepos = Object.entries(repoStats).sort((a, b) => b[1] - a[1]);
  if (sortedRepos.length >= 1) {
    n += `<p>${pick([
      `Analisis distribusi commit antar repository memberikan gambaran mengenai prioritas dan alokasi sumber daya pengembangan.`,
      `Tinjauan terhadap persebaran aktivitas di berbagai repository menunjukkan bagaimana upaya pengembangan dialokasikan.`,
      `Evaluasi terhadap distribusi commit pada setiap repository mengungkap pola prioritas pengembangan yang diterapkan.`,
    ])} `;
    if (sortedRepos.length === 1) {
      n += pick([
        `Seluruh aktivitas terkonsentrasi pada repository <strong>${sortedRepos[0][0]}</strong> yang menerima <strong>${sortedRepos[0][1]} commit</strong>. Fokus pada satu repository ini menunjukkan adanya prioritas pengembangan yang terpusat dan terarah.`,
        `Repository <strong>${sortedRepos[0][0]}</strong> menjadi satu-satunya target pengembangan dengan <strong>${sortedRepos[0][1]} commit</strong>, mengindikasikan konsentrasi penuh pada satu proyek selama periode ini.`,
      ]);
    } else {
      n += pick([
        `Repository <strong>${sortedRepos[0][0]}</strong> menjadi fokus utama dengan <strong>${sortedRepos[0][1]} commit (${Math.round((sortedRepos[0][1] / commits.length) * 100)}%)</strong>.`,
        `Prioritas tertinggi diberikan kepada <strong>${sortedRepos[0][0]}</strong> yang mencatat <strong>${sortedRepos[0][1]} commit (${Math.round((sortedRepos[0][1] / commits.length) * 100)}%)</strong> dari seluruh aktivitas.`,
      ]);
      const otherRepos = sortedRepos.slice(1).map(([name, count]) => `<strong>${name}</strong> (${count} commit, ${Math.round((count / commits.length) * 100)}%)`);
      n += ` Repository lainnya: ${otherRepos.join(", ")}. `;
      n += pick([
        `Distribusi multi-repository ini menggambarkan bahwa tim mampu mengelola beberapa proyek secara paralel dengan alokasi yang proporsional.`,
        `Kemampuan untuk menangani beberapa repository sekaligus mencerminkan kapasitas dan organisasi tim yang baik.`,
      ]);
    }
    n += `</p>`;
  }

  // ── Paragraph 8: Weekly trend with deeper analysis
  const weekEntries = Object.entries(weeklyGroups).sort((a, b) => a[0].localeCompare(b[0]));
  if (weekEntries.length > 1) {
    const weekValues = weekEntries.map(w => w[1]);
    const maxWeek = Math.max(...weekValues);
    const minWeek = Math.min(...weekValues);
    const avgWeek = (weekValues.reduce((a, b) => a + b, 0) / weekValues.length).toFixed(1);
    const firstWeek = weekValues[0];
    const lastWeek = weekValues[weekValues.length - 1];
    const trend = lastWeek > firstWeek * 1.2 ? "meningkat" : lastWeek < firstWeek * 0.8 ? "menurun" : "relatif stabil";

    n += `<p>${pick([
      `Analisis tren produktivitas mingguan memberikan perspektif temporal yang penting untuk memahami dinamika pengembangan.`,
      `Evaluasi pola mingguan menjadi aspek krusial dalam memahami ritme dan momentum kerja tim sepanjang periode pelaporan.`,
      `Tren produktivitas dari minggu ke minggu menggambarkan fluktuasi dan pola kerja yang terjadi selama periode berjalan.`,
    ])} ${pick([
      `Secara keseluruhan, tren menunjukkan pola yang <strong>${trend}</strong>.`,
      `Pola umum yang teramati adalah tren yang <strong>${trend}</strong> sepanjang periode.`,
    ])} ${pick([
      `Detail per minggu: ${weekEntries.map(([w, c]) => `minggu ${w}: ${c} commit`).join(", ")}.`,
      `Rincian volume per minggu adalah sebagai berikut: ${weekEntries.map(([w, c]) => `${w} (${c} commit)`).join(" → ")}.`,
    ])} ${pick([
      `Rata-rata produktivitas mingguan berada pada <strong>${avgWeek} commit/minggu</strong>, dengan fluktuasi antara <strong>${minWeek}</strong> hingga <strong>${maxWeek} commit</strong> dalam satu minggu.`,
      `Secara rata-rata, setiap minggu menghasilkan <strong>${avgWeek} commit</strong>, dengan volume terendah <strong>${minWeek}</strong> dan tertinggi <strong>${maxWeek} commit</strong>.`,
    ])}</p>`;

    n += `<p>${trend === "meningkat" ? pick([
      `Tren peningkatan ini merupakan sinyal positif yang menunjukkan akselerasi dalam proses pengembangan. Hal ini bisa disebabkan oleh semakin matangnya pemahaman tim terhadap arsitektur proyek, penyelesaian fase persiapan awal, atau masuknya anggota tim baru yang menambah kapasitas.`,
      `Peningkatan volume commit dari awal hingga akhir periode menandakan adanya momentum yang terbangun dengan baik. Tim berhasil menemukan ritme kerja yang optimal dan mampu meningkatkan output seiring berjalannya waktu.`,
    ]) : trend === "menurun" ? pick([
      `Tren penurunan volume commit tidak selalu berarti penurunan produktivitas. Hal ini bisa jadi mencerminkan transisi dari fase pengembangan intensif ke fase stabilisasi, di mana perubahan yang dilakukan lebih sedikit namun lebih kritis dan memerlukan pertimbangan yang lebih matang.`,
      `Penurunan jumlah commit di akhir periode mungkin disebabkan oleh beberapa faktor, seperti kompleksitas task yang meningkat, fase pengujian yang membutuhkan lebih sedikit perubahan kode, atau adanya aktivitas non-coding seperti dokumentasi dan deployment.`,
    ]) : pick([
      `Stabilitas volume commit dari minggu ke minggu menunjukkan alur kerja yang konsisten dan terorganisir. Tim berhasil mempertahankan ritme kerja yang sehat tanpa fluktuasi ekstrem yang dapat mengindikasikan masalah dalam perencanaan atau beban kerja.`,
      `Konsistensi ini merupakan indikator positif dari proses pengembangan yang terkelola dengan baik, di mana beban kerja didistribusikan secara merata dan tim mampu mempertahankan output yang stabil sepanjang periode.`,
    ])}</p>`;
  }

  // ── Paragraph 9: Commit Quality
  n += `<p>${pick([
    `Dari aspek kualitas pesan commit, rata-rata panjang pesan commit adalah <strong>${avgMsgLen} karakter</strong>.`,
    `Tinjauan terhadap kualitas dokumentasi commit menunjukkan rata-rata panjang pesan sebesar <strong>${avgMsgLen} karakter</strong>.`,
  ])} ${avgMsgLen > 50 ? pick([
    `Panjang pesan yang memadai ini mengindikasikan bahwa tim memiliki kebiasaan mendokumentasikan perubahan dengan cukup deskriptif, sehingga memudahkan proses audit trail dan pemahaman konteks di kemudian hari.`,
    `Hal ini menunjukkan bahwa pengembang memberikan deskripsi yang cukup detail pada setiap perubahan, sebuah praktik baik yang mendukung transparansi dan traceability dalam pengembangan perangkat lunak.`,
  ]) : pick([
    `Pesan commit yang relatif singkat menunjukkan area yang dapat ditingkatkan. Disarankan untuk menuliskan deskripsi yang lebih lengkap agar setiap perubahan mudah dipahami saat dilakukan review atau audit di masa mendatang.`,
    `Panjang pesan yang singkat menjadi catatan untuk perbaikan ke depan. Commit message yang lebih deskriptif akan sangat membantu dalam memahami konteks dan alasan di balik setiap perubahan kode.`,
  ])}</p>`;

  // ── Paragraph 10: Notable commits highlight
  const notableCommits = shuffle(commits).slice(0, Math.min(5, commits.length));
  if (notableCommits.length > 0) {
    n += `<p>${pick([
      `Beberapa contoh aktivitas yang representatif selama periode ini antara lain:`,
      `Di antara berbagai commit yang tercatat, berikut adalah beberapa yang dapat mewakili gambaran pekerjaan yang dilakukan:`,
      `Sebagai ilustrasi konkret dari aktivitas pengembangan, berikut beberapa commit yang dapat dijadikan referensi:`,
    ])} ${notableCommits.map(c => `"<em>${c.message.split("\n")[0]}</em>" pada repository ${c.repo} (${dayjs(c.date).format("DD MMM YYYY")})`).join("; ")}. ${pick([
      `Contoh-contoh ini menggambarkan keberagaman pekerjaan yang dilakukan selama periode pelaporan.`,
      `Sampel aktivitas di atas memberikan gambaran nyata mengenai ruang lingkup pekerjaan yang dikerjakan oleh tim.`,
    ])}</p>`;
  }

  return n;
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

  // Hour distribution for chart
  const hourLabels = ["Pagi", "Siang", "Malam", "Dini Hari"];
  const hourCounts = [0, 0, 0, 0];
  commits.forEach((c) => {
    const h = dayjs(c.date).hour();
    if (h >= 6 && h < 12) hourCounts[0]++;
    else if (h >= 12 && h < 17) hourCounts[1]++;
    else if (h >= 17 && h < 22) hourCounts[2]++;
    else hourCounts[3]++;
  });

  // Day of week for chart
  const dowNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
  const dowCounts = [0, 0, 0, 0, 0, 0, 0];
  commits.forEach((c) => { dowCounts[dayjs(c.date).day()]++; });

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

  // Category rows with print-safe bars
  const categoryEntries = Object.entries(categoryStats).sort((a, b) => b[1] - a[1]);
  const categoryRows = categoryEntries
    .map(([cat, count], i) => {
      const pct = Math.round((count / totalCommits) * 100);
      return `<tr><td class="center">${i + 1}</td><td>${cat}</td><td class="center">${count}</td><td class="center">${pct}%</td>
        <td><div class="bar-bg"><div class="bar-fill" style="width:${pct}%"></div></div></td></tr>`;
    })
    .join("");

  // Smart narrative
  const narrativeHTML = generateNarrativeSummary(commits, [...days], repoStats, categoryStats, startDate, endDate);

  // Category chart (pure CSS horizontal bars for print)
  const maxCatCount = categoryEntries.length > 0 ? categoryEntries[0][1] : 1;
  const categoryChartHTML = categoryEntries.map(([cat, count]) => {
    const widthPct = Math.round((count / maxCatCount) * 100);
    const colors: Record<string, string> = {
      "Fitur Baru": "#2563eb", "Perbaikan Bug": "#dc2626", "Refactoring": "#7c3aed",
      "Perbaikan UI/UX": "#0891b2", "Dokumentasi": "#059669", "Testing": "#d97706",
      "Maintenance": "#6b7280", "Optimisasi": "#ec4899", "Pengembangan Umum": "#8b5cf6",
    };
    const color = colors[cat] || "#6b7280";
    return `<div class="chart-row">
      <div class="chart-label">${cat}</div>
      <div class="chart-bar-track"><div class="chart-bar-value" style="width:${widthPct}%;background:${color}"></div></div>
      <div class="chart-count">${count}</div>
    </div>`;
  }).join("");

  // Repo pie chart as CSS circles
  const repoChartHTML = Object.entries(repoStats).sort((a, b) => b[1] - a[1]).map(([name, count], i) => {
    const pct = Math.round((count / totalCommits) * 100);
    const colors = ["#2563eb", "#7c3aed", "#059669", "#d97706", "#dc2626", "#0891b2"];
    const color = colors[i % colors.length];
    return `<div class="repo-chart-item">
      <div class="repo-dot" style="background:${color}"></div>
      <div class="repo-info"><strong>${name}</strong><br><span>${count} commit (${pct}%)</span></div>
    </div>`;
  }).join("");

  // Hour distribution chart
  const maxHour = Math.max(...hourCounts, 1);
  const hourChartHTML = hourLabels.map((label, i) => {
    const widthPct = Math.round((hourCounts[i] / maxHour) * 100);
    const colors = ["#f59e0b", "#ef4444", "#6366f1", "#1e3a5f"];
    return `<div class="chart-row">
      <div class="chart-label">${label}</div>
      <div class="chart-bar-track"><div class="chart-bar-value" style="width:${widthPct}%;background:${colors[i]}"></div></div>
      <div class="chart-count">${hourCounts[i]}</div>
    </div>`;
  }).join("");

  // Day of week chart
  const maxDow = Math.max(...dowCounts, 1);
  const dowChartHTML = dowNames.map((name, i) => {
    const heightPct = Math.round((dowCounts[i] / maxDow) * 100);
    return `<div class="dow-col">
      <div class="dow-value">${dowCounts[i]}</div>
      <div class="dow-bar-track"><div class="dow-bar-fill" style="height:${heightPct}%"></div></div>
      <div class="dow-label">${name}</div>
    </div>`;
  }).join("");

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
      background: #f0f0f0 !important;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
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
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
      white-space: nowrap;
    }

    .bar-bg {
      width: 100%;
      height: 14px;
      background: #e0e0e0;
      border-radius: 3px;
      overflow: hidden;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .bar-fill {
      height: 100%;
      background: #4a90d9;
      border-radius: 3px;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .highlight-box {
      background: #f0f4ff !important;
      border-left: 4px solid #2563eb;
      padding: 12px 16px;
      margin: 12px 0;
      font-size: 11pt;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .highlight-box p { text-indent: 0; }

    /* ── Print-safe Charts ── */
    .charts-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin: 16px 0;
    }
    .chart-box {
      border: 1px solid #ccc;
      border-radius: 6px;
      padding: 12px;
      page-break-inside: avoid;
    }
    .chart-box-title {
      font-size: 10pt;
      font-weight: bold;
      margin-bottom: 8px;
      color: #333;
      text-align: center;
    }
    .chart-row {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 4px;
      font-size: 9pt;
    }
    .chart-label {
      width: 100px;
      text-align: right;
      flex-shrink: 0;
      font-size: 9pt;
    }
    .chart-bar-track {
      flex: 1;
      height: 16px;
      background: #eee;
      border-radius: 3px;
      overflow: hidden;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .chart-bar-value {
      height: 100%;
      border-radius: 3px;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .chart-count {
      width: 30px;
      text-align: right;
      font-weight: bold;
      font-size: 9pt;
    }

    .repo-chart-item {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 6px;
    }
    .repo-dot {
      width: 14px;
      height: 14px;
      border-radius: 50%;
      flex-shrink: 0;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .repo-info { font-size: 9pt; line-height: 1.3; }
    .repo-info span { color: #666; }

    /* Day of week vertical bars */
    .dow-chart {
      display: flex;
      align-items: flex-end;
      justify-content: center;
      gap: 8px;
      height: 120px;
      padding-top: 10px;
    }
    .dow-col {
      display: flex;
      flex-direction: column;
      align-items: center;
      flex: 1;
    }
    .dow-value {
      font-size: 8pt;
      font-weight: bold;
      margin-bottom: 2px;
    }
    .dow-bar-track {
      width: 24px;
      height: 80px;
      background: #eee;
      border-radius: 3px 3px 0 0;
      position: relative;
      overflow: hidden;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .dow-bar-fill {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: #2563eb;
      border-radius: 3px 3px 0 0;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .dow-label {
      font-size: 8pt;
      margin-top: 3px;
      color: #555;
    }

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
      * {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
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
      ${pick([
        `Laporan ini disusun sebagai bentuk pertanggungjawaban dan dokumentasi resmi atas seluruh aktivitas pengembangan perangkat lunak`,
        `Dokumen ini merupakan laporan pertanggungjawaban komprehensif mengenai kegiatan pengembangan perangkat lunak`,
        `Sebagai bagian dari mekanisme akuntabilitas dan transparansi, laporan ini menyajikan rekam jejak lengkap aktivitas pengembangan`,
      ])}
      yang telah dilaksanakan selama periode ${startDate.format("DD MMMM YYYY")} sampai dengan ${endDate.format("DD MMMM YYYY")}.
      ${pick([
        `Selama periode tersebut, tercatat sebanyak`,
        `Dalam kurun waktu tersebut, telah terakumulasi`,
        `Sepanjang periode pelaporan, berhasil dicatatkan`,
      ])} <strong>${totalCommits} commit</strong> pada
      <strong>${activeRepos.length} repository</strong> yang dikerjakan oleh
      <strong>${authors.length} kontributor</strong> dalam <strong>${days.length} hari kerja aktif</strong>.
    </p>
    <p>
      ${pick([
        `Laporan ini mencakup ringkasan kuantitatif, analisis distribusi aktivitas berdasarkan kategori pekerjaan, pola waktu kerja, kontribusi individu, visualisasi data, serta tren produktivitas selama periode pelaporan.`,
        `Cakupan laporan meliputi statistik agregat, kategorisasi jenis pekerjaan, analisis temporal, evaluasi kontribusi per anggota tim, grafik visual, dan penilaian tren produktivitas secara menyeluruh.`,
        `Isi laporan ini meliputi data kuantitatif, analisis kategori commit, pemetaan pola waktu, distribusi kontribusi, representasi visual data, serta evaluasi tren dan rekomendasi ke depan.`,
      ])}
      ${pick([
        `Seluruh data bersumber langsung dari sistem version control (Git) sehingga menjamin akurasi, objektivitas, dan auditabilitas informasi yang disajikan.`,
        `Data yang menjadi dasar penyusunan laporan ini diambil secara otomatis dari sistem Git, sehingga keakuratan dan ketertelusurannya dapat dipertanggungjawabkan.`,
        `Sumber data utama adalah log aktivitas Git yang bersifat immutable, sehingga validitas dan integritas data dalam laporan ini dapat dipastikan.`,
      ])}
    </p>
  </div>

  <!-- II. RINGKASAN PER REPOSITORY -->
  <div class="section">
    <p class="section-title">II. RINGKASAN AKTIVITAS PER REPOSITORY</p>
    <p>
      ${pick([
        `Berikut adalah ringkasan distribusi commit pada setiap repository yang aktif selama periode pelaporan. Tabel ini memberikan gambaran proporsional mengenai alokasi upaya pengembangan di masing-masing proyek.`,
        `Tabel berikut menyajikan data akumulasi commit per repository, memberikan perspektif mengenai prioritas dan fokus pengembangan yang berlaku selama periode berjalan.`,
        `Distribusi aktivitas di berbagai repository dapat dilihat pada tabel di bawah ini, yang menunjukkan bagaimana sumber daya pengembangan dialokasikan di antara proyek-proyek yang sedang dikerjakan.`,
      ])}
    </p>
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
      ${pick([
        `Setiap commit diklasifikasikan secara otomatis berdasarkan konvensi pesan commit (commit message convention) ke dalam kategori-kategori berikut untuk memberikan gambaran komprehensif mengenai fokus dan jenis pekerjaan yang dilakukan.`,
        `Melalui analisis otomatis terhadap pesan commit menggunakan pola pencocokan semantik, setiap perubahan kode diklasifikasikan ke dalam kategori yang merepresentasikan jenis pekerjaan yang dilakukan.`,
        `Kategorisasi berikut dihasilkan dari proses analisis otomatis terhadap seluruh commit message, yang memungkinkan identifikasi proporsi setiap jenis aktivitas pengembangan.`,
      ])}
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

  <!-- IV. VISUALISASI DATA -->
  <div class="section">
    <p class="section-title">IV. VISUALISASI DATA</p>
    <p>
      ${pick([
        `Grafik berikut menyajikan visualisasi dari berbagai aspek aktivitas pengembangan untuk memudahkan interpretasi dan analisis pola-pola yang ada.`,
        `Untuk memperkaya pemahaman terhadap data yang telah dipaparkan, berikut disajikan representasi visual dari beberapa dimensi penting aktivitas pengembangan.`,
        `Visualisasi data di bawah ini bertujuan untuk memberikan perspektif yang lebih intuitif mengenai distribusi dan pola aktivitas selama periode pelaporan.`,
      ])}
    </p>
    <div class="charts-grid">
      <div class="chart-box">
        <div class="chart-box-title">Distribusi Kategori Pekerjaan</div>
        ${categoryChartHTML}
      </div>
      <div class="chart-box">
        <div class="chart-box-title">Distribusi per Repository</div>
        ${repoChartHTML}
      </div>
      <div class="chart-box">
        <div class="chart-box-title">Distribusi Waktu Kerja</div>
        ${hourChartHTML}
      </div>
      <div class="chart-box">
        <div class="chart-box-title">Aktivitas per Hari (Mingguan)</div>
        <div class="dow-chart">
          ${dowChartHTML}
        </div>
      </div>
    </div>
  </div>

  <!-- V. ANALISIS NARATIF -->
  <div class="section">
    <p class="section-title">V. ANALISIS DAN EVALUASI MENDALAM</p>
    <div class="highlight-box">
      <p><strong>📊 Analisis Cerdas (Smart Analysis)</strong></p>
      <p><em>Narasi berikut dihasilkan secara otomatis berdasarkan pemrosesan data commit untuk memberikan evaluasi menyeluruh terhadap kinerja pengembangan.</em></p>
    </div>
    ${narrativeHTML}
  </div>

  <!-- VI. RINCIAN AKTIVITAS HARIAN -->
  <div class="section">
    <p class="section-title">VI. RINCIAN AKTIVITAS HARIAN</p>
    <p>
      ${pick([
        `Tabel berikut memuat seluruh rincian aktivitas pengembangan yang dilakukan per hari, mencakup deskripsi pekerjaan, kategori, repository terkait, dan pelaksana.`,
        `Berikut adalah daftar lengkap aktivitas pengembangan yang tercatat pada setiap hari kerja, disusun secara kronologis untuk memudahkan penelusuran.`,
        `Detail aktivitas harian disajikan dalam tabel di bawah ini, yang menampilkan setiap perubahan kode beserta konteks dan informasi pelaksanaannya.`,
      ])}
    </p>
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

  <!-- VII. KESIMPULAN -->
  <div class="section">
    <p class="section-title">VII. KESIMPULAN DAN REKOMENDASI</p>
    <p>
      ${pick([
        `Berdasarkan seluruh data dan analisis yang telah dipaparkan di atas,`,
        `Mengacu pada data kuantitatif dan analisis naratif yang telah disajikan,`,
        `Dengan mempertimbangkan keseluruhan temuan dan evaluasi dalam laporan ini,`,
      ])} selama periode pelaporan telah dilakukan total <strong>${totalCommits} perubahan kode</strong>
      (commit) pada <strong>${activeRepos.length} repository</strong> proyek. ${pick([
        `Repository dengan aktivitas tertinggi adalah`,
        `Fokus utama pengembangan terletak pada`,
        `Proyek yang menerima porsi terbesar dari aktivitas pengembangan adalah`,
      ])}
      <strong>${Object.entries(repoStats).sort((a, b) => b[1] - a[1])[0]?.[0] || "-"}</strong>
      dengan ${Object.entries(repoStats).sort((a, b) => b[1] - a[1])[0]?.[1] || 0} commit.
    </p>
    <p>
      ${pick([
        `Secara keseluruhan, pekerjaan pengembangan berjalan sesuai dengan rencana yang telah ditetapkan. Tim menunjukkan konsistensi dalam melakukan commit secara berkala, yang mencerminkan disiplin dalam proses pengembangan dan penggunaan version control yang baik.`,
        `Evaluasi umum menunjukkan bahwa proses pengembangan telah berlangsung dengan baik dan terstruktur. Konsistensi pencatatan melalui version control menandakan adanya budaya kerja yang positif dan akuntabel dalam tim.`,
        `Secara garis besar, capaian selama periode ini menunjukkan progres yang memadai. Kebiasaan melakukan commit secara teratur mencerminkan profesionalisme dan disiplin dalam pengelolaan kode sumber.`,
      ])}
    </p>
    <p>
      <strong>Rekomendasi:</strong> ${pick([
        `Untuk meningkatkan kualitas pengembangan ke depan, disarankan untuk: (1) mempertahankan konsistensi commit harian yang telah terbangun, (2) memperbanyak penulisan unit test dan integration test untuk menjamin stabilitas setiap rilis, (3) melakukan code review secara rutin untuk menjaga kualitas kode dan transfer knowledge, serta (4) mendokumentasikan keputusan arsitektur penting agar dapat direferensikan oleh anggota tim di masa mendatang.`,
        `Berdasarkan temuan dalam laporan ini, beberapa langkah yang direkomendasikan adalah: (1) terus menjaga momentum dan ritme kerja yang telah terbentuk, (2) meningkatkan cakupan automated testing untuk mengurangi risiko regresi, (3) mengimplementasikan proses code review yang lebih terstruktur, dan (4) mempertimbangkan penerapan CI/CD pipeline yang lebih komprehensif untuk mempercepat siklus rilis.`,
        `Sebagai upaya peningkatan berkelanjutan, berikut langkah-langkah yang direkomendasikan: (1) mempertahankan dan meningkatkan frekuensi commit dengan pesan yang deskriptif, (2) memperkuat budaya testing dengan target coverage yang terukur, (3) menjalankan peer review secara konsisten, dan (4) melakukan retrospektif berkala untuk mengidentifikasi area-area yang dapat dioptimalkan.`,
      ])}
    </p>
  </div>

  <!-- VIII. PENUTUP -->
  <div class="section">
    <p class="section-title">VIII. PENUTUP</p>
    <p>
      ${pick([
        `Demikian laporan ini dibuat dengan sebenar-benarnya berdasarkan data yang tercatat pada sistem version control. Laporan ini dapat dipergunakan sebagai bahan evaluasi kinerja pengembangan perangkat lunak serta dokumentasi resmi aktivitas tim selama periode yang bersangkutan.`,
        `Laporan ini disusun berdasarkan data aktual dari sistem Git dan disajikan dengan sebaik-baiknya. Semoga dapat bermanfaat sebagai bahan evaluasi, dokumentasi, dan referensi dalam perencanaan pengembangan di periode selanjutnya.`,
        `Dengan ini laporan aktivitas pengembangan perangkat lunak untuk periode tersebut telah selesai disusun. Data dan analisis yang disajikan bersumber dari catatan resmi version control dan dapat dipertanggungjawabkan keakuratannya. Kiranya laporan ini dapat menjadi acuan dalam pengambilan keputusan dan perencanaan ke depan.`,
      ])}
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
