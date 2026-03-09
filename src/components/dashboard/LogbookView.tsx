import { useMemo } from "react";
import { NormalizedCommit } from "@/types/commit";
import { Button } from "@/components/ui/button";
import { Copy, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import dayjs from "dayjs";

interface Props {
  commits: NormalizedCommit[];
}

export function LogbookView({ commits }: Props) {
  const { toast } = useToast();

  const grouped = useMemo(() => {
    const map: Record<string, NormalizedCommit[]> = {};
    commits.forEach((c) => {
      const day = dayjs(c.date).format("MMMM D, YYYY");
      if (!map[day]) map[day] = [];
      map[day].push(c);
    });
    return Object.entries(map);
  }, [commits]);

  const toMarkdown = () => {
    return grouped
      .map(([day, items]) => {
        const lines = items.map((c) => `- ${c.message.split("\n")[0]} _(${c.repo})_`);
        return `## ${day}\n${lines.join("\n")}`;
      })
      .join("\n\n");
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(toMarkdown());
    toast({ title: "Copied!", description: "Logbook copied to clipboard." });
  };

  const downloadMarkdown = () => {
    const blob = new Blob([toMarkdown()], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `logbook-${dayjs().format("YYYY-MM-DD")}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadPDF = () => {
    const w = window.open("", "_blank");
    if (!w) return;
    const html = grouped
      .map(([day, items]) => {
        const lis = items.map((c) => `<li>${c.message.split("\n")[0]} <em>(${c.repo})</em></li>`).join("");
        return `<h2>${day}</h2><ul>${lis}</ul>`;
      })
      .join("");
    w.document.write(`<html><head><title>Logbook</title><style>body{font-family:system-ui;padding:2rem;max-width:700px;margin:auto}h2{margin-top:1.5rem}li{margin:.25rem 0}</style></head><body>${html}</body></html>`);
    w.document.close();
    setTimeout(() => w.print(), 300);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        <Button variant="outline" size="sm" onClick={copyToClipboard}>
          <Copy className="mr-1 h-4 w-4" /> Copy to Clipboard
        </Button>
        <Button variant="outline" size="sm" onClick={downloadMarkdown}>
          <Download className="mr-1 h-4 w-4" /> Download .md
        </Button>
        <Button variant="outline" size="sm" onClick={downloadPDF}>
          <Download className="mr-1 h-4 w-4" /> Export PDF
        </Button>
      </div>

      {grouped.length === 0 && (
        <p className="text-muted-foreground text-sm py-8 text-center">No commits to show.</p>
      )}

      {grouped.map(([day, items]) => (
        <div key={day}>
          <h3 className="text-sm font-semibold text-foreground mb-1">{day}</h3>
          <ul className="space-y-0.5 ml-4 list-disc text-sm text-muted-foreground">
            {items.map((c) => (
              <li key={c.sha}>
                {c.message.split("\n")[0]}{" "}
                <span className="text-xs opacity-60">({c.repo})</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
