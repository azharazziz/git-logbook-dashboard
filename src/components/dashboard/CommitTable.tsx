import { useState, useMemo } from "react";
import { NormalizedCommit } from "@/types/commit";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ExternalLink, ChevronLeft, ChevronRight, ArrowUpDown } from "lucide-react";
import dayjs from "dayjs";

interface Props {
  commits: NormalizedCommit[];
  onClickCommit: (commit: NormalizedCommit) => void;
}

const PAGE_SIZE = 10;

export function CommitTable({ commits, onClickCommit }: Props) {
  const [search, setSearch] = useState("");
  const [authorFilter, setAuthorFilter] = useState("all");
  const [page, setPage] = useState(0);
  const [sortAsc, setSortAsc] = useState(false);

  const authors = useMemo(() => [...new Set(commits.map((c) => c.author))], [commits]);

  const filtered = useMemo(() => {
    let list = commits;
    if (search) list = list.filter((c) => c.message.toLowerCase().includes(search.toLowerCase()));
    if (authorFilter !== "all") list = list.filter((c) => c.author === authorFilter);
    if (sortAsc) list = [...list].reverse();
    return list;
  }, [commits, search, authorFilter, sortAsc]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageData = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Input
          placeholder="Search commits..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          className="max-w-xs bg-background"
        />
        <Select value={authorFilter} onValueChange={(v) => { setAuthorFilter(v); setPage(0); }}>
          <SelectTrigger className="w-[180px] bg-background">
            <SelectValue placeholder="Filter by author" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Authors</SelectItem>
            {authors.map((a) => (
              <SelectItem key={a} value={a}>{a}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border border-border overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="cursor-pointer" onClick={() => setSortAsc(!sortAsc)}>
                <span className="flex items-center gap-1">Date <ArrowUpDown className="h-3 w-3" /></span>
              </TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Repository</TableHead>
              <TableHead>Message</TableHead>
              <TableHead className="w-10">Link</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageData.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  No commits found
                </TableCell>
              </TableRow>
            )}
            {pageData.map((c) => (
              <TableRow key={c.sha} className="cursor-pointer hover:bg-muted/50" onClick={() => onClickCommit(c)}>
                <TableCell className="whitespace-nowrap text-sm">{dayjs(c.date).format("MMM D, HH:mm")}</TableCell>
                <TableCell className="text-sm">{c.author}</TableCell>
                <TableCell className="text-sm">{c.repo}</TableCell>
                <TableCell className="text-sm max-w-[300px] truncate">{c.message.split("\n")[0]}</TableCell>
                <TableCell>
                  <a href={c.url} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>
                    <ExternalLink className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                  </a>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Page {page + 1} of {totalPages}</span>
          <div className="flex gap-1">
            <Button variant="outline" size="icon" className="h-8 w-8" disabled={page === 0} onClick={() => setPage(page - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
