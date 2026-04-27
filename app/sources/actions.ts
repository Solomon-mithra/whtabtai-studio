"use server";
import { revalidatePath } from "next/cache";
import { runRefresh } from "@/lib/research/refresh";
import type { RefreshSummary } from "@/lib/research/types";

export async function refreshAll(): Promise<RefreshSummary> {
  const summary = await runRefresh();
  revalidatePath("/sources");
  revalidatePath("/research");
  return summary;
}
