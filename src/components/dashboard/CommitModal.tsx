import { useEffect, useState } from "react";
import { NormalizedCommit, CommitDetail } from "@/types/commit";
import { fetchCommitDetail } from "@/services/githubService";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, FilePlus, FileMinus, FileEdit } from "lucide-react";
import dayjs from "dayjs";

interface Props {
  commit: NormalizedCommit | null;
  open: boolean;
  onClose: () => void;
}

export function CommitModal({ commit, open, onClose }: Props) {
  const [detail, setDetail] = useState<CommitDetail | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!commit || !open) { setDetail(null); return; }
    setLoading(true);
    const [owner, repo] = commit.repoFullName.split("/");
    fetchCommitDetail(owner, repo, commit.sha)
      .then(setDetail)
      .finally(() => setLoading(false));
  }, [commit, open]);

  if (!commit) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold leading-snug">{commit.message.split("\n")[0]}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 text-sm">
          <div className="flex flex-wrap gap-2 text-muted-foreground">
            <span>{commit.author}</span>
            <span>·</span>
            <span>{dayjs(commit.date).format("MMM D, YYYY HH:mm")}</span>
            <span>·</span>
            <span>{commit.repo}</span>
          </div>

          {commit.message.includes("\n") && (
            <pre className="whitespace-pre-wrap text-xs bg-muted p-3 rounded-md text-muted-foreground">{commit.message}</pre>
          )}

          {loading && <p className="text-muted-foreground">Loading details...</p>}

          {detail && (
            <>
              <div className="flex gap-3">
                <Badge variant="secondary" className="gap-1">
                  <FilePlus className="h-3 w-3 text-green-500" /> +{detail.stats.additions}
                </Badge>
                <Badge variant="secondary" className="gap-1">
                  <FileMinus className="h-3 w-3 text-destructive" /> -{detail.stats.deletions}
                </Badge>
                <Badge variant="secondary">{detail.files.length} files</Badge>
              </div>

              <div className="space-y-1">
                {detail.files.map((f) => (
                  <div key={f.filename} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <FileEdit className="h-3 w-3 shrink-0" />
                    <span className="truncate">{f.filename}</span>
                    <span className="ml-auto text-green-500">+{f.additions}</span>
                    <span className="text-destructive">-{f.deletions}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          <a
            href={commit.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
          >
            View on GitHub <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
}
