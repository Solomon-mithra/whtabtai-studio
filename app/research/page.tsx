import { listItems } from "@/lib/db/queries";
import { ResearchClient } from "./ResearchClient";

export default async function ResearchPage() {
  const initial = await listItems("all", "newest", null);
  return <ResearchClient initialItems={initial} />;
}
