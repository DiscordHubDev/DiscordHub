// lib/socialPlatforms.ts

import { FaFacebook, FaThreads, FaX } from "react-icons/fa6";

import {
  FaDiscord,
  FaTwitter,
  FaGithub,
  FaGlobe,
  FaYoutube,
  FaLinkedin,
  FaInstagram,
} from "react-icons/fa";

import { IconType } from "react-icons";

export const SOCIAL_PLATFORMS: Record<
  string,
  {
    name: string;
    icon: IconType;
    link?: (value: string) => string;
  }
> = {
  discord: {
    name: "Discord",
    icon: FaDiscord,
  },
  twitter: {
    name: "Twitter (X)",
    icon: FaX,
    link: (val) => `https://x.com/${val}`,
  },
  github: {
    name: "GitHub",
    icon: FaGithub,
    link: (val) => `https://github.com/${val}`,
  },
  website: {
    name: "Website",
    icon: FaGlobe,
    link: (val) => val,
  },
  instagram: {
    name: "Instagram",
    icon: FaInstagram,
    link: (val) => `https://instagram.com/${val}`,
  },
  youtube: {
    name: "YouTube",
    icon: FaYoutube,
    link: (val) => `https://youtube.com/@${val}`,
  },
  threads: {
    name: "Threads",
    icon: FaThreads,
    link: (val) => `https://www.threads.net/@${val.replace("@", "")}`,
  },
  facebook: {
    name: "Facebook",
    icon: FaFacebook,
    link: (val) => `https://www.facebook.com/${val}`,
  },
};
