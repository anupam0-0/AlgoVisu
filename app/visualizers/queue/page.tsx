"use client"

import { useState, useEffect, useMemo } from "react"
import { VisualizerLayout } from "../../../components/visualizer-layout"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { Badge } from "../../../components/ui/badge"
import { Layers, Plus, Trash2, Eye, RotateCcw, Star, ArrowLeftRight } from "lucide-react"

// Types
interface QueueElement {
  value: number;
  priority?: number;
}

type QueueType = "linear" | "circular" | "priority" | "deque";

const applicationsMap: Record<QueueType, { title: string; description: string; examples: string[] }[]> = {
  linear: [
    { title: "Task Scheduling", description: "Queues manage tasks in order of arrival.", examples: ["Print queue", "CPU scheduling"] },
  ],
  circular: [
    { title: "Streaming Buffers", description: "Efficiently reuse memory in fixed-size buffers.", examples: ["Audio streaming", "Sensor data"] },
  ],
  priority: [
    { title: "Emergency Systems", description: "Serve high-priority items first.", examples: ["Hospital triage", "Network QoS"] },
  ],
  deque: [
    { title: "Sliding Window", description: "Efficiently maintain window of recent elements.", examples: ["Max in subarray", "Rate limiting"] },
  ],
};

const initialQueues: Record<QueueType, QueueElement[]> = {
  linear: [{ value: 10 }, { value: 20 }, { value: 30 }],
  circular: [{ value: 10 }, { value: 20 }, { value: 30 }],
  priority: [
    { value: 10, priority: 3 },
    { value: 20, priority: 1 },
    { value: 30, priority: 2 },
  ],
  deque: [{ value: 10 }, { value: 20 }, { value: 30 }],
};

export default function QueueVisualizerPage() {
  const [queueType, setQueueType] = useState<QueueType>("linear");
  const [queue, setQueue] = useState<QueueElement[]>(() => [...initialQueues[queueType]]);
  const [inputValue, setInputValue] = useState("");
  const [priorityValue, setPriorityValue] = useState("1");
  const [peekedValue, setPeekedValue] = useState<number | null>(null);

  useEffect(() => {
    setQueue([...initialQueues[queueType]]);
    setPeekedValue(null);
    setInputValue("");
    setPriorityValue("1");
  }, [queueType]);

  const applications = applicationsMap[queueType];

  const resetQueue = () => {
    setQueue([...initialQueues[queueType]]);
    setPeekedValue(null);
    setInputValue("");
    setPriorityValue("1");
  };

  // --- Operations ---
  const enqueue = () => {
    const num = Number(inputValue);
    if (!inputValue || isNaN(num)) return;

    if (queueType === "priority") {
      const prio = Number(priorityValue) || 1;
      const newElement = { value: num, priority: prio };
      const newQueue = [...queue, newElement].sort((a, b) => (a.priority || 0) - (b.priority || 0));
      setQueue(newQueue);
    } else if (queueType === "deque") {
      setQueue(prev => [...prev, { value: num }]);
    } else {
      setQueue(prev => [...prev, { value: num }]);
    }
    setInputValue("");
  };

  const dequeue = () => {
    if (queue.length === 0) return;
    setQueue(prev => prev.slice(1));
    setPeekedValue(null);
  };

  const peek = () => {
    if (queue.length > 0) {
      setPeekedValue(queue[0].value);
    }
  };

  const pushFront = () => {
    const num = Number(inputValue);
    if (!inputValue || isNaN(num)) return;
    setQueue(prev => [{ value: num }, ...prev]);
    setInputValue("");
  };

  const popFront = () => {
    if (queue.length === 0) return;
    setQueue(prev => prev.slice(1));
    setPeekedValue(null);
  };

  const popBack = () => {
    if (queue.length === 0) return;
    setQueue(prev => prev.slice(0, -1));
    setPeekedValue(null);
  };

  const MAX_CIRCULAR_SIZE = 5;
  const isCircularFull = queueType === "circular" && queue.length >= MAX_CIRCULAR_SIZE;

  // --- Render Queue Elements ---
  const renderQueueElements = () => {
    if (queue.length === 0) {
      return <span className="text-muted-foreground">Queue is empty</span>;
    }

    return queue.map((element, index) => {
      const isFront = index === 0;
      const isBack = index === queue.length - 1 && queueType === "deque";

      return (
        <div key={index} className="relative">
          <div
            className={`
              w-20 h-20 border-2 rounded-lg flex flex-col items-center justify-center
              transition-all duration-300 cursor-pointer group
              ${
                isFront
                  ? "bg-blue-100 border-blue-500 text-blue-800"
                  : queueType === "priority"
                    ? "bg-yellow-100 border-yellow-500 text-yellow-800"
                    : "bg-card border-border hover:border-accent/50"
              }
            `}
          >
            <span className="font-mono font-bold text-base">{element.value}</span>
            {queueType === "priority" && element.priority !== undefined && (
              <span className="text-xs text-muted-foreground mt-1">P{element.priority}</span>
            )}
            <span className="text-xs text-muted-foreground">[{index}]</span>
            {isFront && <Badge variant="outline" className="mt-1 text-xs">Front</Badge>}
            {isBack && <Badge variant="secondary" className="mt-1 text-xs">Back</Badge>}
            {peekedValue !== null && isFront && (
              <Badge variant="secondary" className="mt-1 text-xs">Peeked</Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="absolute -top-2 -right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => {
              setQueue(prev => prev.filter((_, i) => i !== index));
              setPeekedValue(null);
            }}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      );
    });
  };

  // --- Render Controls ---
  const renderControls = () => {
    switch (queueType) {
      case "priority":
        return (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  Enqueue (Priority)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Value"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                  />
                  <Input
                    type="number"
                    placeholder="Priority"
                    value={priorityValue}
                    onChange={(e) => setPriorityValue(e.target.value)}
                    className="w-24"
                    min="1"
                  />
                  <Button onClick={enqueue} disabled={!inputValue}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Dequeue</CardTitle>
              </CardHeader>
              <CardContent>
                <Button onClick={dequeue} disabled={queue.length === 0} className="w-full">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Dequeue
                </Button>
              </CardContent>
            </Card>
          </>
        );

      case "deque":
        return (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <ArrowLeftRight className="h-4 w-4" />
                  Push Front
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Value"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                  />
                  <Button onClick={pushFront} disabled={!inputValue}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Pop Front</CardTitle>
              </CardHeader>
              <CardContent>
                <Button onClick={popFront} disabled={queue.length === 0} className="w-full">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Pop Front
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Pop Back</CardTitle>
              </CardHeader>
              <CardContent>
                <Button onClick={popBack} disabled={queue.length === 0} className="w-full">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Pop Back
                </Button>
              </CardContent>
            </Card>
          </>
        );

      default:
        return (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  {queueType === "circular" ? <RotateCcw className="h-4 w-4" /> : <Layers className="h-4 w-4" />}
                  Enqueue
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Enter number"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                  />
                  <Button
                    onClick={enqueue}
                    disabled={!inputValue || (queueType === "circular" && isCircularFull)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {queueType === "circular" && isCircularFull && (
                  <p className="text-xs text-red-500">Queue full (max {MAX_CIRCULAR_SIZE})</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Dequeue</CardTitle>
              </CardHeader>
              <CardContent>
                <Button onClick={dequeue} disabled={queue.length === 0} className="w-full">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Dequeue
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Peek</CardTitle>
              </CardHeader>
              <CardContent>
                <Button onClick={peek} disabled={queue.length === 0} className="w-full">
                  <Eye className="h-4 w-4 mr-2" />
                  Peek
                </Button>
              </CardContent>
            </Card>
          </>
        );
    }
  };

  const complexity = useMemo(() => {
    switch (queueType) {
      case "priority": return { time: "O(log n)", space: "O(n)" };
      default: return { time: "O(1)", space: "O(n)" };
    }
  }, [queueType]);

  return (
    <VisualizerLayout
      title="Queue Visualizer"
      description="Explore 4 types of queues: Linear, Circular, Priority, and Deque"
      difficulty="Beginner"
      onReset={resetQueue}
      complexity={complexity}
      applications={applications}
    >
      <div className="w-full space-y-6">
        {/* Knowledge Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">📚 Understanding Queues</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>
              A <strong>queue</strong> is a linear data structure that follows the <strong>First-In-First-Out (FIFO)</strong> principle: 
              the first element added is the first one removed.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <div className="flex items-start gap-2">
                  <Layers className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <div>
                    <strong>Linear Queue</strong>
                    <p className="text-xs mt-1">Basic FIFO structure. Elements are added at the rear and removed from the front.</p>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-start gap-2">
                  <RotateCcw className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <div>
                    <strong>Circular Queue</strong>
                    <p className="text-xs mt-1">Optimizes memory by connecting the end to the front, allowing reuse of empty slots.</p>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-start gap-2">
                  <Star className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <div>
                    <strong>Priority Queue</strong>
                    <p className="text-xs mt-1">Elements are dequeued based on priority (not insertion order). Often implemented with heaps.</p>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-start gap-2">
                  <ArrowLeftRight className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <div>
                    <strong>Deque (Double-Ended Queue)</strong>
                    <p className="text-xs mt-1">Allows insertion and deletion at both ends—supports both stack and queue operations.</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Queue Type Selector */}
        <div className="flex justify-center">
          <div className="inline-flex rounded-md border p-1 bg-muted w-full max-w-md">
            {(["linear", "circular", "priority", "deque"] as const).map((type) => (
              <button
                key={type}
                onClick={() => setQueueType(type)}
                className={`
                  flex-1 py-2 text-sm font-medium rounded-sm transition-colors
                  ${
                    queueType === type
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }
                `}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Queue Visualization */}
        <div className="flex flex-wrap gap-4 justify-center min-h-[140px] items-center">
          {renderQueueElements()}
        </div>

        {/* Controls */}
        <div className="grid md:grid-cols-3 gap-4">{renderControls()}</div>
      </div>
    </VisualizerLayout>
  );
}