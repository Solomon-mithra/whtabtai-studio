"use server";
import { revalidatePath } from "next/cache";
import {
  getItemDetail,
  listItems,
  setItemNotes,
  setItemStatus,
  type ItemFilter,
  type ItemSort,
  type ItemStatus,
} from "@/lib/db/queries";

export async function fetchItems(
  filter: ItemFilter,
  sort: ItemSort,
  search: string | null = null,
) {
  return listItems(filter, sort, null, search);
}

export async function fetchItemDetail(id: string) {
  return getItemDetail(id);
}

export async function updateStatus(id: string, status: ItemStatus) {
  await setItemStatus(id, status);
  revalidatePath("/research");
}

export async function updateNotes(id: string, notes: string) {
  await setItemNotes(id, notes);
}

export async function markPosted(id: string) {
  await setItemStatus(id, "posted");
  revalidatePath("/research");
}
