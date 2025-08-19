'use client';

import ServerFormPage from '@/components/server/server-form';
import { EditServerType } from '@/lib/prisma_type';

export default function ServerEditClient({
  server,
}: {
  server: EditServerType;
}) {
  return <ServerFormPage mode={'edit'} edit_server={server} />;
}
