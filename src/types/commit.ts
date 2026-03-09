export interface NormalizedCommit {
  sha: string;
  repo: string;
  repoFullName: string;
  author: string;
  message: string;
  date: string;
  url: string;
  avatarUrl: string;
}

export interface CommitDetail extends NormalizedCommit {
  files: CommitFile[];
  stats: { additions: number; deletions: number; total: number };
}

export interface CommitFile {
  filename: string;
  status: string;
  additions: number;
  deletions: number;
  changes: number;
}

export type TimeFilter = "today" | "week" | "month" | "custom";
export type AutoRefresh = "off" | "5" | "10";
