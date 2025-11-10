// app/page.tsx
"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
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
  Puzzle,
  ArrowRightIcon,
} from "lucide-react";
import Header from "@/components/header";
import { AnimatedShinyText } from "@/components/ui/animated-shiny-text";
import { AuroraText } from "@/components/ui/aurora-text";
import { Highlighter } from "@/components/ui/highlighter";
import { RainbowButton } from "@/components/ui/rainbow-button";
import star from "@/lib/assets/star.png";
import Image from "next/image";
import illusInteract from "@/lib/assets/illus-interactive.png"
import illusControl from "@/lib/assets/illus-controls.png"
import illusStudent from "@/lib/assets/illus-student.png"

// -----------------------------
// Minimal in-file UI primitives
// -----------------------------
type ButtonProps = {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: "solid" | "outline";
  size?: "sm" | "md" | "lg";
  className?: string;
};
function Button({
  children,
  href,
  onClick,
  variant = "solid",
  size = "md",
  className = "",
}: {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: "solid" | "outline";
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizes =
    size === "lg"
      ? "px-6 py-3 text-base rounded-xl"
      : size === "sm"
      ? "px-3 py-1.5 text-sm rounded-lg"
      : "px-4 py-2 text-sm rounded-lg";

  const base =
    "inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 select-none";

  const styles =
    variant === "outline"
      ? "border border-black/20 bg-white hover:bg-black/5 text-black"
      : "bg-orange-300/70 hover:bg-orange-300 text-black border border-orange-300 shadow-sm";

  const Comp: any = href ? Link : "button";

  return (
    <Comp
      href={href}
      onClick={onClick}
      className={`${base} ${sizes} ${styles} ${className}`}
    >
      {children}
    </Comp>
  );
}



function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-black/10 bg-white/70 backdrop-blur-sm shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}
function CardHeader({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`p-5 ${className}`}>{children}</div>;
}
function CardTitle({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h3 className={`text-lg font-semibold tracking-tight ${className}`}>
      {children}
    </h3>
  );
}
function CardDescription({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <p className={`text-sm text-black/60 ${className}`}>{children}</p>;
}
function CardContent({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`p-5 pt-0 ${className}`}>{children}</div>;
}

// -----------------------------
// Header & Footer (single file)
// -----------------------------

function Footer() {
  return (
    <footer className="border-t border-black/10 bg-orange-50 ">
      <div className="container mx-auto max-w-[85rem] px-4 py-10">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <div className="text-xl font-bold mb-2">VTRACE</div>
            <p className="text-sm  text-black font-medium">
              Visualization Tool for Real-Time Algorithm Exploration. Build
              intuition through clean, interactive visuals.
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
                <a
                  className="hover:opacity-80"
                  href="#"
                  aria-label="Twitter / X"
                >
                  Twitter / X
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Linkedin className="h-4 w-4" />
                <a className="hover:opacity-80" href="#" aria-label="LinkedIn">
                  LinkedIn
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="w-full h-0.5 mt-20 my-8 bg-black rounded"></div>

        <div className="flex flex-col md:flex-row -my-2 items-center justify-between gap-4 text-xs text-black/60">
          <p>© {new Date().getFullYear()} VTRACE. Open source project.</p>
        </div>
      </div>
    </footer>
  );
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
];

type Bubble = {
  id: number;
  label: string;
  top: number; // percentage inside container
  right: number; // percentage from right
  size: number; // px
  life: number; // ms
};

function useBubbles(max = 4) {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const nextId = useRef(1);

  const spawn = () => {
    setBubbles((curr) => {
      const arr = [...curr];
      // keep at most `max`
      while (arr.length >= max) arr.shift();
      const label = DS_TEXT[Math.floor(Math.random() * DS_TEXT.length)];
      const size = 60 + Math.round(Math.random() * 40); // 60-100
      const life = 4000 + Math.round(Math.random() * 3000);
      arr.push({
        id: nextId.current++,
        label,
        top: Math.round(Math.random() * 80), // 0-80%
        right: 0 + Math.round(Math.random() * 5), // stay near the right edge
        size,
        life,
      });
      return arr;
    });
  };

  useEffect(() => {
    spawn();
    const t = setInterval(spawn, 1500);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // auto-remove on life expiry
  useEffect(() => {
    const timers = bubbles.map((b) =>
      setTimeout(
        () => setBubbles((curr) => curr.filter((x) => x.id !== b.id)),
        b.life
      )
    );
    return () => timers.forEach(clearTimeout);
  }, [bubbles]);

  return bubbles;
}

function RightBubbles() {
  const bubbles = useBubbles(4);
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
  );
}

// -----------------------------
// Features with hover fade anim
// -----------------------------
type Feature = { icon: React.ReactNode; title: string; description: string };
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
  );
}

// -----------------------------
// Page
// -----------------------------
export default function HomePage() {
  const dataStructures = [
    "Arrays",
    "Linked Lists",
    "Stacks",
    "Queues",
    "Binary Trees",
    "Graphs",
  ];
  const algorithms = [
    "Bubble Sort",
    "Merge Sort",
    "Quick Sort",
    "BFS/DFS",
    "Dijkstra's",
    "Heap Sort",
    "Kruskal's",
    "Prim's",
  ];

  const applications = [
    "Social Network Analyzer",
    "Navigation System Analyzer",
    "MST Clustering Visualizer",
    "Prefix Search Visualizer",
    "Print Job Queue Visualizer",
    "E-Commerce Ranking",
    "Real-Time Leaderboards",
  ];

  const features = [
    {
      img: illusInteract,
      title: "Interactive Visualizations",
      description:
        "Step-by-step animations for arrays, linked lists, trees, graphs, and sorting algorithms.",
    },
    {
      img: illusControl,
      title: "Real-time Controls",
      description:
        "Play, pause, and step through execution. Adjust speed to learn at your pace.",
    },
    {
      img: illusStudent,
      title: "Student-Friendly",
      description:
        "Built for learners, educators, and bootcamp students with approachable language.",
    },
  ];

  // Hover proximity fade around the "Why Choose" section
  const proximityRef = useRef<HTMLDivElement>(null);
  const [cursorStyle, setCursorStyle] = useState({ x: 0, y: 0, show: false });
  useEffect(() => {
    const el = proximityRef.current;
    if (!el) return;
    const rect = () => el.getBoundingClientRect();

    const onMove = (e: MouseEvent) => {
      const r = rect();
      setCursorStyle({
        x: e.clientX - r.left,
        y: e.clientY - r.top,
        show: true,
      });
    };
    const onLeave = () => setCursorStyle((s) => ({ ...s, show: false }));
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col text-black">
      {/* Header */}
      <Header />

      {/* Hero */}
      <main className="flex-grow">
        <section className="relative overflow-hidden h-[calc(100vh-6rem)] w-full">
          <div className="container mx-auto max-w-7xl px-4 pt-20 pb-16">
            <div className="text-center max-w-4xl mx-auto px-4 ">
              <div className="z-10 flex items-center justify-center">
                <div
                  className={
                    "group rounded-full border border-black/5 bg-green-100 text-base text-white transition-all ease-in hover:cursor-pointer hover:bg-green-50 dark:border-white/5 dark:bg-neutral-900 dark:hover:bg-neutral-800"
                  }
                >
                  <AnimatedShinyText className="inline-flex items-center justify-center px-4 py-1 transition ease-out hover:text-neutral-600 hover:duration-300 hover:dark:text-neutral-400">
                    <span>✨ Interactive Learning Tool</span>
                    <ArrowRightIcon className="ml-1 size-3 transition-transform duration-300 ease-in-out group-hover:translate-x-0.5" />
                  </AnimatedShinyText>
                </div>
              </div>

              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight my-8 leading-10">
                VTRACE — Visualization Tool for Real-Time{" "}
                <AuroraText>Algorithm</AuroraText> Exploration
              </h1>
              <p className="text-lg md:text-xl text-black/70 font-medium my-8 ">
                Turn{" "}
                <Highlighter action="underline" color="#FF9800">
                  complex
                </Highlighter>{" "}
                computer science algorithms into clear,{" "}
                <Highlighter action="highlight" color="#87CEFA">
                  {" "}
                  interactive animations{" "}
                </Highlighter>
                . Perfect for students, educators, and anyone learning{" "}
                <Highlighter
                  action="underline"
                  animationDuration={2000}
                  color="#39AF88"
                >
                  {" "}
                  Data Structures and Algorithms{" "}
                </Highlighter>
                .
              </p>
              <div className="flex flex-col mt-12 sm:flex-row gap-4 justify-center">
                {/* <Button
                  href="/visualizers"
                  className="justify-center border-2 border-black"
                >
                  Start Visualizing <ArrowRight className="ml-2 h-4 w-4" />
                </Button> */}

                <Link
                  href="/visualizers"
                  className="relative justify-center border-2 border-black px-6 py-2 rounded-2xl bg-orange-500 font-medium"
                >
                  <p className="inline-flex items-center relative top-0.5  ">
                    Start Visualizing <ArrowRight className="ml-2 h-4 w-4" />
                  </p>
                  <div className="absolute top-1.5 left-1.5 bg-black w-full h-full rounded-2xl -z-10"></div>
                </Link>

                <RainbowButton
                  variant="outline"
                  size="lg"
                  className="text-primary text-base w-44 h-12 font-medium border-2 border-black"
                >
                  {" "}
                  Learn More
                  <div className="absolute top-1.5 left-1.5 bg-black w-full h-full rounded-2xl -z-10"></div>
                </RainbowButton>
              </div>
            </div>
          </div>
        </section>

        {/* featured */}
        <section className="relative flex flex-col gap-8 h-screen w-full bg-green-300 px-4 md:px-12 xl:px-24 py-12 xl:py-24">
          <Image
            src={star}
            alt="star"
            height={50}
            width={50}
            className="absolute top-44 right-10"
          />
          <h2 className="text-lg md:text-4xl xl:text-6xl font-bold  text-center">
            Goodbye to boring methods of{" "}
            <span className="relative">
              learning
              <div className="absolute -top-5 -right-6 text-base rotate-12">
                Z
              </div>
              <div className="absolute -top-1 -right-4 text-sm rotate-6">Z</div>
              <div className="absolute top-3 -right-2 text-xs rotate-">Z</div>
            </span>
          </h2>
          <p className="mt-2 font-medium text-center text-lg max-w-5xl mx-auto">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Quos maxime
            corrupti repudiandae molestiae placeat quibusdam esse autem
            veritatis veniam eius.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-20 mt-12 max-w-7xl mx-auto">
            {features.map((item, i) => (
              <NeuCard
                key={i}
                img={item.img}
                title={item.title}
                description={item.description}
              />
            ))}
          </div>
        </section>

        {/* what you will learn */}
        <section className="relative flex flex-col gap-8 h-screen w-full bg-orange-300 px-4 md:px-12 xl:px-24 py-12 xl:py-24">
          <Image
            src={star}
            alt="star"
            height={100}
            width={100}
            className="absolute top-5 left-10"
          />
          <h2 className="text-lg md:text-4xl xl:text-6xl font-bold  text-center">
            What you'll learn
          </h2>
          <p className="mt-2 font-medium text-center text-lg max-w-5xl mx-auto">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Quos maxime
            corrupti repudiandae molestiae placeat quibusdam esse autem
            veritatis veniam eius.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-20 mt-12 max-w-7xl mx-auto">
            <NeuCard2 title={"Data Structure"} list={dataStructures} />
            <NeuCard2 title={"Algorithms"} list={algorithms} />
            <NeuCard2 title={"Application"} list={applications} />
          </div>
        </section>

        {/* <section className="relative flex flex-col gap-8 h-screen w-full bg-purple-300 px-4 md:px-12 xl:px-24 py-12 xl:py-24"></section> */}
      </main>

      <div className="bg-red-400 py-20 flex justify-center">
        {/* Footer */}
        <div className="relative">
          <div className="border-4 border-black px-4 bg-orange-50 relative z-10">
            <Footer />
          </div>
          <div className="absolute top-2 left-2 h-full w-full bg-black"></div>
        </div>
      </div>
    </div>
  );
}

function NeuCard({ img, title, description }) {
  return (
    <div className="border size-96 rounded relative  ">
      <div className="bg-white grid grid-rows-3 p-8 gap-4 size-full z-10 relative border-4 border-black">
        <Image
          src={img}
          alt={title}
          height={200}
          width={200}
          className="row-span-3 mx-auto"
        />
        <h3 className="text-2xl text-md md:text-2xl font-semibold text-center">
          {title}
        </h3>
        <p className="text-xs md:text-sm text-center font-medium">
          {description}
        </p>
      </div>

      <div className="absolute size-full bg-black  -bottom-2 -right-2"></div>
    </div>
  );
}

function NeuCard2({ title, list }) {
  return (
    <div className="border size-96 rounded relative ">
      <div className="bg-white flex flex-col p-8 size-full z-10 relative border-4 border-black">
        <h3 className=" text-sm md:text-2xl font-semibold text-left">
          {title}
        </h3>
        <div className="flex flex-col gap-2 mt-8">
          {list.map((item, i) => (
            <p className="text-xs md:text-base text-left font-medium" key={i}>
              - {item}
            </p>
          ))}
        </div>
      </div>

      <div className="absolute size-full bg-black  -bottom-2 -right-2"></div>
    </div>
  );
}
