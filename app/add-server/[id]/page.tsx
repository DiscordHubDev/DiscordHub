import ServerFormPage from "@/components/server/server-form";
import { getGuildDetails } from "@/lib/get-user-guild";
import { notFound } from "next/navigation";

export default async function AddServerFormPage({
  params,
}: {
  params: { id: string };
}) {
  const server = await getGuildDetails(params.id);

  if (!server) return notFound();

  return <ServerFormPage server={server} />;
}
