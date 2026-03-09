export interface RepoConfig {
  name: string;
  owner: string;
  repo: string;
}

export const config = {
  githubToken: "",

  // Login credentials (config-based auth)
  auth: {
    username: "admin",
    password: "admin123",
  },

  // Default repositories (can be overridden via UI settings stored in localStorage)
  defaultRepositories: [
    {
      name: "Portal Labkesmas",
      owner: "username",
      repo: "portal-labkesmas",
    },
    {
      name: "Donasi Al Quran",
      owner: "username",
      repo: "donasi-alquran-linktree",
    },
  ] as RepoConfig[],
};

// Helper to get repositories (localStorage override or defaults)
export function getRepositories(): RepoConfig[] {
  try {
    const stored = localStorage.getItem("git-logbook-repos");
    if (stored) return JSON.parse(stored);
  } catch {}
  return config.defaultRepositories;
}

export function saveRepositories(repos: RepoConfig[]) {
  localStorage.setItem("git-logbook-repos", JSON.stringify(repos));
}

export function getGithubToken(): string {
  return localStorage.getItem("git-logbook-token") || config.githubToken;
}

export function saveGithubToken(token: string) {
  localStorage.setItem("git-logbook-token", token);
}
