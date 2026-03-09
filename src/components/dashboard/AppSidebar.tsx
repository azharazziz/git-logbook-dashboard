import { getRepositories, RepoConfig } from "@/config";
import { TimeFilter, AutoRefresh } from "@/types/commit";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel,
  SidebarGroupContent, SidebarHeader, SidebarFooter,
} from "@/components/ui/sidebar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { GitBranch, Sun, Moon, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";

interface Props {
  selectedRepo: string;
  onSelectRepo: (v: string) => void;
  timeFilter: TimeFilter;
  onTimeFilter: (v: TimeFilter) => void;
  customRange: { from: string; to: string };
  onCustomRange: (r: { from: string; to: string }) => void;
  autoRefresh: AutoRefresh;
  onAutoRefresh: (v: AutoRefresh) => void;
  onRefresh: () => void;
  loading: boolean;
  repos: RepoConfig[];
  onLogout: () => void;
}

export function AppSidebar({
  selectedRepo, onSelectRepo, timeFilter, onTimeFilter,
  customRange, onCustomRange, autoRefresh, onAutoRefresh, onRefresh, loading,
}: Props) {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains("dark"));

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  const timeButtons: { label: string; value: TimeFilter }[] = [
    { label: "Today", value: "today" },
    { label: "This Week", value: "week" },
    { label: "This Month", value: "month" },
    { label: "Custom", value: "custom" },
  ];

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <GitBranch className="h-5 w-5 text-primary" />
          <span className="font-bold text-sm text-sidebar-foreground group-data-[collapsible=icon]:hidden">Git Logbook</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Repository</SidebarGroupLabel>
          <SidebarGroupContent className="px-2 group-data-[collapsible=icon]:hidden">
            <Select value={selectedRepo} onValueChange={onSelectRepo}>
              <SelectTrigger className="w-full bg-sidebar-accent text-sidebar-accent-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Repositories</SelectItem>
                {config.repositories.map((r) => (
                  <SelectItem key={r.repo} value={r.repo}>{r.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Time Filter</SidebarGroupLabel>
          <SidebarGroupContent className="px-2 space-y-1 group-data-[collapsible=icon]:hidden">
            {timeButtons.map((t) => (
              <Button
                key={t.value}
                variant={timeFilter === t.value ? "default" : "ghost"}
                size="sm"
                className="w-full justify-start text-xs"
                onClick={() => onTimeFilter(t.value)}
              >
                {t.label}
              </Button>
            ))}
            {timeFilter === "custom" && (
              <div className="space-y-2 pt-1">
                <div>
                  <Label className="text-xs text-muted-foreground">From</Label>
                  <Input type="date" value={customRange.from} onChange={(e) => onCustomRange({ ...customRange, from: e.target.value })} className="h-8 text-xs bg-sidebar-accent" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">To</Label>
                  <Input type="date" value={customRange.to} onChange={(e) => onCustomRange({ ...customRange, to: e.target.value })} className="h-8 text-xs bg-sidebar-accent" />
                </div>
              </div>
            )}
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Auto Refresh</SidebarGroupLabel>
          <SidebarGroupContent className="px-2 group-data-[collapsible=icon]:hidden">
            <Select value={autoRefresh} onValueChange={(v) => onAutoRefresh(v as AutoRefresh)}>
              <SelectTrigger className="w-full bg-sidebar-accent text-sidebar-accent-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="off">Manual</SelectItem>
                <SelectItem value="5">Every 5 min</SelectItem>
                <SelectItem value="10">Every 10 min</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="ghost" size="sm" className="w-full mt-1 text-xs" onClick={onRefresh} disabled={loading}>
              <RefreshCw className={`mr-1 h-3 w-3 ${loading ? "animate-spin" : ""}`} /> Refresh Now
            </Button>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 group-data-[collapsible=icon]:hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Dark Mode</span>
          <div className="flex items-center gap-2">
            <Sun className="h-3 w-3 text-muted-foreground" />
            <Switch checked={dark} onCheckedChange={setDark} />
            <Moon className="h-3 w-3 text-muted-foreground" />
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
