'use client'

import React from 'react'
import Link from 'next/link'

export function Header() {
  return (
    <header className="bg-primary text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <svg
              className="h-8 w-8 text-accent"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
              />
            </svg>
            <span className="text-2xl font-serif font-bold">
              Financial Planning Hub
            </span>
          </Link>

          <nav className="hidden md:flex space-x-6">
            <Link
              href="/"
              className="hover:text-accent transition-colors"
            >
              Home
            </Link>
            <Link
              href="/calculators/investment-projection"
              className="hover:text-accent transition-colors"
            >
              Calculators
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}
