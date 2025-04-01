"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="md:hidden">
      <Button variant="ghost" className="text-white" size="icon" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </Button>

      {isOpen && (
        <div className="absolute top-16 left-0 right-0 z-50 bg-[#2b2d31] border-b border-[#1e1f22] shadow-lg">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Button variant="ghost" className="w-full justify-start text-white hover:bg-[#36393f]">
              首頁
            </Button>
            <Button variant="ghost" className="w-full justify-start text-white hover:bg-[#36393f]">
              熱門伺服器
            </Button>
            <Button variant="ghost" className="w-full justify-start text-white hover:bg-[#36393f]">
              新增伺服器
            </Button>
            <Button variant="ghost" className="w-full justify-start text-white hover:bg-[#36393f]">
              關於我們
            </Button>
            <Button className="w-full bg-[#5865f2] hover:bg-[#4752c4] text-white mt-4">登入</Button>
          </div>
        </div>
      )}
    </div>
  )
}

