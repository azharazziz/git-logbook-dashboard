import { useState } from "react";
import { RepoConfig, getRepositories, saveRepositories, getGithubToken, saveGithubToken } from "@/config";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Save, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function SettingsPage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [repos, setRepos] = useState<RepoConfig[]>(() => getRepositories());
  const [token, setToken] = useState(() => getGithubToken());
  const [showToken, setShowToken] = useState(false);

  const addRepo = () => {
    setRepos([...repos, { name: "", owner: "", repo: "" }]);
  };

  const removeRepo = (i: number) => {
    setRepos(repos.filter((_, idx) => idx !== i));
  };

  const updateRepo = (i: number, field: keyof RepoConfig, value: string) => {
    const updated = [...repos];
    updated[i] = { ...updated[i], [field]: value };
    setRepos(updated);
  };

  const handleSave = () => {
    const valid = repos.filter((r) => r.name && r.owner && r.repo);
    saveRepositories(valid);
    saveGithubToken(token);
    toast({ title: "Tersimpan!", description: `${valid.length} repository berhasil disimpan.` });
  };

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
            <CardTitle className="text-base">GitHub Token</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-xs text-muted-foreground">
              Token opsional untuk meningkatkan rate limit API GitHub. Biarkan kosong jika tidak diperlukan.
            </p>
            <div className="flex gap-2">
              <Input
                type={showToken ? "text" : "password"}
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="ghp_xxxxxxxxxxxx"
                className="bg-background"
              />
              <Button variant="outline" size="icon" onClick={() => setShowToken(!showToken)}>
                {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Repositories</CardTitle>
            <Button variant="outline" size="sm" onClick={addRepo}>
              <Plus className="mr-1 h-4 w-4" /> Tambah
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {repos.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Belum ada repository. Klik "Tambah" untuk menambahkan.
              </p>
            )}
            {repos.map((r, i) => (
              <div key={i} className="border border-border rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">Repository #{i + 1}</span>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeRepo(i)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
                <div className="grid gap-2 sm:grid-cols-3">
                  <div>
                    <Label className="text-xs">Nama</Label>
                    <Input value={r.name} onChange={(e) => updateRepo(i, "name", e.target.value)} placeholder="My Project" className="h-8 text-sm bg-background" />
                  </div>
                  <div>
                    <Label className="text-xs">Owner</Label>
                    <Input value={r.owner} onChange={(e) => updateRepo(i, "owner", e.target.value)} placeholder="username" className="h-8 text-sm bg-background" />
                  </div>
                  <div>
                    <Label className="text-xs">Repo</Label>
                    <Input value={r.repo} onChange={(e) => updateRepo(i, "repo", e.target.value)} placeholder="repo-name" className="h-8 text-sm bg-background" />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Button onClick={handleSave} className="w-full">
          <Save className="mr-2 h-4 w-4" /> Simpan Pengaturan
        </Button>
      </div>
    </div>
  );
}
