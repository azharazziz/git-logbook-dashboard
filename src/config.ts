export interface RepoConfig {
  name: string;
  owner: string;
  repo: string;
}

export const config = {
  // =============================================
  // LOGIN CREDENTIALS
  // Ubah username dan password di sini
  // =============================================
  auth: {
    username: "admin",
    password: "admin123",
  },

  // =============================================
  // GITHUB TOKEN (opsional, untuk private repo)
  // Dapatkan di: https://github.com/settings/tokens
  // Scope yang diperlukan: "repo" (untuk private repo)
  // =============================================
  githubToken: "",

  // =============================================
  // DAFTAR REPOSITORY
  // Tambahkan repository yang ingin di-track
  // =============================================
  repositories: [
    {
      name: "Donasi Al Quran",
      owner: "azharazziz",
      repo: "donasi-alquran-linktree",
    },
  ] as RepoConfig[],
};
