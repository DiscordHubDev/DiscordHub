import { getUser } from '@/lib/get-user';
import { redirect } from 'next/navigation';
import UserProfile from '@/components/UserProfile';

export default async function ProfilePage() {
  const user = await getUser();

  if (!user) {
    return redirect('/api/auth/signin/discord?callbackUrl=/profile');
  }

  // 獲取用戶收藏的伺服器和機器人
  return <UserProfile />;
}
