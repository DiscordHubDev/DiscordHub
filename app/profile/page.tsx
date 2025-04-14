import { getUser } from '@/lib/get-user';
import { redirect } from 'next/navigation';
import UserProfile from '@/components/UserProfile';

export default async function ProfilePage() {
  const user = await getUser();

  if (!user) {
    return redirect('/api/auth/signin/discord?callbackUrl=/profile');
  }

  return <UserProfile />;
}
