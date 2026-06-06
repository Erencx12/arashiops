import { getContentItems } from "@/lib/queries";
import { ContentGrid } from "@/components/dashboard/ContentGrid";

export const metadata = { title: "Content Library" };

export default async function ContentPage() {
  const items = await getContentItems();
  return <ContentGrid items={items} />;
}
