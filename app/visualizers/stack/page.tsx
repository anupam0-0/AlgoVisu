"use client"

import { useState, useEffect } from "react"
import { VisualizerLayout } from "../../../components/visualizer-layout"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { Badge } from "../../../components/ui/badge"
import { Plus, Minus, Eye, Layers, Lock, Zap, Clock, TrendingDown } from "lucide-react"

type StackType = "basic" | "bounded" | "resizable" | "persistent" | "min";

interface StackElement {
  value: string | number;
  id: number;
  isHighlighted?: boolean;
  isPopped?: boolean;
}

const getInitialStack = (type: StackType): StackElement[] => {
  return [
    { value: "Base", id: 0 },
    { value: 10, id: 1 },
    { value: 20, id: 2 },
  ];
};

// Detailed educational content per type
const typeDetails: Record<StackType, {
  title: string;
  icon: JSX.Element;
  description: string;
  howItWorks: string[];
  useCases: string[];
  complexity: { time: string; space: string };
}> = {
  basic: {
    title: "Basic Stack",
    icon: <Layers className="h-5 w-5 text-muted-foreground" />,
    description: "The standard Last-In-First-Out (LIFO) data structure where elements are added and removed only from the top.",
    howItWorks: [
      "Uses an array or linked list internally.",
      "Push adds to the top; pop removes from the top.",
      "Peek inspects the top without removal.",
      "No size restrictions in theory (but limited by memory)."
    ],
    useCases: [
      "Function call management (call stack)",
      "Expression evaluation and syntax parsing",
      "Undo mechanisms in software",
      "Depth-First Search (DFS) in graphs"
    ],
    complexity: { time: "O(1) for push/pop/peek", space: "O(n)" }
  },
  bounded: {
    title: "Bounded Stack",
    icon: <Lock className="h-5 w-5 text-muted-foreground" />,
    description: "A stack with a fixed maximum capacity, preventing memory overflow in constrained environments.",
    howItWorks: [
      "Pre-allocates a fixed-size buffer (e.g., array of size N).",
      "Push is rejected when the stack is full.",
      "Prevents runtime errors due to uncontrolled growth.",
      "Often implemented in low-level or embedded systems."
    ],
    useCases: [
      "Microcontrollers and IoT devices",
      "Real-time operating systems (RTOS)",
      "Hardware interrupt stacks",
      "Safety-critical systems (avionics, medical devices)"
    ],
    complexity: { time: "O(1) for all operations", space: "O(1) fixed" }
  },
  resizable: {
    title: "Resizable Stack",
    icon: <Zap className="h-5 w-5 text-muted-foreground" />,
    description: "A dynamic stack that automatically expands its capacity when needed, commonly used in high-level programming languages.",
    howItWorks: [
      "Backed by a dynamic array (e.g., JavaScript Array, Python list).",
      "When full, allocates a larger block (e.g., doubles size) and copies data.",
      "Amortized O(1) time for push due to infrequent resizing.",
      "Balances memory efficiency and performance."
    ],
    useCases: [
      "Web application state management",
      "Scripting language runtimes (Python, JS, Ruby)",
      "General-purpose application development",
      "Interactive tools and REPLs"
    ],
    complexity: { time: "Amortized O(1) push, O(1) pop/peek", space: "O(n)" }
  },
  persistent: {
    title: "Persistent Stack",
    icon: <Clock className="h-5 w-5 text-muted-foreground" />,
    description: "An immutable stack where every operation returns a new version, preserving all previous states.",
    howItWorks: [
      "No mutation: each push/pop creates a new stack instance.",
      "Shares structure with previous versions (structural sharing).",
      "Enables safe time-travel debugging and undo without side effects.",
      "Common in functional programming paradigms."
    ],
    useCases: [
      "Redux and state management libraries",
      "Time-travel debugging (e.g., React DevTools)",
      "Version control systems (conceptually)",
      "Blockchain state transitions"
    ],
    complexity: { time: "O(1) for push/pop (with sharing)", space: "O(n) per version (amortized)" }
  },
  min: {
    title: "Min Stack",
    icon: <TrendingDown className="h-5 w-5 text-muted-foreground" />,
    description: "A specialized stack that supports retrieving the minimum element in constant time.",
    howItWorks: [
      "Maintains a secondary stack that tracks the current minimum at each level.",
      "On push: compare new value with current min; push min(new, current) to min-stack.",
      "On pop: pop from both main and min stacks.",
      "Peek min: just read top of min-stack."
    ],
    useCases: [
      "Real-time stock price monitoring (track lowest price)",
      "Leaderboard systems (track min/max scores)",
      "Algorithm problems (e.g., LeetCode 'Min Stack')",
      "Resource allocation (track minimum available resource)"
    ],
    complexity: { time: "O(1) for all operations including getMin", space: "O(n) extra for min-stack" }
  }
};

export default function StackVisualizerPage() {
  const [stackType, setStackType] = useState<StackType>("basic");
  const [stack, setStack] = useState<StackElement[]>(() => getInitialStack("basic"));
  const [minStack, setMinStack] = useState<number[]>([10, 10]); // for min-stack
  const [history, setHistory] = useState<StackElement[][]>([getInitialStack("persistent")]); // for persistent
  const [inputValue, setInputValue] = useState("");
  const [lastOperation, setLastOperation] = useState<string>("");
  const [peekedValue, setPeekedValue] = useState<string | number | null>(null);

  // Reset on type change
  useEffect(() => {
    const initStack = getInitialStack(stackType);
    setStack(initStack);
    setInputValue("");
    setLastOperation("");
    setPeekedValue(null);

    if (stackType === "min") {
      setMinStack([10, 10]);
    }
    if (stackType === "persistent") {
      setHistory([initStack]);
    }
  }, [stackType]);

  const resetStack = () => {
    const initStack = getInitialStack(stackType);
    setStack(initStack);
    setInputValue("");
    setLastOperation("");
    setPeekedValue(null);

    if (stackType === "min") {
      setMinStack([10, 10]);
    }
    if (stackType === "persistent") {
      setHistory([initStack]);
    }
  };

  // --- Operations ---
  const pushElement = () => {
    if (!inputValue.trim()) return;
    const raw = inputValue.trim();
    const val = !isNaN(Number(raw)) ? Number(raw) : raw;
    const id = Date.now();

    if (stackType === "bounded" && stack.length >= 6) {
      setLastOperation("❌ Stack full (max 5 elements)");
      return;
    }

    if (stackType === "persistent") {
      const newStack = [...stack, { value: val, id }];
      setHistory([...history, newStack]);
      setStack(newStack);
    } else {
      const newStack = [...stack, { value: val, id, isHighlighted: true }];
      setStack(newStack);
      setTimeout(() => {
        setStack(prev => prev.map(el => ({ ...el, isHighlighted: false })));
      }, 500);
    }

    if (stackType === "min") {
      const currentMin = minStack.length > 0 ? minStack[minStack.length - 1] : Infinity;
      const newMin = typeof val === "number" ? Math.min(currentMin, val) : currentMin;
      setMinStack([...minStack, newMin]);
    }

    setLastOperation(`✅ Pushed: ${val}`);
    setInputValue("");
  };

  const popElement = () => {
    if (stack.length <= 1) return;
    const popped = stack[stack.length - 1];

    if (stackType === "persistent") {
      const newHistory = history.slice(0, -1);
      const newStack = newHistory[newHistory.length - 1] || getInitialStack(stackType);
      setHistory(newHistory);
      setStack(newStack);
    } else {
      setStack(prev =>
        prev.map((el, i) => (i === prev.length - 1 ? { ...el, isPopped: true } : el))
      );
      setTimeout(() => setStack(prev => prev.slice(0, -1)), 300);
    }

    if (stackType === "min") {
      setMinStack(prev => prev.slice(0, -1));
    }

    setLastOperation(`🗑️ Popped: ${popped.value}`);
  };

  const peekElement = () => {
    if (stack.length <= 1) return;
    const top = stack[stack.length - 1];
    setPeekedValue(top.value);

    if (stackType !== "persistent") {
      setStack(prev =>
        prev.map((el, i) =>
          i === prev.length - 1 ? { ...el, isHighlighted: true } : { ...el, isHighlighted: false }
        )
      );
      setTimeout(() => {
        setStack(prev => prev.map(el => ({ ...el, isHighlighted: false })));
        setPeekedValue(null);
      }, 2000);
    } else {
      setPeekedValue(null);
      setTimeout(() => setPeekedValue(null), 2000);
    }

    setLastOperation(`👁️ Peeked: ${top.value}`);
  };

  // --- Helpers ---
  const isBoundedFull = stackType === "bounded" && stack.length >= 6;
  const currentMin = stackType === "min" && minStack.length > 0 ? minStack[minStack.length - 1] : null;
  const details = typeDetails[stackType];

  // --- Render Stack ---
  const renderStack = () => (
    <div className="flex flex-col-reverse space-y-reverse space-y-1 min-h-[200px] justify-end">
      {stack.map((el, idx) => (
        <div
          key={el.id}
          className={`
            w-32 h-12 border-2 rounded-lg flex items-center justify-center
            transition-all duration-300 relative
            ${
              el.isHighlighted
                ? "bg-green-100 border-green-500 text-green-800 scale-105"
                : el.isPopped
                  ? "bg-red-100 border-red-500 scale-95 opacity-50"
                  : "bg-card border-border"
            }
          `}
          style={{ transform: el.isPopped ? "translateX(100px)" : "translateX(0)" }}
        >
          <span className="font-mono font-bold text-sm">{el.value}</span>
          {idx === stack.length - 1 && idx > 0 && (
            <div className="absolute -right-8 top-1/2 transform -translate-y-1/2">
              <div className="text-xs font-medium text-green-600">← TOP</div>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <VisualizerLayout
      title="Stack Visualizer"
      description="Explore 5 types of stacks with interactive operations and in-depth explanations"
      difficulty="Beginner"
      onReset={resetStack}
      complexity={details.complexity}
      applications={details.useCases.map(useCase => ({
        title: useCase,
        description: "",
        examples: []
      }))}
    >
      <div className="w-full space-y-6">
        {/* Type Selector */}
        <div className="flex justify-center">
          <div className="inline-flex rounded-md border p-1 bg-muted w-full max-w-2xl">
            {(["basic", "bounded", "resizable", "persistent", "min"] as const).map((type) => (
              <button
                key={type}
                onClick={() => setStackType(type)}
                className={`
                  flex-1 py-2 text-sm font-medium rounded-sm transition-colors
                  ${
                    stackType === type
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }
                `}
              >
                {typeDetails[type].title}
              </button>
            ))}
          </div>
        </div>

        {/* Knowledge Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              {details.icon}
              {details.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p className="font-medium">{details.description}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <h4 className="font-semibold text-foreground mb-2">How It Works</h4>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  {details.howItWorks.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">Common Use Cases</h4>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  {details.useCases.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-2 text-xs">
              <strong>Complexity:</strong> Time – {details.complexity.time}, Space – {details.complexity.space}
            </div>
          </CardContent>
        </Card>

        {/* Visualization */}
        <div className="flex flex-col items-center space-y-2">
          <div className="text-sm text-muted-foreground mb-2">
            Top of Stack{" "}
            {peekedValue !== null && (
              <Badge variant="secondary" className="ml-2">
                Peeking: {peekedValue}
              </Badge>
            )}
          </div>
          {renderStack()}
          <div className="text-sm text-muted-foreground mt-2">Base</div>
        </div>

        {/* Controls */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Plus className="h-5 w-5 text-green-600" />
                Push
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                placeholder="Enter value"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && pushElement()}
              />
              <Button
                onClick={pushElement}
                disabled={!inputValue.trim() || isBoundedFull}
                className="w-full"
                style={{ backgroundColor: "#a8d8b9", color: "#1a5d38" }}
              >
                Push to Stack
              </Button>
              {isBoundedFull && (
                <p className="text-xs text-red-500">Max 5 elements allowed</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Minus className="h-5 w-5 text-red-600" />
                Pop
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                onClick={popElement}
                disabled={stack.length <= 1}
                className="w-full"
                variant="destructive"
              >
                Pop from Stack
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Eye className="h-5 w-5 text-blue-600" />
                Peek
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                onClick={peekElement}
                disabled={stack.length <= 1}
                className="w-full"
                variant="outline"
                style={{ borderColor: "#a8d8b9", color: "#1a5d38" }}
              >
                Peek at Top
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Info Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Stack Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">{stack.length - 1}</div>
                <div className="text-sm text-muted-foreground">Size</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {stack.length > 1 ? stack[stack.length - 1].value : "—"}
                </div>
                <div className="text-sm text-muted-foreground">Top Element</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{stack.length <= 1 ? "Yes" : "No"}</div>
                <div className="text-sm text-muted-foreground">Is Empty?</div>
              </div>
              {stackType === "min" && currentMin !== null ? (
                <div>
                  <div className="text-2xl font-bold text-green-600">{currentMin}</div>
                  <div className="text-sm text-muted-foreground">Current Min</div>
                </div>
              ) : (
                <div>
                  <div className="text-sm font-medium text-green-600">{lastOperation || "Ready to interact"}</div>
                  <div className="text-sm text-muted-foreground">Last Action</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </VisualizerLayout>
  );
}