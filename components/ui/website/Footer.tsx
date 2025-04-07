'use client';

import Link from 'next/link';

export default function Footer({ className = '' }: { className?: string }) {
    return (
        <footer
            className={`bg-[#2b2d31] py-8 border-t border-[#1e1f22] ${className}`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* 四欄內容 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
                    {/* Logo/簡介 */}
                    <div className="col-span-1">
                        <h3 className="text-lg font-semibold mb-4 text-white">
                            DiscordHubs
                        </h3>
                        <p className="text-gray-400 text-sm">
                            最佳的 Discord
                            伺服器和機器人列表平台，幫助您發現和加入有趣的社群，為伺服器增添功能。
                        </p>
                    </div>

                    {/* 導覽連結 */}
                    <div>
                        <h4 className="font-medium mb-4 text-white">連結</h4>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li>
                                <Link href="/" className="hover:text-white">
                                    伺服器列表
                                </Link>
                            </li>
                            <li>
                                <Link href="/bots" className="hover:text-white">
                                    機器人列表
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/add-server"
                                    className="hover:text-white"
                                >
                                    新增伺服器
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/add-bot"
                                    className="hover:text-white"
                                >
                                    新增機器人
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* 資源連結 */}
                    <div>
                        <h4 className="font-medium mb-4 text-white">資源</h4>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li>
                                <a href="#" className="hover:text-white">
                                    Discord 官方
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-white">
                                    開發者文檔
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-white">
                                    機器人指南
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-white">
                                    常見問題
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* 法律 */}
                    <div>
                        <h4 className="font-medium mb-4 text-white">法律</h4>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li>
                                <a href="#" className="hover:text-white">
                                    服務條款
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-white">
                                    隱私政策
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-white">
                                    Cookie 政策
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-white">
                                    DMCA
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* 底部資訊 */}
                <div className="mt-8 pt-8 border-t border-[#1e1f22] flex flex-col md:flex-row justify-between items-center">
                    <p className="text-gray-400 text-sm text-center md:text-left">
                        © 2025 DiscordHubs. 保留所有權利。
                    </p>
                    <div className="flex space-x-4 mt-4 md:mt-0">
                        {/* Icons */}
                        <SocialIcon href="#" title="Twitter">
                            <TwitterIcon />
                        </SocialIcon>
                        <SocialIcon href="#" title="GitHub">
                            <GitHubIcon />
                        </SocialIcon>
                        <SocialIcon href="#" title="Instagram">
                            <InstagramIcon />
                        </SocialIcon>
                    </div>
                </div>
            </div>
        </footer>
    );
}

function SocialIcon({
    href,
    title,
    children,
}: {
    href: string;
    title: string;
    children: React.ReactNode;
}) {
    return (
        <a
            href={href}
            className="text-gray-400 hover:text-white"
            aria-label={title}
        >
            {children}
        </a>
    );
}

function TwitterIcon() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-twitter"
        >
            <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
        </svg>
    );
}

function GitHubIcon() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-github"
        >
            <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
            <path d="M9 18c-4.51 2-5-2-7-2" />
        </svg>
    );
}

function InstagramIcon() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-instagram"
        >
            <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
            <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
        </svg>
    );
}
