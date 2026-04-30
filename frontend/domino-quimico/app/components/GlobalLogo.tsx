"use client"

import Image from "next/image"
import { usePathname } from "next/navigation"

export default function GlobalLogo() {
  const pathname = usePathname()

  if (pathname === "/aluno") {
    return null
  }

  return (
    <div className="fixed top-6 left-5 z-50 sm:top-8 sm:left-6">
      <Image
        src="/etec_logo.png"
        alt="Logo ETEC"
        width={180}
        height={60}
        priority
        className="h-auto w-28 sm:w-32 md:w-36 lg:w-44"
      />
    </div>
  )
}
