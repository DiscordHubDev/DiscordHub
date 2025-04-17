'use client';

import ServerFormPage from '@/components/server/server-form';
import { ServerType } from '@/lib/prisma_type';

export default function ServerEditClient({ server }: { server: ServerType }) {
  return <ServerFormPage mode={'edit'} edit_server={server} />;
}
