"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, Shield, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ROLE_LABELS, type UserRole } from "@/types/auth";

interface UserRow {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export function UsersAdminPanel() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
    name: "",
    role: "viewer" as UserRole,
  });

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/auth/users");
    if (res.status === 403) {
      setForbidden(true);
      setLoading(false);
      return;
    }
    const json = await res.json();
    if (res.ok) setUsers(json.data.users ?? []);
    setLoading(false);
  };

  useEffect(() => {
    void load();
  }, []);

  const createUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/auth/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setForm({ email: "", password: "", name: "", role: "viewer" });
      await load();
    }
  };

  if (loading) {
    return <div className="h-32 animate-pulse rounded-xl bg-muted/20" />;
  }

  if (forbidden) {
    return (
      <Card className="border-border/50 bg-card/40">
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          Apenas administradores podem gerenciar usuários.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-border/50 bg-card/40">
        <CardHeader className="flex flex-row items-center gap-2">
          <Users className="h-4 w-4" />
          <CardTitle className="text-base">Usuários cadastrados</CardTitle>
          <Badge variant="outline">{users.length}</Badge>
        </CardHeader>
        <CardContent className="space-y-2">
          {users.map((u) => (
            <div
              key={u.id}
              className="flex items-center justify-between rounded-lg border border-border/40 px-3 py-2 text-sm"
            >
              <div>
                <p className="font-medium">{u.name}</p>
                <p className="text-xs text-muted-foreground">{u.email}</p>
              </div>
              <Badge>{ROLE_LABELS[u.role]}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-border/50 bg-card/40">
        <CardHeader className="flex flex-row items-center gap-2">
          <Plus className="h-4 w-4" />
          <CardTitle className="text-base">Novo usuário</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={createUser} className="grid gap-3 sm:grid-cols-2">
            <Input
              placeholder="Nome"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
            />
            <Input
              type="email"
              placeholder="E-mail"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              required
            />
            <Input
              type="password"
              placeholder="Senha"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              required
            />
            <select
              value={form.role}
              onChange={(e) =>
                setForm((f) => ({ ...f, role: e.target.value as UserRole }))
              }
              className="h-9 rounded-md border border-input bg-background px-3 text-sm"
            >
              {(Object.keys(ROLE_LABELS) as UserRole[]).map((role) => (
                <option key={role} value={role}>
                  {ROLE_LABELS[role]}
                </option>
              ))}
            </select>
            <Button type="submit" className="sm:col-span-2">
              Criar usuário
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-border/50 bg-card/40">
        <CardHeader className="flex flex-row items-center gap-2">
          <Shield className="h-4 w-4" />
          <CardTitle className="text-base">Perfis de acesso</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm sm:grid-cols-2">
          {(Object.entries(ROLE_LABELS) as [UserRole, string][]).map(([role, label]) => (
            <div key={role} className="rounded-md border border-border/30 px-3 py-2">
              <p className="font-medium">{label}</p>
              <p className="text-xs text-muted-foreground">{role}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
