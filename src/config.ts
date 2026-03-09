export interface RepoConfig {
  name: string;
  owner: string;
  repo: string;
}

export const config = {
  githubToken: "",
  repositories: [
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
