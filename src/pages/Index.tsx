import { useState, useEffect, useCallback, useMemo } from "react";
import { config } from "@/config";
import { NormalizedCommit, TimeFilter, AutoRefresh } from "@/types/commit";
import { fetchAllCommits, fetchCommits } from "@/services/githubService";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { SummaryCards } from "@/components/dashboard/SummaryCards";
import { Charts } from "@/components/dashboard/Charts";
import { CommitTable } from "@/components/dashboard/CommitTable";
import { LogbookView } from "@/components/dashboard/LogbookView";
import { CommitModal } from "@/components/dashboard/CommitModal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import dayjs from "dayjs";

function getDateRange(filter: TimeFilter, custom: { from: string; to: string }) {
  const now = dayjs();
  switch (filter) {
    case "today":
      return { since: now.startOf("day").toISOString(), until: now.endOf("day").toISOString() };
    case "week":
      return { since: now.startOf("week").toISOString(), until: now.endOf("day").toISOString() };
    case "month":
      return { since: now.startOf("month").toISOString(), until: now.endOf("day").toISOString() };
    case "custom":
      return {
        since: custom.from ? dayjs(custom.from).startOf("day").toISOString() : undefined,
        until: custom.to ? dayjs(custom.to).endOf("day").toISOString() : undefined,
      };
  }
}

const Index = () => {
  const { toast } = useToast();
  const [commits, setCommits] = useState<NormalizedCommit[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRepo, setSelectedRepo] = useState("all");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("month");
  const [customRange, setCustomRange] = useState({ from: "", to: "" });
  const [autoRefresh, setAutoRefresh] = useState<AutoRefresh>("off");
  const [modalCommit, setModalCommit] = useState<NormalizedCommit | null>(null);

  const loadCommits = useCallback(async () => {
    setLoading(true);
    try {
      const { since, until } = getDateRange(timeFilter, customRange);
      let data: NormalizedCommit[];
      if (selectedRepo === "all") {
        data = await fetchAllCommits(config.repositories, since, until);
      } else {
        const repo = config.repositories.find((r) => r.repo === selectedRepo);
        data = repo ? await fetchCommits(repo, since, until) : [];
      }
      setCommits(data);
    } catch (err: any) {
      toast({ title: "Error fetching commits", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [selectedRepo, timeFilter, customRange, toast]);

  useEffect(() => { loadCommits(); }, [loadCommits]);

  useEffect(() => {
    if (autoRefresh === "off") return;
    const ms = parseInt(autoRefresh) * 60 * 1000;
    const id = setInterval(loadCommits, ms);
    return () => clearInterval(id);
  }, [autoRefresh, loadCommits]);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar
          selectedRepo={selectedRepo}
          onSelectRepo={setSelectedRepo}
          timeFilter={timeFilter}
          onTimeFilter={setTimeFilter}
          customRange={customRange}
          onCustomRange={setCustomRange}
          autoRefresh={autoRefresh}
          onAutoRefresh={setAutoRefresh}
          onRefresh={loadCommits}
          loading={loading}
        />

        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-12 flex items-center border-b border-border px-4 bg-background shrink-0">
            <SidebarTrigger className="mr-3" />
            <h1 className="text-sm font-semibold text-foreground">Git Logbook Dashboard</h1>
            {loading && <Loader2 className="ml-2 h-4 w-4 animate-spin text-muted-foreground" />}
          </header>

          <main className="flex-1 overflow-auto p-4 md:p-6 space-y-6">
            <SummaryCards commits={commits} />
            <Charts commits={commits} />

            <Tabs defaultValue="table" className="w-full">
              <TabsList className="bg-muted">
                <TabsTrigger value="table">Commit Table</TabsTrigger>
                <TabsTrigger value="logbook">Daily Logbook</TabsTrigger>
              </TabsList>
              <TabsContent value="table" className="mt-4">
                <CommitTable commits={commits} onClickCommit={setModalCommit} />
              </TabsContent>
              <TabsContent value="logbook" className="mt-4">
                <LogbookView commits={commits} />
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>

      <CommitModal commit={modalCommit} open={!!modalCommit} onClose={() => setModalCommit(null)} />
    </SidebarProvider>
  );
};

export default Index;
