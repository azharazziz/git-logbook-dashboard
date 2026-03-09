import { config, RepoConfig } from "@/config";
import { NormalizedCommit, CommitDetail, CommitFile } from "@/types/commit";

function getHeaders() {
  const h: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
  };
  if (config.githubToken) h.Authorization = `Bearer ${config.githubToken}`;
  return h;
}

export async function fetchCommits(
  repoConfig: RepoConfig,
  since?: string,
  until?: string
): Promise<NormalizedCommit[]> {
  const allCommits: NormalizedCommit[] = [];
  let page = 1;

  while (true) {
    const params = new URLSearchParams();
    if (since) params.set("since", since);
    if (until) params.set("until", until);
    params.set("per_page", "100");
    params.set("page", String(page));

    const url = `https://api.github.com/repos/${repoConfig.owner}/${repoConfig.repo}/commits?${params}`;
    const res = await fetch(url, { headers: getHeaders() });

    if (!res.ok) {
      throw new Error(`GitHub API error for ${repoConfig.name}: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) break;

    allCommits.push(
      ...data.map((item: any) => ({
        sha: item.sha,
        repo: repoConfig.name,
        repoFullName: `${repoConfig.owner}/${repoConfig.repo}`,
        author: item.commit?.author?.name || item.author?.login || "Unknown",
        message: item.commit?.message || "",
        date: item.commit?.author?.date || "",
        url: item.html_url,
        avatarUrl: item.author?.avatar_url || "",
      }))
    );

    // If less than 100 returned, no more pages
    if (data.length < 100) break;
    page++;
  }

  return allCommits;
}

export async function fetchAllCommits(
  repos: RepoConfig[],
  since?: string,
  until?: string
): Promise<NormalizedCommit[]> {
  const results = await Promise.allSettled(
    repos.map((r) => fetchCommits(r, since, until))
  );

  const commits: NormalizedCommit[] = [];
  const errors: string[] = [];

  results.forEach((result, i) => {
    if (result.status === "fulfilled") {
      commits.push(...result.value);
    } else {
      errors.push(`${repos[i].name}: ${result.reason?.message || "Unknown error"}`);
    }
  });

  if (errors.length > 0 && commits.length === 0) {
    throw new Error(errors.join("\n"));
  }

  return commits.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function fetchCommitDetail(
  owner: string,
  repo: string,
  sha: string
): Promise<CommitDetail | null> {
  const url = `https://api.github.com/repos/${owner}/${repo}/commits/${sha}`;
  const res = await fetch(url, { headers: getHeaders() });
  if (!res.ok) return null;
  const data = await res.json();

  return {
    sha: data.sha,
    repo: `${owner}/${repo}`,
    repoFullName: `${owner}/${repo}`,
    author: data.commit?.author?.name || "Unknown",
    message: data.commit?.message || "",
    date: data.commit?.author?.date || "",
    url: data.html_url,
    avatarUrl: data.author?.avatar_url || "",
    stats: data.stats || { additions: 0, deletions: 0, total: 0 },
    files: (data.files || []).map((f: any): CommitFile => ({
      filename: f.filename,
      status: f.status,
      additions: f.additions,
      deletions: f.deletions,
      changes: f.changes,
    })),
  };
}
