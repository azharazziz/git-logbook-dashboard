import { useState, useEffect, useCallback } from "react";
import { config, RepoConfig } from "@/config";
import { NormalizedCommit, TimeFilter, AutoRefresh } from "@/types/commit";
import { fetchAllCommits, fetchCommits, fetchAllBranches, BranchInfo } from "@/services/githubService";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { SummaryCards } from "@/components/dashboard/SummaryCards";
import { Charts } from "@/components/dashboard/Charts";
import { CommitTable } from "@/components/dashboard/CommitTable";
import { LogbookView } from "@/components/dashboard/LogbookView";
import { CommitModal } from "@/components/dashboard/CommitModal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { printReport } from "@/utils/printReport";
import { FormalReportDialog } from "@/components/dashboard/FormalReportDialog";
import { Loader2, Printer, FileText } from "lucide-react";
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
  const { logout } = useAuth();
  const repos = config.repositories;
  const [commits, setCommits] = useState<NormalizedCommit[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRepo, setSelectedRepo] = useState("all");
  const [selectedBranch, setSelectedBranch] = useState("all");
  const [branches, setBranches] = useState<BranchInfo[]>([]);
  const [branchesLoading, setBranchesLoading] = useState(false);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("month");
  const [customRange, setCustomRange] = useState({ from: "", to: "" });
  const [autoRefresh, setAutoRefresh] = useState<AutoRefresh>("off");
  const [modalCommit, setModalCommit] = useState<NormalizedCommit | null>(null);
  const [showFormalReport, setShowFormalReport] = useState(false);

  // Fetch branches when repos change
  useEffect(() => {
    const loadBranches = async () => {
      setBranchesLoading(true);
      try {
        const data = await fetchAllBranches(repos);
        setBranches(data);
      } catch {
        setBranches([]);
      } finally {
        setBranchesLoading(false);
      }
    };
    loadBranches();
  }, [repos]);

  // Reset branch when repo changes
  useEffect(() => {
    setSelectedBranch("all");
  }, [selectedRepo]);

  const loadCommits = useCallback(async () => {
    setLoading(true);
    try {
      const { since, until } = getDateRange(timeFilter, customRange);
      const branch = selectedBranch === "all" ? undefined : selectedBranch;
      let data: NormalizedCommit[];
      if (selectedRepo === "all") {
        data = await fetchAllCommits(repos, since, until, branch);
      } else {
        const repo = repos.find((r) => r.repo === selectedRepo);
        data = repo ? await fetchCommits(repo, since, until, branch) : [];
      }
      setCommits(data);
    } catch (err: any) {
      toast({ title: "Error fetching commits", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [selectedRepo, selectedBranch, timeFilter, customRange, repos, toast]);

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
          selectedBranch={selectedBranch}
          onSelectBranch={setSelectedBranch}
          branches={branches}
          branchesLoading={branchesLoading}
          timeFilter={timeFilter}
          onTimeFilter={setTimeFilter}
          customRange={customRange}
          onCustomRange={setCustomRange}
          autoRefresh={autoRefresh}
          onAutoRefresh={setAutoRefresh}
          onRefresh={loadCommits}
          loading={loading}
          repos={repos}
          onLogout={logout}
        />

        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-12 flex items-center border-b border-border px-4 bg-background shrink-0">
            <SidebarTrigger className="mr-3" />
            <h1 className="text-sm font-semibold text-foreground">Git Logbook Dashboard</h1>
            {loading && <Loader2 className="ml-2 h-4 w-4 animate-spin text-muted-foreground" />}
            <div className="ml-auto flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowFormalReport(true)}>
                <FileText className="mr-1 h-4 w-4" /> Laporan Formal
              </Button>
              <Button variant="outline" size="sm" onClick={() => printReport(commits)}>
                <Printer className="mr-1 h-4 w-4" /> Cetak Report
              </Button>
            </div>
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
      <FormalReportDialog commits={commits} open={showFormalReport} onClose={() => setShowFormalReport(false)} />
    </SidebarProvider>
  );
};

export default Index;
