// lib/socialPlatforms.ts

import { FaFacebook, FaThreads, FaX } from 'react-icons/fa6';
import {
  FaDiscord,
  FaGithub,
  FaGlobe,
  FaYoutube,
  FaInstagram,
} from 'react-icons/fa';
import { IconType } from 'react-icons';

const isUrl = (val: string): boolean => {
  try {
    const url = new URL(val);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

export const SOCIAL_PLATFORMS: Record<
  string,
  {
    name: string;
    icon: IconType;
    link?: (value: string) => string;
  }
> = {
  discord: {
    name: 'Discord',
    icon: FaDiscord,
    link: val => (isUrl(val) ? val : `https://discord.com/users/${val}`),
  },
  twitter: {
    name: 'Twitter (X)',
    icon: FaX,
    link: val => (isUrl(val) ? val : `https://x.com/${val}`),
  },
  github: {
    name: 'GitHub',
    icon: FaGithub,
    link: val => (isUrl(val) ? val : `https://github.com/${val}`),
  },
  website: {
    name: 'Website',
    icon: FaGlobe,
    link: val => (isUrl(val) ? val : val),
  },
  instagram: {
    name: 'Instagram',
    icon: FaInstagram,
    link: val => (isUrl(val) ? val : `https://instagram.com/${val}`),
  },
  youtube: {
    name: 'YouTube',
    icon: FaYoutube,
    link: val => (isUrl(val) ? val : `https://youtube.com/@${val}`),
  },
  threads: {
    name: 'Threads',
    icon: FaThreads,
    link: val =>
      isUrl(val) ? val : `https://www.threads.net/@${val.replace('@', '')}`,
  },
  facebook: {
    name: 'Facebook',
    icon: FaFacebook,
    link: val => (isUrl(val) ? val : `https://www.facebook.com/${val}`),
  },
};
