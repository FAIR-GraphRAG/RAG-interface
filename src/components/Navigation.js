'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Navigation() {
  const pathname = usePathname()

  // helper to see if the link is "active"
  const isActive = (href) =>
    href === '/' 
      ? pathname === href 
      : pathname.startsWith(href)

  const linkClass = (href) =>
    `px-3 py-2 rounded-md font-medium ${
      isActive(href)
        ? 'text-brand bg-blue-50'
        : 'text-gray-600 hover:text-brand'
    }`

  return (
    <nav className="bg-white shadow">
      <div className="max-w-4xl mx-auto py-4 flex items-center justify-between">
        <div className="flex space-x-2">
          <Link href="/" className={linkClass('/')}>
            Home
          </Link>
          <Link href="/concept" className={linkClass('/concept')}>
            How It Works
          </Link>
        </div>
        <div className="flex space-x-2">
          <Link href="/" className="text-md md:text-xl font-bold text-brand">
            FAIR GraphRAG
          </Link>
        </div>

        <div className="flex space-x-2">
          <Link href="/about" className={linkClass('/about')}>
            About
          </Link>
          <Link href="/contact" className={linkClass('/contact')}>
            Contact
          </Link>
        </div>
      </div>
    </nav>
  )
}
