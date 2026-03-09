import { useState } from "react";
import { NormalizedCommit } from "@/types/commit";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { printFormalReport } from "@/utils/formalReport";
import { FileText } from "lucide-react";

interface Props {
  commits: NormalizedCommit[];
  open: boolean;
  onClose: () => void;
}

export function FormalReportDialog({ commits, open, onClose }: Props) {
  const [institution, setInstitution] = useState("");
  const [department, setDepartment] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [supervisorName, setSupervisorName] = useState("");
  const [title, setTitle] = useState("LAPORAN AKTIVITAS PENGEMBANGAN PERANGKAT LUNAK");

  const handleGenerate = () => {
    printFormalReport(commits, {
      title: title || undefined,
      institution: institution || undefined,
      department: department || undefined,
      authorName: authorName || undefined,
      supervisorName: supervisorName || undefined,
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <FileText className="h-5 w-5" /> Generate Laporan Formal
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
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
          <Button size="sm" onClick={handleGenerate}>
            <FileText className="mr-1 h-4 w-4" /> Generate & Cetak
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
