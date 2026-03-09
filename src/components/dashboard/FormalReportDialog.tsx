import { useState, useEffect } from "react";
import { NormalizedCommit } from "@/types/commit";
import { getRepositories, RepoConfig } from "@/config";
import { fetchAllCommits } from "@/services/githubService";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { printFormalReport } from "@/utils/formalReport";
import { FileText, CalendarIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import dayjs from "dayjs";

interface Props {
  commits: NormalizedCommit[];
  open: boolean;
  onClose: () => void;
}

export function FormalReportDialog({ commits: currentCommits, open, onClose }: Props) {
  const [institution, setInstitution] = useState("");
  const [department, setDepartment] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [supervisorName, setSupervisorName] = useState("");
  const [title, setTitle] = useState("LAPORAN AKTIVITAS PENGEMBANGAN PERANGKAT LUNAK");

  // Period selection
  const [periodType, setPeriodType] = useState<"current" | "custom">("current");
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);

  // Custom-fetched commits
  const [customCommits, setCustomCommits] = useState<NormalizedCommit[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch commits for custom period
  useEffect(() => {
    if (periodType !== "custom" || !dateFrom || !dateTo) {
      setCustomCommits([]);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const repos = getRepositories();
        const since = dayjs(dateFrom).startOf("day").toISOString();
        const until = dayjs(dateTo).endOf("day").toISOString();
        const data = await fetchAllCommits(repos, since, until);
        setCustomCommits(data);
      } catch {
        setCustomCommits([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [periodType, dateFrom, dateTo]);

  const activeCommits = periodType === "custom" ? customCommits : currentCommits;

  const handleGenerate = () => {
    printFormalReport(activeCommits, {
      title: title || undefined,
      institution: institution || undefined,
      department: department || undefined,
      authorName: authorName || undefined,
      supervisorName: supervisorName || undefined,
      periodFrom: periodType === "custom" ? dateFrom : undefined,
      periodTo: periodType === "custom" ? dateTo : undefined,
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <FileText className="h-5 w-5" /> Generate Laporan Formal
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          {/* Periode */}
          <div>
            <Label className="text-xs font-semibold">Periode Laporan</Label>
            <Select value={periodType} onValueChange={(v) => setPeriodType(v as "current" | "custom")}>
              <SelectTrigger className="h-8 text-sm bg-background mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current">Gunakan filter aktif ({currentCommits.length} commit)</SelectItem>
                <SelectItem value="custom">Pilih periode sendiri</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {periodType === "custom" && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Dari Tanggal</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full h-8 text-xs justify-start font-normal mt-1", !dateFrom && "text-muted-foreground")}>
                      <CalendarIcon className="mr-1 h-3 w-3" />
                      {dateFrom ? format(dateFrom, "dd MMM yyyy", { locale: idLocale }) : "Pilih tanggal"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={dateFrom} onSelect={setDateFrom} initialFocus className={cn("p-3 pointer-events-auto")} />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label className="text-xs">Sampai Tanggal</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full h-8 text-xs justify-start font-normal mt-1", !dateTo && "text-muted-foreground")}>
                      <CalendarIcon className="mr-1 h-3 w-3" />
                      {dateTo ? format(dateTo, "dd MMM yyyy", { locale: idLocale }) : "Pilih tanggal"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={dateTo} onSelect={setDateTo} initialFocus className={cn("p-3 pointer-events-auto")} />
                  </PopoverContent>
                </Popover>
              </div>
              {loading && (
                <div className="col-span-2 flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader2 className="h-3 w-3 animate-spin" /> Mengambil data commit...
                </div>
              )}
              {!loading && dateFrom && dateTo && (
                <p className="col-span-2 text-xs text-muted-foreground">
                  Ditemukan <strong>{customCommits.length}</strong> commit pada periode ini
                </p>
              )}
            </div>
          )}

          <div className="border-t border-border pt-3">
            <Label className="text-xs font-semibold">Detail Laporan</Label>
          </div>

          <div>
            <Label className="text-xs">Judul Laporan</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} className="h-8 text-sm bg-background" />
          </div>
          <div>
            <Label className="text-xs">Nama Instansi / Perusahaan</Label>
            <Input value={institution} onChange={(e) => setInstitution(e.target.value)} placeholder="PT. Contoh Indonesia" className="h-8 text-sm bg-background" />
          </div>
          <div>
            <Label className="text-xs">Divisi / Departemen</Label>
            <Input value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="Divisi Teknologi Informasi" className="h-8 text-sm bg-background" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Nama Pembuat</Label>
              <Input value={authorName} onChange={(e) => setAuthorName(e.target.value)} placeholder="Nama lengkap" className="h-8 text-sm bg-background" />
            </div>
            <div>
              <Label className="text-xs">Nama Atasan</Label>
              <Input value={supervisorName} onChange={(e) => setSupervisorName(e.target.value)} placeholder="Nama atasan" className="h-8 text-sm bg-background" />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onClose}>Batal</Button>
          <Button size="sm" onClick={handleGenerate} disabled={loading || activeCommits.length === 0}>
            <FileText className="mr-1 h-4 w-4" /> Generate & Cetak ({activeCommits.length} commit)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
