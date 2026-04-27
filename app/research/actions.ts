"use server";
import { listItems, type ItemFilter, type ItemSort } from "@/lib/db/queries";

export async function fetchItems(filter: ItemFilter, sort: ItemSort) {
  return listItems(filter, sort, null);
}
