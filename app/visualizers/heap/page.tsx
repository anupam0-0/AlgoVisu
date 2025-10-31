"use client"

import { useState, useEffect } from "react"
import { VisualizerLayout } from "../../../components/visualizer-layout"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../components/ui/card"
import { Badge } from "../../../components/ui/badge"
import { Plus, X, BarChart3, Zap } from "lucide-react"

type HeapType = "min" | "max"
type HeapStep = {
  description: string
  heap: number[]
  highlightedIndices: number[]
  codeLine: number
}

const pseudocode = [
  "function insert(value):",
  "  heap.push(value)",
  "  heapifyUp(heap.length - 1)",
  "",
  "function heapifyUp(index):",
  "  while index > 0:",
  "    parent = (index - 1) // 2",
  "    if heap[parent] <= heap[index]: break  // for max-heap, reverse",
  "    swap(heap[parent], heap[index])",
  "    index = parent",
  "",
  "function extractRoot():",
  "  if heap empty: return null",
  "  root = heap[0]",
  "  heap[0] = heap.pop()",
  "  heapifyDown(0)",
  "  return root",
  "",
  "function heapifyDown(index):",
  "  while true:",
  "    left = 2*index + 1",
  "    right = 2*index + 2",
  "    smallest = index",
  "    if left < size and heap[left] < heap[smallest]: smallest = left",
  "    if right < size and heap[right] < heap[smallest]: smallest = right",
  "    if smallest == index: break",
  "    swap(heap[index], heap[smallest])",
  "    index = smallest",
  "",
  "// Floyd's Build-Heap (O(n))",
  "function buildHeap(arr):",
  "  heap = arr",
  "  start = floor(heap.length / 2) - 1",
  "  for i = start down to 0:",
  "    heapifyDown(i)",
]

export default function HeapVisualizer() {
  const [heapType, setHeapType] = useState<HeapType>("min")
  const [heap, setHeap] = useState<number[]>([])
  const [inputValue, setInputValue] = useState("")
  const [arrayInput, setArrayInput] = useState("")
  const [steps, setSteps] = useState<HeapStep[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [currentCodeLine, setCurrentCodeLine] = useState<number>(-1)

  const applications = [
    {
      title: "Priority Queues",
      description: "Heaps power efficient priority queue implementations",
      examples: ["Task scheduling", "OS process management", "Event-driven simulations"],
    },
    {
      title: "Dijkstra’s Algorithm",
      description: "Min-heaps optimize shortest-path computation",
      examples: ["GPS navigation", "Network routing", "Game AI pathfinding"],
    },
    {
      title: "Heap Sort",
      description: "In-place O(n log n) sorting algorithm",
      examples: ["Embedded systems", "Real-time systems", "Memory-constrained environments"],
    },
  ]

  const resetHeap = () => {
    setHeap([])
    setSteps([])
    setCurrentStep(0)
    setCurrentCodeLine(-1)
  }

  const compare = (a: number, b: number): boolean => {
    return heapType === "min" ? a > b : a < b
  }

  const addStep = (description: string, heapState: number[], highlighted: number[], codeLine: number) => {
    setSteps(prev => [...prev, { description, heap: [...heapState], highlightedIndices: [...highlighted], codeLine }])
  }

  const handleInsert = () => {
    const val = Number(inputValue)
    if (isNaN(val)) return

    let currentHeap = [...heap, val]
    const stepsSnapshot: HeapStep[] = []
    let index = currentHeap.length - 1

    stepsSnapshot.push({
      description: `Inserted ${val} at end of heap.`,
      heap: [...currentHeap],
      highlightedIndices: [index],
      codeLine: 2,
    })

    while (index > 0) {
      const parent = Math.floor((index - 1) / 2)
      stepsSnapshot.push({
        description: `Compare ${currentHeap[index]} (index ${index}) with parent ${currentHeap[parent]} (index ${parent}).`,
        heap: [...currentHeap],
        highlightedIndices: [index, parent],
        codeLine: 7,
      })

      if (!compare(currentHeap[parent], currentHeap[index])) break

      [currentHeap[parent], currentHeap[index]] = [currentHeap[index], currentHeap[parent]]
      index = parent
      stepsSnapshot.push({
        description: `Swapped ${currentHeap[index]} and ${currentHeap[parent]}.`,
        heap: [...currentHeap],
        highlightedIndices: [index],
        codeLine: 8,
      })
    }

    setHeap(currentHeap)
    setSteps(stepsSnapshot)
    setCurrentStep(0)
    setInputValue("")
  }

  const handleExtract = () => {
    if (heap.length === 0) return

    let currentHeap = [...heap]
    const root = currentHeap[0]
    const last = currentHeap.pop()!
    if (currentHeap.length === 0) {
      setHeap([])
      setSteps([{ description: `Extracted root ${root}. Heap is now empty.`, heap: [], highlightedIndices: [], codeLine: -1 }])
      setCurrentStep(0)
      return
    }

    currentHeap[0] = last
    const stepsSnapshot: HeapStep[] = []
    let index = 0

    stepsSnapshot.push({
      description: `Replaced root with last element: ${last}.`,
      heap: [...currentHeap],
      highlightedIndices: [0],
      codeLine: 15,
    })

    while (true) {
      const left = 2 * index + 1
      const right = 2 * index + 2
      let target = index

      if (left < currentHeap.length && compare(currentHeap[target], currentHeap[left])) {
        target = left
      }
      if (right < currentHeap.length && compare(currentHeap[target], currentHeap[right])) {
        target = right
      }

      stepsSnapshot.push({
        description: `Checking children of index ${index} (value ${currentHeap[index]}).`,
        heap: [...currentHeap],
        highlightedIndices: [index, left, right].filter(i => i < currentHeap.length),
        codeLine: 23,
      })

      if (target === index) break

      [currentHeap[index], currentHeap[target]] = [currentHeap[target], currentHeap[index]]
      stepsSnapshot.push({
        description: `Swapped with child at index ${target} (value ${currentHeap[index]}).`,
        heap: [...currentHeap],
        highlightedIndices: [target],
        codeLine: 26,
      })
      index = target
    }

    setHeap(currentHeap)
    stepsSnapshot.push({
      description: `Extracted root ${root}.`,
      heap: [...currentHeap],
      highlightedIndices: [],
      codeLine: 16,
    })
    setSteps(stepsSnapshot)
    setCurrentStep(0)
  }

  const buildHeapFromArray = () => {
    const arr = arrayInput
      .split(",")
      .map(s => s.trim())
      .filter(s => s !== "")
      .map(Number)
      .filter(n => !isNaN(n))

    if (arr.length === 0) return

    let currentHeap = [...arr]
    const stepsSnapshot: HeapStep[] = []

    stepsSnapshot.push({
      description: `Starting with array: [${arr.join(", ")}]`,
      heap: [...currentHeap],
      highlightedIndices: [],
      codeLine: -1,
    })

    const n = currentHeap.length
    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
      stepsSnapshot.push({
        description: `Heapifying from index ${i} (value ${currentHeap[i]})`,
        heap: [...currentHeap],
        highlightedIndices: [i],
        codeLine: 33,
      })

      let index = i
      while (true) {
        const left = 2 * index + 1
        const right = 2 * index + 2
        let target = index

        if (left < n && compare(currentHeap[target], currentHeap[left])) {
          target = left
        }
        if (right < n && compare(currentHeap[target], currentHeap[right])) {
          target = right
        }

        if (target === index) break

        [currentHeap[index], currentHeap[target]] = [currentHeap[target], currentHeap[index]]
        stepsSnapshot.push({
          description: `Swapped ${currentHeap[target]} and ${currentHeap[index]} during heapify.`,
          heap: [...currentHeap],
          highlightedIndices: [index, target],
          codeLine: 26,
        })
        index = target
      }
    }

    setHeap(currentHeap)
    setSteps(stepsSnapshot)
    setCurrentStep(0)
    setArrayInput("")
  }

  const stepForward = () => setCurrentStep(prev => Math.min(prev + 1, steps.length - 1))
  const stepBack = () => setCurrentStep(prev => Math.max(prev - 1, 0))
  const reset = () => resetHeap()

  useEffect(() => {
    if (steps[currentStep]) {
      setCurrentCodeLine(steps[currentStep].codeLine)
    }
  }, [currentStep, steps])

  const currentStepData = steps[currentStep] || {
    description: "Ready to perform an operation.",
    heap,
    highlightedIndices: [],
    codeLine: -1,
  }

  const renderHeap = () => {
    if (currentStepData.heap.length === 0) {
      return <div className="text-muted-foreground italic">Heap is empty</div>
    }
    return (
      <div className="flex flex-wrap gap-2 justify-center">
        {currentStepData.heap.map((val, i) => (
          <div
            key={i}
            className={`w-12 h-12 flex items-center justify-center rounded border font-mono text-sm
              ${currentStepData.highlightedIndices.includes(i)
                ? "border-primary bg-primary/10 ring-2 ring-primary/30"
                : "border-muted bg-background"}
            `}
          >
            {val}
          </div>
        ))}
      </div>
    )
  }

  return (
    <VisualizerLayout
      title="Heap Visualizer"
      description="Understand min-heaps and max-heaps, heapify operations, and priority queue implementations"
      difficulty="Intermediate"
      isPlaying={false}
      onPlay={() => {}}
      onPause={() => {}}
      onStepBack={stepBack}
      onStepForward={stepForward}
      onReset={reset}
      currentStep={currentStep}
      totalSteps={steps.length}
      complexity={{
        time: "Insert/Extract: O(log n), Build-Heap: O(n), Peek: O(1)",
        space: "O(n)",
      }}
      applications={applications}
    >
      <div className="w-full space-y-6">
        <Card className="bg-orange-50 border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BarChart3 className="h-5 w-5" />
              What is a Heap?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="space-y-2 text-sm">
              <p>
                A <strong>heap</strong> is a complete binary tree that satisfies the <em>heap property</em>.
                It is implemented as an array for efficiency.
              </p>
              <p>
                <strong>Floyd’s Build-Heap</strong> constructs a heap from an unsorted array in <strong>O(n)</strong> time by heapifying from the last non-leaf node upward.
              </p>
            </CardDescription>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Heap Type</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant={heapType === "min" ? "default" : "outline"}
                size="sm"
                onClick={() => setHeapType("min")}
                className="w-full justify-start"
              >
                Min-Heap
              </Button>
              <Button
                variant={heapType === "max" ? "default" : "outline"}
                size="sm"
                onClick={() => setHeapType("max")}
                className="w-full justify-start"
              >
                Max-Heap
              </Button>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Operations</CardTitle>
            </CardHeader>
            <CardContent className="flex gap-2 flex-wrap">
              <Input
                type="number"
                placeholder="Value"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="flex-1 min-w-[120px]"
              />
              <Button onClick={handleInsert} className="gap-1">
                <Plus className="h-4 w-4" /> Insert
              </Button>
              <Button variant="destructive" onClick={handleExtract} className="gap-1">
                <Zap className="h-4 w-4" /> Extract Root
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Reset</CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={reset} className="w-full" variant="outline">
                Clear Heap
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle className="text-lg">Build Heap from Array</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-2 flex-wrap">
            <Input
              placeholder="e.g., 4,10,3,5,1"
              value={arrayInput}
              onChange={(e) => setArrayInput(e.target.value)}
              className="flex-1 min-w-[200px]"
            />
            <Button onClick={buildHeapFromArray} className="gap-1">
              <BarChart3 className="h-4 w-4" /> Build Heap
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Heap ({heapType})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="min-h-24 p-4 bg-muted/10 rounded flex items-center justify-center">
              {renderHeap()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pseudocode</CardTitle>
          </CardHeader>
          <div className="font-mono text-sm bg-muted p-4 rounded-md max-h-96 overflow-y-auto">
            {pseudocode.map((line, index) => (
              <div
                key={index}
                className={`
                  py-1 px-2 rounded
                  ${currentCodeLine === index + 1
                    ? "bg-primary/20 border-l-4 border-primary text-primary-foreground"
                    : "text-muted-foreground"
                  }
                `}
              >
                <span className="text-xs text-muted-foreground/70 mr-3">{index + 1}</span>
                {line || "\u00A0"}
              </div>
            ))}
          </div>
        </Card>

        {steps.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Current Step</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm p-3 bg-accent/10 rounded-lg border border-accent/20">
                {currentStepData.description}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Legend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded border-2 border-primary bg-primary/10"></div>
                <span>Highlighted Node</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="font-mono">42</Badge>
                <span>Heap Element</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </VisualizerLayout>
  )
}