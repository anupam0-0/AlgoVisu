// app/page.tsx
"use client"

import Link from "next/link"
import { useEffect, useMemo, useRef, useState } from "react"
import {
  ArrowRight,
  BookOpen,
  Code,
  Users,
  Zap,
  Github,
  Linkedin,
  Mail,
  Twitter,
} from "lucide-react"

// -----------------------------
// Minimal in-file UI primitives
// -----------------------------
type ButtonProps = {
  children: React.ReactNode
  href?: string
  onClick?: () => void
  variant?: "solid" | "outline"
  size?: "sm" | "md" | "lg"
  className?: string
}
function Button({
  children,
  href,
  onClick,
  variant = "solid",
  size = "md",
  className = "",
}: {
  children: React.ReactNode
  href?: string
  onClick?: () => void
  variant?: "solid" | "outline"
  size?: "sm" | "md" | "lg"
  className?: string
}) {
  const sizes =
    size === "lg"
      ? "px-6 py-3 text-base rounded-xl"
      : size === "sm"
        ? "px-3 py-1.5 text-sm rounded-lg"
        : "px-4 py-2 text-sm rounded-lg"

  const base = "inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 select-none"

  const styles =
    variant === "outline"
      ? "border border-black/20 bg-white hover:bg-black/5 text-black"
      : "bg-orange-300/70 hover:bg-orange-300 text-black border border-orange-300 shadow-sm"

  const Comp: any = href ? Link : "button"

  return (
    <Comp
      href={href}
      onClick={onClick}
      className={`${base} ${sizes} ${styles} ${className}`}
    >
      {children}
    </Comp>
  )
}

function Badge({
  children,
  variant = "outline",
  className = "",
}: {
  children: React.ReactNode
  variant?: "outline" | "solid" | "secondary"
  className?: string
}) {
  const styles =
    variant === "solid"
      ? "bg-black text-white"
      : variant === "secondary"
        ? "bg-orange-200 text-black border border-orange-300/60"
        : "border border-black/10 text-black"
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${styles} ${className}`}
    >
      {children}
    </span>
  )
}

function Card({
  children,
  className = "",
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={`rounded-2xl border border-black/10 bg-white/70 backdrop-blur-sm shadow-sm ${className}`}
    >
      {children}
    </div>
  )
}
function CardHeader({
  children,
  className = "",
}: {
  children: React.ReactNode
  className?: string
}) {
  return <div className={`p-5 ${className}`}>{children}</div>
}
function CardTitle({
  children,
  className = "",
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <h3 className={`text-lg font-semibold tracking-tight ${className}`}>
      {children}
    </h3>
  )
}
function CardDescription({
  children,
  className = "",
}: {
  children: React.ReactNode
  className?: string
}) {
  return <p className={`text-sm text-black/60 ${className}`}>{children}</p>
}
function CardContent({
  children,
  className = "",
}: {
  children: React.ReactNode
  className?: string
}) {
  return <div className={`p-5 pt-0 ${className}`}>{children}</div>
}

// AuroraText-like accent text (kept minimal, original theme mostly)
function AuroraText({ children }: { children: React.ReactNode }) {
  return (
    <span className="relative inline-block">
      <span className="relative z-10 bg-clip-text text-transparent bg-gradient-to-r from-black via-black/80 to-black">
        {children}
      </span>
      <span className="pointer-events-none absolute inset-0 -z-0 blur-2xl opacity-20 bg-gradient-to-r from-orange-400 via-orange-300 to-orange-500" />
    </span>
  )
}

// -----------------------------
// Header & Footer (single file)
// -----------------------------
function Header() {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])
  return (
    <header
      className={`sticky top-0 z-50 transition-all ${scrolled ? "backdrop-blur-md bg-white/70 border-b border-black/10" : "bg-white/60"
        }`}
    >
      <div className="container mx-auto max-w-7xl px-4 py-4">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="group inline-flex items-baseline gap-2"
            aria-label="VTRACE home"
          >
            <span className="text-2xl md:text-3xl font-extrabold tracking-tight">
              VTRACE
            </span>
            <Badge variant="secondary" className="group-hover:scale-105 transition">
              DSA
            </Badge>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm">
            <Link className="hover:opacity-80" href="#features">
              Features
            </Link>
            <Link className="hover:opacity-80" href="#about">
              About
            </Link>
            <Link className="hover:opacity-80" href="#screenshots">
              Screenshots
            </Link>
            <Link className="hover:opacity-80" href="#learn">
              Learn
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <Button href="/visualizers" size="md">
              Start Visualizing <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}

function Footer() {
  return (
    <footer className="border-t border-black/10 bg-white/70">
      <div className="container mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <div className="text-xl font-bold mb-2">VTRACE</div>
            <p className="text-sm text-black/60">
              Visualization Tool for Real-Time Algorithm Exploration.
              Build intuition through clean, interactive visuals.
            </p>
          </div>
          <div>
            <div className="font-semibold mb-3">Product</div>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/visualizers" className="hover:opacity-80">
                  Visualizers
                </Link>
              </li>
              <li>
                <Link href="#features" className="hover:opacity-80">
                  Features
                </Link>
              </li>
              <li>
                <Link href="#screenshots" className="hover:opacity-80">
                  Gallery
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <div className="font-semibold mb-3">Resources</div>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#learn" className="hover:opacity-80">
                  Learn DSA
                </Link>
              </li>
              <li>
                <Link href="#about" className="hover:opacity-80">
                  About us
                </Link>
              </li>
              <li>
                <Link href="#cta" className="hover:opacity-80">
                  Get started
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <div className="font-semibold mb-3">Connect</div>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Github className="h-4 w-4" />
                <a className="hover:opacity-80" href="#" aria-label="GitHub">
                  GitHub
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Twitter className="h-4 w-4" />
                <a className="hover:opacity-80" href="#" aria-label="Twitter / X">
                  Twitter / X
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Linkedin className="h-4 w-4" />
                <a className="hover:opacity-80" href="#" aria-label="LinkedIn">
                  LinkedIn
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <a className="hover:opacity-80" href="mailto:hello@vtrace.app">
                  hello@vtrace.app
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-black/60">
          <p>© {new Date().getFullYear()} VTRACE. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="#" className="hover:opacity-80">
              Terms
            </Link>
            <Link href="#" className="hover:opacity-80">
              Privacy
            </Link>
            <Link href="#" className="hover:opacity-80">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

// -----------------------------
// Floating Bubbles (right side)
// -----------------------------
const DS_TEXT = [
  "Arrays",
  "Linked Lists",
  "Stacks",
  "Queues",
  "Binary Trees",
  "Heaps",
  "Graphs",
  "Trie",
  "Hash Map",
  "Union-Find",
]

type Bubble = {
  id: number
  label: string
  top: number // percentage inside container
  right: number // percentage from right
  size: number // px
  life: number // ms
}

function useBubbles(max = 4) {
  const [bubbles, setBubbles] = useState<Bubble[]>([])
  const nextId = useRef(1)

  const spawn = () => {
    setBubbles((curr) => {
      const arr = [...curr]
      // keep at most `max`
      while (arr.length >= max) arr.shift()
      const label = DS_TEXT[Math.floor(Math.random() * DS_TEXT.length)]
      const size = 60 + Math.round(Math.random() * 40) // 60-100
      const life = 4000 + Math.round(Math.random() * 3000)
      arr.push({
        id: nextId.current++,
        label,
        top: Math.round(Math.random() * 80), // 0-80%
        right: 0 + Math.round(Math.random() * 5), // stay near the right edge
        size,
        life,
      })
      return arr
    })
  }

  useEffect(() => {
    spawn()
    const t = setInterval(spawn, 1500)
    return () => clearInterval(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // auto-remove on life expiry
  useEffect(() => {
    const timers = bubbles.map((b) =>
      setTimeout(
        () => setBubbles((curr) => curr.filter((x) => x.id !== b.id)),
        b.life
      )
    )
    return () => timers.forEach(clearTimeout)
  }, [bubbles])

  return bubbles
}

function RightBubbles() {
  const bubbles = useBubbles(4)
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-y-0 right-0 w-[36%] hidden lg:block"
    >
      <div className="relative h-full">
        {bubbles.map((b) => (
          <div
            key={b.id}
            className="absolute select-none transition-opacity duration-500 ease-in-out"
            style={{
              top: `${b.top}%`,
              right: `${b.right}%`,
              width: b.size,
              height: b.size,
              animation: `floaty ${6 + (b.size % 4)}s ease-in-out infinite`,
            }}
          >
            <div className="relative w-full h-full">
              <div className="absolute inset-0 rounded-full bg-orange-200/80 blur-xl" />
              <div className="absolute inset-0 rounded-full border border-orange-300/60 bg-white/80 backdrop-blur-sm flex items-center justify-center text-xs font-medium text-black hover:opacity-80 pointer-events-auto transition-opacity">
                {b.label}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// -----------------------------
// Features with hover fade anim
// -----------------------------
type Feature = { icon: React.ReactNode; title: string; description: string }
function FeaturesGrid({ features }: { features: Feature[] }) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {features.map((f, i) => (
        <Card
          key={i}
          className="group relative overflow-hidden transition will-change-transform hover:shadow-md hover:-translate-y-0.5"
        >
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl border border-black/10 bg-white/80 flex items-center justify-center">
                {f.icon}
              </div>
              <CardTitle>{f.title}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription>{f.description}</CardDescription>
          </CardContent>

          {/* Hover fade in overlay */}
          <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute -inset-8 bg-gradient-to-br from-orange-200/60 to-transparent" />
          </div>
        </Card>
      ))}
    </div>
  )
}

// -----------------------------
// Page
// -----------------------------
export default function HomePage() {
  const features: Feature[] = useMemo(
    () => [
      {
        icon: <Code className="h-6 w-6" />,
        title: "Interactive Visualizations",
        description:
          "Step-by-step animations for arrays, linked lists, trees, graphs, and sorting algorithms.",
      },
      {
        icon: <Zap className="h-6 w-6" />,
        title: "Real-time Controls",
        description:
          "Play, pause, and step through execution. Adjust speed to learn at your pace.",
      },
      {
        icon: <BookOpen className="h-6 w-6" />,
        title: "Educational Content",
        description:
          "Clear notes, complexity breakdowns, and real-world use cases to cement understanding.",
      },
      {
        icon: <Users className="h-6 w-6" />,
        title: "Student-Friendly",
        description:
          "Built for learners, educators, and bootcamp students with approachable language.",
      },
    ],
    []
  )

  const dataStructures = ["Arrays", "Linked Lists", "Stacks", "Queues", "Binary Trees", "Graphs"]
  const algorithms = ["Bubble Sort", "Merge Sort", "Quick Sort", "BFS", "DFS", "Dijkstra's"]

  const screenshots = [
    {
      src: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1400&auto=format&fit=crop",
      caption: "Array Visualization",
    },
    {
      src: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?q=80&w=1400&auto=format&fit=crop",
      caption: "Graph Traversal",
    },
    {
      src: "https://images.unsplash.com/photo-1555949963-aa79dcee981d?q=80&w=1400&auto=format&fit=crop",
      caption: "Sorting Animation",
    },
  ]

  // Hover proximity fade around the "Why Choose" section
  const proximityRef = useRef<HTMLDivElement>(null)
  const [cursorStyle, setCursorStyle] = useState({ x: 0, y: 0, show: false })
  useEffect(() => {
    const el = proximityRef.current
    if (!el) return
    const rect = () => el.getBoundingClientRect()

    const onMove = (e: MouseEvent) => {
      const r = rect()
      setCursorStyle({
        x: e.clientX - r.left,
        y: e.clientY - r.top,
        show: true,
      })
    }
    const onLeave = () => setCursorStyle((s) => ({ ...s, show: false }))
    el.addEventListener("mousemove", onMove)
    el.addEventListener("mouseleave", onLeave)
    return () => {
      el.removeEventListener("mousemove", onMove)
      el.removeEventListener("mouseleave", onLeave)
    }
  }, [])

  return (
    <div className="min-h-screen flex flex-col text-black">
      {/* Header */}
      <Header />

      {/* Hero */}
      <main className="flex-grow">
        <section className="relative overflow-hidden">
          <div className="container mx-auto max-w-7xl px-4 pt-20 pb-16">
            <div className="text-center max-w-4xl mx-auto">
              <Badge variant="secondary" className="mb-4">
                Interactive Learning Tool
              </Badge>
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
                VTRACE — Visualization Tool for Real-Time{" "}
                <AuroraText>Algorithm</AuroraText> Exploration
              </h1>
              <p className="text-lg md:text-xl text-black/70 font-medium mb-8">
                Turn complex computer science concepts into clear, interactive animations.
                Perfect for students, educators, and anyone learning DSA.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button href="/visualizers" size="lg" className="justify-center">
                  Start Visualizing <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button href="#about" variant="outline" size="lg" className="justify-center">
                  Learn More
                </Button>
              </div>
            </div>
          </div>

          {/* soft orange wash like original but subtle */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-orange-200/60 to-transparent" />
        </section>

        {/* Why Choose + Floating bubbles on right (bg-orange-200 as requested) */}
        <section id="features" className="relative bg-orange-200">
          <div className="container mx-auto max-w-7xl px-4 py-20 relative">
            {/* Right-side floating bubbles */}
            <RightBubbles />

            <div
              ref={proximityRef}
              className="relative z-10 grid lg:grid-cols-[1fr,0.35fr] gap-10 items-start"
            >
              <div className="relative">
                {/* hover proximity spotlight */}
                <div
                  className="pointer-events-none absolute -inset-8 transition-opacity"
                  style={{
                    opacity: cursorStyle.show ? 1 : 0,
                    background: `radial-gradient(180px 180px at ${cursorStyle.x}px ${cursorStyle.y}px, rgba(255,255,255,0.65), transparent 70%)`,
                  }}
                />
                <div className="relative">
                  <h2 className="text-3xl md:text-4xl font-bold mb-3">
                    Why Choose Our DSA Visualizer?
                  </h2>
                  <p className="text-black/70 mb-10 max-w-2xl">
                    Our interactive approach makes complex algorithms easy to understand and
                    remember. Explore, tweak, and truly see how data structures transform.
                  </p>
                  <FeaturesGrid features={features} />
                </div>
              </div>
              {/* right column empty—occupied by bubbles visually */}
              <div className="hidden lg:block" />
            </div>
          </div>
        </section>

        {/* What You'll Learn (keep original vibe, not all orange) */}
        <section id="learn" className="py-16 px-4">
          <div className="container mx-auto max-w-7xl">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold mb-3">What You&apos;ll Learn</h2>
              <p className="text-black/70">
                Comprehensive coverage of fundamental computer science concepts
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-orange-300" />
                    Data Structures
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {dataStructures.map((ds) => (
                      <Badge key={ds} variant="outline">
                        {ds}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-orange-400" />
                    Algorithms
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {algorithms.map((algo) => (
                      <Badge key={algo} variant="outline">
                        {algo}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* About Us */}
        <section id="about" className="py-20 px-4 bg-orange-200">
          <div className="container mx-auto max-w-7xl">
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4">About Us</h2>
                <p className="text-black/70 leading-relaxed">
                  VTRACE is built by a small team of educators and engineers who believe
                  complex ideas should feel simple. We value clarity, accuracy, and a little bit
                  of fun. Our mission is to help learners build rock-solid intuition for how data
                  structures and algorithms behave through high-quality visuals.
                </p>
                <div className="mt-6 flex gap-3">
                  <Button href="/visualizers" size="md">
                    Try Visualizers
                  </Button>
                  <Button href="#features" size="md" variant="outline">
                    See Features
                  </Button>
                </div>
              </div>
              <div className="relative">
                <div className="absolute -inset-8 bg-orange-200/50 rounded-3xl blur-2xl" />
                <div className="relative rounded-2xl border border-black/10 bg-white p-6">
                  <ul className="space-y-3 text-sm">
                    <li>• Clean, student-friendly UI</li>
                    <li>• Step-by-step execution and speed controls</li>
                    <li>• Complexity breakdowns and real-world contexts</li>
                    <li>• Works great in classrooms and study groups</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Screenshots (avoid next/image config by using <img>) */}
        <section id="screenshots" className="py-20 px-4">
          <div className="container mx-auto max-w-7xl">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-3">Screenshots</h2>
              <p className="text-black/70">
                A quick peek at how visualizations look and feel.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {screenshots.map((s, i) => (
                <Card key={i} className="overflow-hidden group">
                  <div className="relative h-52">
                    <img
                      src={s.src}
                      alt={s.caption}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                    />
                  </div>
                  <div className="p-4">
                    <div className="text-sm text-black/70">{s.caption}</div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA — orange background, black text & buttons */}
        <section id="cta" className="py-20 px-4 bg-orange-200">
          <div className="container mx-auto max-w-7xl">
            <div className="rounded-2xl border border-black/10 bg-white/70 backdrop-blur-sm p-10 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Start Learning?
              </h2>
              <p className="text-black/70 text-lg mb-8 max-w-2xl mx-auto">
                Join thousands of students improving their understanding of data structures
                and algorithms with VTRACE.
              </p>
              <Button
                href="/visualizers"
                size="lg"
                className="bg-orange-300/70 hover:bg-orange-300 text-black border border-orange-300 shadow-sm transition-all"
              >
                Explore Visualizers <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />

      {/* Styled-JSX animations */}
      <style jsx global>{`
        @keyframes floaty {
          0% {
            transform: translateY(0px) translateX(0px);
            opacity: 0.85;
          }
          50% {
            transform: translateY(-12px) translateX(-6px);
            opacity: 1;
          }
          100% {
            transform: translateY(0px) translateX(0px);
            opacity: 0.9;
          }
        }
      `}</style>
    </div>
  )
}
