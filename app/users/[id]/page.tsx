import UserProfile from '@/components/UserProfile';

export const dynamicParams = true;
export const revalidate = 0;

export async function generateStaticParams() {
  return [];
}

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <UserProfile id={id} />;
}
