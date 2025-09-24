import { Code } from 'lucide-react'
import Link from 'next/link'
import React from 'react'
import { FaGithub } from 'react-icons/fa'

const Header = () => {
  return (
      <header className="border-y-4 border-black bg-card/50 backdrop-blur-sm sticky top-0 z-50">
              <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="h-8 w-8 bg-accent rounded-lg border-2 border-primary flex items-center justify-center">
                      <Code className="h-5 w-5 text-accent-foreground" />
                    </div>
                    <Link href="/" className="text-xl font-bold text-foreground cursor-pointer">VTRACE</Link>
                  </div>
                  <nav className="hidden md:flex items-center space-x-8">
                    <Link
                      href="/visualizers"
                      className="text-primary font-medium capitalize tracking-wide hover:text-foreground transition-colors"
                    >
                      Visualizers
                    </Link>
                    <Link
                      href="/about"
                      className="text-primary font-medium capitalize tracking-wide hover:text-foreground transition-colors"
                    >
                      About
                    </Link>
                    <Link
                      href="/"
                      className="text-primary scale-150 hover:text-foreground transition-colors"
                    >
                      <FaGithub />
                    </Link>
                  </nav>
                </div>
              </div>
            </header>
  )
}

export default Header