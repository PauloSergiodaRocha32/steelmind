import { NextResponse } from "next/server";
import { getProjectBom, saveProjectBom } from "@/lib/persistence/store";
import type { BomItem } from "@/types/steelmind-store";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params;
  const bom = await getProjectBom(Number(id));
  return NextResponse.json({ data: bom });
}

export async function PUT(request: Request, { params }: RouteParams) {
  const { id } = await params;
  const body = (await request.json()) as {
    descricaoDoProjeto: string;
    items: BomItem[];
  };

  const bom = await saveProjectBom({
    codigoDoProjeto: Number(id),
    descricaoDoProjeto: body.descricaoDoProjeto,
    items: body.items,
    updatedAt: new Date().toISOString(),
  });

  return NextResponse.json({ data: bom });
}
