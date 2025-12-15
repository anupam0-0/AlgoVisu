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
const typeDetails: Record<
  StackType,
  {
    title: string;
    icon: JSX.Element;
    description: string;
    howItWorks: string[];
    useCases: string[];
    complexity: { time: string; space: string };
    advancedInsights?: string[];
    visualizationNotes?: string[];
  }
> = {
  basic: {
    title: "Stack",
    icon: <Layers className="h-5 w-5 text-muted-foreground" />,
    description:
      "A stack follows the Last-In-First-Out (LIFO) principle — the last item pushed is the first one popped. Think of a stack of plates: you add and remove only from the top.",
    howItWorks: [
      "Backed by an array or linked list.",
      "Push adds to the top; pop removes from the top; peek inspects the top.",
      "Stack overflow: pushing onto a full/limited stack. Stack underflow: popping from an empty stack.",
      "Index of top grows/shrinks as elements are added/removed.",
    ],
    useCases: [
      "Function call management (call stack)",
      "Expression evaluation (infix → postfix)",
      "Undo/redo systems",
      "Depth-First Search (DFS) in graphs",
    ],
    complexity: { time: "O(1) for push/pop/peek", space: "O(n)" },
    advancedInsights: [
      "Recursive function calls allocate activation records on the call stack.",
      "Postfix (Reverse Polish) evaluation is naturally implemented with stacks.",
      "Parsing and backtracking leverage stacks for state management.",
    ],
    visualizationNotes: [
      "Green = recently pushed/peeked (highlight).",
      "Red & faded = popped (removal animation).",
      "‘TOP’ indicator points to the current top element.",
    ],
  },
  bounded: {
    title: "Bounded Stack",
    icon: <Lock className="h-5 w-5 text-muted-foreground" />,
    description:
      "A stack with a fixed maximum capacity to prevent unbounded memory growth — useful in constrained environments.",
    howItWorks: [
      "Pre-allocates a fixed-size buffer (e.g., array of size N).",
      "Push is rejected when the stack is full (overflow protection).",
      "Prevents runtime crashes due to uncontrolled growth.",
      "Common in embedded/real-time systems.",
    ],
    useCases: [
      "Microcontrollers and IoT devices",
      "Real-time operating systems (RTOS)",
      "Hardware interrupt stacks",
      "Safety-critical systems (avionics, medical devices)",
    ],
    complexity: { time: "O(1) for all operations", space: "O(1) fixed" },
    advancedInsights: [
      "Bounded stacks can be placed in fast on-chip memory (SRAM) for deterministic latency.",
      "Compile-time checks and guard regions detect overflow conditions.",
    ],
    visualizationNotes: [
      "Push button disables when capacity reached.",
      "Status panel shows size & empty state in real time.",
    ],
  },
  resizable: {
    title: "Resizable Stack",
    icon: <Zap className="h-5 w-5 text-muted-foreground" />,
    description:
      "A dynamic stack that grows automatically (e.g., doubling capacity) — common in high-level languages.",
    howItWorks: [
      "Backed by a dynamic array (JS Array, Python list).",
      "On full: allocate larger buffer, copy elements (rare event).",
      "Amortized O(1) push due to infrequent resizing.",
      "Trade-off between memory overhead & performance.",
    ],
    useCases: [
      "General-purpose applications",
      "Interpreter runtimes & REPLs",
      "Web app state transitions",
      "Interactive tools",
    ],
    complexity: { time: "Amortized O(1) push, O(1) pop/peek", space: "O(n)" },
    advancedInsights: [
      "Doubling strategy yields amortized O(1); shrinking heuristics avoid thrashing.",
      "Allocator behavior (fragmentation, cache locality) impacts performance.",
    ],
    visualizationNotes: [
      "Behaves like basic stack here, but conceptually resizes when needed.",
    ],
  },
  persistent: {
    title: "Persistent Stack",
    icon: <Clock className="h-5 w-5 text-muted-foreground" />,
    description:
      "Immutable stack: each operation returns a new version while preserving previous versions (structural sharing).",
    howItWorks: [
      "No in-place mutation; push/pop create new versions.",
      "Shares most nodes with prior versions → memory efficient over copies.",
      "Enables safe time-travel debugging and undo without side effects.",
      "Popular in functional programming & immutable state management.",
    ],
    useCases: [
      "Redux-like state histories",
      "Time-travel debugging",
      "Purely functional data structures",
      "Versioned states",
    ],
    complexity: { time: "O(1) push/pop with sharing", space: "O(n) across versions (amortized)" },
    advancedInsights: [
      "Linked-node representation allows O(1) persistent pushes via cons cells.",
      "Garbage collection reclaims unreferenced versions automatically.",
    ],
    visualizationNotes: [
      "‘History’ is maintained; popping restores a previous version.",
    ],
  },
  min: {
    title: "Min Stack",
    icon: <TrendingDown className="h-5 w-5 text-muted-foreground" />,
    description:
      "A specialized stack that can return the current minimum in O(1) time via an auxiliary min stack.",
    howItWorks: [
      "Maintain a secondary stack tracking min at each depth.",
      "On push: minStack.push(min(newValue, minStack.top())).",
      "On pop: pop from both main & min stacks.",
      "getMin(): return minStack.top().",
    ],
    useCases: [
      "Real-time stock monitoring (track lowest price)",
      "Leaderboards (min/max tracking variants)",
      "Interview & competitive programming problems",
      "Resource allocation thresholds",
    ],
    complexity: { time: "O(1) push/pop/peek/getMin", space: "O(n) extra for min-stack" },
    advancedInsights: [
      "A max stack is symmetric; both can be combined for min/max in O(1).",
      "Space-optimized trick: store deltas or pairs to compress min history.",
    ],
    visualizationNotes: [
      "Status panel shows current minimum.",
      "Min updates whenever a smaller value is pushed.",
    ],
  },
};

export default function StackVisualizerPage() {
  const [stackType, setStackType] = useState<StackType>("basic");
  const [stack, setStack] = useState<StackElement[]>(() => getInitialStack("basic"));
  const [minStack, setMinStack] = useState<number[]>([10, 10]);
  const [history, setHistory] = useState<StackElement[][]>([getInitialStack("persistent")]);
  const [inputValue, setInputValue] = useState("");
  const [lastOperation, setLastOperation] = useState<string>("");
  const [peekedValue, setPeekedValue] = useState<string | number | null>(null)
  const [demoOverflow, setDemoOverflow] = useState(false)
  const [demoUnderflow, setDemoUnderflow] = useState(false)

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

  const effectiveCapacity =
    stackType === "bounded" ? 6 : demoOverflow ? 4 : Number.MAX_SAFE_INTEGER

  const isBoundedFull = stack.length >= effectiveCapacity
  const details = typeDetails[stackType];

  const pushElement = () => {
    if (!inputValue.trim()) return;
    const raw = inputValue.trim();
    const val = !isNaN(Number(raw)) ? Number(raw) : raw;
    const id = Date.now();

    if (isBoundedFull) {
      setLastOperation("❌ Overflow: capacity reached — cannot push")
      return
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
      const lastMin = minStack.length > 0 ? minStack[minStack.length - 1] : Infinity;
      const newMin = typeof val === "number" ? Math.min(lastMin, val) : lastMin;
      setMinStack([...minStack, newMin]);
    }

    setLastOperation(`✅ Pushed: ${val}`);
    setInputValue("");
  };

  const popElement = () => {
    if (stack.length <= 1) {
      if (demoUnderflow) {
        setLastOperation("❌ Underflow: cannot pop from empty stack")
      }
      return;
    }

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
      setTimeout(() => setStack(prev => prev.slice(0, - 1)), 300);
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

  const renderStack = () => (
    <div className="flex flex-col-reverse gap-2 min-h-[320px] justify-end items-center">
      {stack.map((el, idx) => (
        <div
          key={el.id}
          className={`
          w-40 h-14 md:w-48 md:h-16 border-2 rounded-xl flex items-center justify-center
          transition-all duration-300 relative
          ${el.isHighlighted
              ? "bg-green-100 border-green-500 text-green-800 scale-105"
              : el.isPopped
                ? "bg-red-100 border-red-500 scale-95 opacity-50"
                : "bg-card border-border"
            }
        `}
          style={{ transform: el.isPopped ? "translateX(120px)" : "translateX(0)" }}
        >
          <span className="font-mono font-bold text-base md:text-lg">{el.value}</span>
          {idx === stack.length - 1 && idx > 0 && (
            <div className="absolute -right-10 top-1/2 -translate-y-1/2">
              <div className="text-xs md:text-sm font-medium text-green-600">← TOP</div>
            </div>
          )}
        </div>
      ))}
    </div>
  )

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

        {/* <div className="flex justify-center">
          <div className="inline-flex rounded-md border p-1 bg-muted w-full max-w-2xl">
            {(["basic", "bounded", "resizable", "persistent", "min"] as const).map((type) => (
              <button
                key={type}
                onClick={() => setStackType(type)}
                className={`
                  flex-1 py-2 text-sm font-medium rounded-sm transition-colors
                  ${stackType === type
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                  }
                `}
              >
                {typeDetails[type].title}
              </button>
            ))}
          </div>
        </div> */}

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              {details.icon}
              {details.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-base text-muted-foreground space-y-3 leading-relaxed">
            <div className="font-medium text-[1.05rem]">
              {details.description}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <h4 className="font-semibold text-foreground mb-2">How It Works</h4>
                <ul className="list-disc list-inside space-y-1 text-sm leading-relaxed">
                  {details.howItWorks.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">Common Use Cases</h4>
                <ul className="list-disc list-inside space-y-1 text-sm leading-relaxed">
                  {details.useCases.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>

            {details.advancedInsights && (
              <div className="pt-2">
                <h4 className="font-semibold text-foreground mb-2">Advanced Insights</h4>
                <ul className="list-disc list-inside space-y-1 text-sm leading-relaxed">
                  {details.advancedInsights.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {details.visualizationNotes && (
              <div className="pt-2">
                <h4 className="font-semibold text-foreground mb-2">Visualization Notes</h4>
                <ul className="list-disc list-inside space-y-1 text-sm leading-relaxed">
                  {details.visualizationNotes.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="pt-2 text-sm">
              <strong>Complexity:</strong> Time – {details.complexity.time}, Space – {details.complexity.space}
            </div>
          </CardContent>
        </Card>

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
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Visualization Key</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-green-100 border border-green-500" />
              <span className="text-muted-foreground">Recent push / peek highlight</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-red-100 border border-red-500 opacity-60" />
              <span className="text-muted-foreground">Popped (removal animation)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-card border border-border" />
              <span className="text-muted-foreground">Regular element</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Edge Case Demo</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row sm:items-center gap-4 text-muted-foreground">
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                className="h-4 w-4"
                checked={demoOverflow}
                onChange={(e) => setDemoOverflow(e.target.checked)}
              />
              <span className="text-muted-foreground">
                Demo Overflow ({stackType === "bounded" ? "bounded capacity = 6" : "temp capacity = 4"})
              </span>
            </label>
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                className="h-4 w-4"
                checked={demoUnderflow}
                onChange={(e) => setDemoUnderflow(e.target.checked)}
              />
              <span className="text-muted-foreground">Demo Underflow (show error when empty pop)</span>
            </label>
            <div className="text-xs text-muted-foreground">
              {isBoundedFull
                ? "Capacity reached — pushing will trigger overflow."
                : "Capacity available."}
            </div>
          </CardContent>
        </Card>

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
                <div className="text-xs text-red-500">Max capacity reached</div>
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
                Peek & Reset
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button
                  onClick={peekElement}
                  disabled={stack.length <= 1}
                  className="flex-1"
                  variant="outline"
                  style={{ borderColor: "#a8d8b9", color: "#1a5d38" }}
                >
                  Peek at Top
                </Button>
                <Button
                  onClick={resetStack}
                  variant="secondary"
                  className="flex-1"
                >
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

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
                  {stack.length > 1 ? (stack[stack.length - 1].value as any) : "—"}
                </div>
                <div className="text-sm text-muted-foreground">Top Element</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{stack.length <= 1 ? "Yes" : "No"}</div>
                <div className="text-sm text-muted-foreground">Is Empty?</div>
              </div>
              <div>
                <div className={`text-sm font-medium ${lastOperation.startsWith("❌") ? "text-red-600" : "text-green-600"}`}>
                  {lastOperation || "Ready to interact"}
                </div>
                <div className="text-sm text-muted-foreground">Last Action</div>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </VisualizerLayout>
  );
}
