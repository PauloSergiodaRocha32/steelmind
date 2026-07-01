import { NextResponse } from "next/server";
import { applyGestioClassification } from "@/services/gestio/sync";

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      apply?: boolean;
    };
    const result = await applyGestioClassification(!body.apply);
    return NextResponse.json({ data: result });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Classification failed";
    return NextResponse.json({ error: { message } }, { status: 500 });
  }
}
