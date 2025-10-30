// src/components/DSAInfoBubble.tsx
"use client";

import { useEffect, useState } from "react";
import { 
  Binary, 
  Hash, 
  Database, 
  GitFork, 
  Shuffle, 
  Zap, 
  TreePine, 
  Sliders, 
  Repeat, 
  Brain 
} from "lucide-react";

// Define terms with associated icons
const dsaItems = [
  { term: "Binary Search", icon: Binary },
  { term: "Hash Tables", icon: Hash },
  { term: "Graphs", icon: GitFork },
  { term: "Heaps", icon: Database },
  { term: "Quick Sort", icon: Shuffle },
  { term: "BFS/DFS", icon: TreePine },
  { term: "Sliding Window", icon: Sliders },
  { term: "Recursion", icon: Repeat },
  { term: "Dynamic Programming", icon: Brain },
  { term: "Tries", icon: GitFork },
  { term: "Topological Sort", icon: Shuffle },
  { term: "Union Find", icon: Database },
];

const BUBBLE_COUNT = 3;

export default function DSAInfoBubble() {
  const [items, setItems] = useState<(typeof dsaItems)[number][]>([]);

  useEffect(() => {
    // Initialize with random items
    const getRandomItems = () => {
      const shuffled = [...dsaItems].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, BUBBLE_COUNT);
    };
    setItems(getRandomItems());

    // Refresh every 8 seconds
    const interval = setInterval(() => {
      setItems(getRandomItems());
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute top-0 right-0 w-full h-full pointer-events-none">
      {items.map((item, index) => {
        // Random position & animation delay
        const top = 10 + Math.random() * 20; // 10% to 30% from top
        const right = 5 + Math.random() * 20; // 5% to 25% from right
        const delay = Math.random() * 3;

        return (
          <div
            key={index}
            className="absolute animate-float opacity-90"
            style={{
              top: `${top}%`,
              right: `${right}%`,
              animationDelay: `${delay}s`,
            }}
          >
            <div className="flex items-center gap-2 bg-primary/15 backdrop-blur-sm border border-primary/20 rounded-full px-3 py-2 shadow-md">
              <item.icon className="h-4 w-4 text-primary flex-shrink-0" />
              <span className="text-primary text-sm font-medium whitespace-nowrap">
                {item.term}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}