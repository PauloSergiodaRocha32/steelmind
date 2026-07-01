import { NextResponse } from "next/server";
import { syncGestioData } from "@/providers/gestio/sync";
import { writeFileSync, mkdirSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { requirePermission, isAuthError } from "@/lib/auth/api-guard";

export async function POST() {
  const auth = await requirePermission("gestio:sync");
  if (isAuthError(auth)) return auth;

  try {
    const snapshot = await syncGestioData();
    const dataDir = resolve(process.cwd(), "data/gestio");

    if (!existsSync(dataDir)) {
      mkdirSync(dataDir, { recursive: true });
    }

    writeFileSync(
      resolve(dataDir, "catalog.json"),
      JSON.stringify(snapshot, null, 2),
    );
    writeFileSync(
      resolve(dataDir, "manifest.json"),
      JSON.stringify(
        {
          syncedAt: snapshot.syncedAt,
          stats: snapshot.stats,
          filiais: snapshot.filiais.map((f) => ({
            codigo: f.codigoDaFilial,
            nome: f.descricaoDaFilial,
          })),
        },
        null,
        2,
      ),
    );

    return NextResponse.json({ data: snapshot.stats });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Sync failed";
    return NextResponse.json({ error: { message } }, { status: 500 });
  }
}
