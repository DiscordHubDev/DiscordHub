'use client';

import { useEffect, useState } from 'react';

export function AvatarFallbackClient({
  name,
  defaultChar = '?',
}: {
  name?: string;
  defaultChar?: string;
}) {
  const [initial, setInitial] = useState(defaultChar);

  useEffect(() => {
    const char = name?.charAt(0) ?? defaultChar;
    setInitial(char.toUpperCase());
  }, [name, defaultChar]);

  return <>{initial}</>;
}
