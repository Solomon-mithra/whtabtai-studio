"use server";
import { revalidatePath } from "next/cache";
import { runRefresh } from "@/lib/research/refresh";
import type { RefreshSummary } from "@/lib/research/types";
import {
  addSource as addSourceDb,
  deleteSource as deleteSourceDb,
  setSourceEnabled as setSourceEnabledDb,
  renameSource as renameSourceDb,
  type SourceKind,
} from "@/lib/db/queries";

export async function refreshAll(): Promise<RefreshSummary> {
  const summary = await runRefresh();
  revalidatePath("/sources");
  revalidatePath("/research");
  return summary;
}

export async function addSourceAction(kind: SourceKind, url: string, name: string) {
  const id = await addSourceDb(kind, url, name);
  revalidatePath("/sources");
  return id;
}

export async function deleteSourceAction(id: string) {
  await deleteSourceDb(id);
  revalidatePath("/sources");
}

export async function setEnabledAction(id: string, enabled: boolean) {
  await setSourceEnabledDb(id, enabled);
  revalidatePath("/sources");
}

export async function renameAction(id: string, name: string) {
  await renameSourceDb(id, name);
  revalidatePath("/sources");
}
