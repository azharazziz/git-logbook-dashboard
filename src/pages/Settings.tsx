import { config } from "@/config";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function SettingsPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-xl font-bold text-foreground">Pengaturan</h1>
        </div>

        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Info className="h-4 w-4" /> Cara Mengubah Konfigurasi
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>
              Semua pengaturan disimpan di file <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono text-foreground">src/config.ts</code>.
              Edit file tersebut untuk mengubah konfigurasi.
            </p>

            <div className="space-y-3">
              <div>
                <p className="font-medium text-foreground mb-1">🔐 Login Credentials</p>
                <pre className="bg-muted p-3 rounded-md text-xs overflow-auto">
{`auth: {
  username: "${config.auth.username}",
  password: "******",
}`}
                </pre>
              </div>

              <div>
                <p className="font-medium text-foreground mb-1">🔑 GitHub Token</p>
                <p>Status: {config.githubToken ? "✅ Terkonfigurasi" : "⚠️ Belum diset (hanya bisa akses public repo)"}</p>
                <p className="text-xs mt-1">Dapatkan di: <a href="https://github.com/settings/tokens" target="_blank" rel="noreferrer" className="text-primary hover:underline">github.com/settings/tokens</a></p>
              </div>

              <div>
                <p className="font-medium text-foreground mb-1">📦 Repositories ({config.repositories.length})</p>
                <div className="bg-muted p-3 rounded-md space-y-1">
                  {config.repositories.map((r, i) => (
                    <div key={i} className="text-xs font-mono">
                      {r.owner}/{r.repo} — <span className="text-foreground">{r.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="font-medium text-foreground mb-1">📄 Data Laporan</p>
                <pre className="bg-muted p-3 rounded-md text-xs overflow-auto">
{`report: {
  institution: "${config.report.institution}",
  department: "${config.report.department}",
  authorName: "${config.report.authorName || "(belum diset)"}",
  supervisorName: "${config.report.supervisorName || "(belum diset)"}",
}`}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
