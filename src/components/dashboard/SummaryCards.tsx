import { NormalizedCommit } from "@/types/commit";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GitCommit, FolderGit2, CalendarDays, Flame } from "lucide-react";
import dayjs from "dayjs";

interface Props {
  commits: NormalizedCommit[];
}

export function SummaryCards({ commits }: Props) {
  const totalCommits = commits.length;

  const activeRepos = new Set(commits.map((c) => c.repo)).size;

  // Most active day
  const dayCount: Record<string, number> = {};
  commits.forEach((c) => {
    const day = dayjs(c.date).format("YYYY-MM-DD");
    dayCount[day] = (dayCount[day] || 0) + 1;
  });
  const mostActiveDay = Object.entries(dayCount).sort((a, b) => b[1] - a[1])[0];

  // Most active repo
  const repoCount: Record<string, number> = {};
  commits.forEach((c) => {
    repoCount[c.repo] = (repoCount[c.repo] || 0) + 1;
  });
  const mostActiveRepo = Object.entries(repoCount).sort((a, b) => b[1] - a[1])[0];

  // Commit streak
  const uniqueDays = [...new Set(commits.map((c) => dayjs(c.date).format("YYYY-MM-DD")))].sort().reverse();
  let streak = 0;
  let current = dayjs();
  for (const day of uniqueDays) {
    if (dayjs(day).isSame(current, "day") || dayjs(day).isSame(current.subtract(1, "day"), "day")) {
      streak++;
      current = dayjs(day);
    } else break;
  }

  const cards = [
    {
      title: "Total Commits",
      value: totalCommits,
      icon: GitCommit,
      desc: "across all repos",
    },
    {
      title: "Active Repos",
      value: activeRepos,
      icon: FolderGit2,
      desc: "with commits",
    },
    {
      title: "Most Active Day",
      value: mostActiveDay ? dayjs(mostActiveDay[0]).format("MMM D") : "—",
      icon: CalendarDays,
      desc: mostActiveDay ? `${mostActiveDay[1]} commits` : "no data",
    },
    {
      title: "Commit Streak",
      value: `${streak}d`,
      icon: Flame,
      desc: streak > 0 ? "consecutive days" : "no streak",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title} className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
            <card.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">{card.value}</div>
            <p className="text-xs text-muted-foreground">{card.desc}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
