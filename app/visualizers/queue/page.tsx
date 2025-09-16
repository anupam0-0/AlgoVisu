
"use client"
interface QueueElement {
  value: number;
  isFront?: boolean;
  isPeeked?: boolean;
}

import { useState, useEffect } from "react"
import { VisualizerLayout } from "../../../components/visualizer-layout"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { Badge } from "../../../components/ui/badge"
import { Layers, Plus, Trash2, Eye } from "lucide-react"
import { Queue } from "../../../lib/data-structures"

export default function QueueVisualizerPage() {
  const [queue, setQueue] = useState<QueueElement[]>([
    { value: 10 },
    { value: 20 },
    { value: 30 },
    { value: 40 },
  ])
  const [inputValue, setInputValue] = useState("")
  const [steps, setSteps] = useState<string[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [peekedValue, setPeekedValue] = useState<number | null>(null)

  const applications = [
    {
      title: "Task Scheduling",
      description: "Queues manage tasks in order of arrival for processing.",
      examples: ["Print queue", "CPU scheduling", "Customer service systems"],
    },
    {
      title: "Data Buffering",
      description: "Queues buffer data streams for smooth processing.",
      examples: ["Network packet buffering", "Audio/video streaming"],
    },
    {
      title: "Breadth-First Search (BFS)",
      description: "Queues are used to explore nodes level by level in graphs.",
      examples: ["Shortest path algorithms", "Web crawlers"],
    },
  ]

  const resetQueue = () => {
    setQueue([
      { value: 10 },
      { value: 20 },
      { value: 30 },
      { value: 40 },
    ])
    setSteps([])
    setCurrentStep(0)
    setIsPlaying(false)
    setPeekedValue(null)
  }

  const enqueue = () => {
    if (inputValue && !isNaN(Number(inputValue))) {
      const value = Number(inputValue)
      setQueue((prev) => [...prev, { value }])
      setSteps((prev) => [
        ...prev,
        `Enqueued ${value} to the queue.`
      ])
      setInputValue("")
    }
  }

  const dequeue = () => {
    if (queue.length > 0) {
      const removed = queue[0].value
      setQueue((prev) => prev.slice(1))
      setSteps((prev) => [
        ...prev,
        `Dequeued ${removed} from the queue.`
      ])
      setPeekedValue(null)
    }
  }

  const peek = () => {
    if (queue.length > 0) {
      setPeekedValue(queue[0].value)
      setSteps((prev) => [
        ...prev,
        `Peeked at the front: ${queue[0].value}`
      ])
    }
  }

  const removeElement = (index: number) => {
    setQueue((prev) => prev.filter((_, i) => i !== index))
    setSteps((prev) => [
      ...prev,
      `Removed element at index ${index} from the queue.`
    ])
    setPeekedValue(null)
  }

  const stepForward = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const stepBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const play = () => {
    setIsPlaying(true)
  }

  const pause = () => {
    setIsPlaying(false)
  }

  useEffect(() => {
    if (isPlaying && currentStep < steps.length - 1) {
      const timer = setTimeout(() => {
        setCurrentStep(currentStep + 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (currentStep >= steps.length - 1) {
      setIsPlaying(false)
    }
  }, [isPlaying, currentStep, steps.length])

  return (
    <VisualizerLayout
      title="Queue Visualizer"
      description="Learn queue operations: enqueue, dequeue, and peek"
      difficulty="Beginner"
      isPlaying={isPlaying}
      onPlay={play}
      onPause={pause}
      onStepBack={stepBack}
      onStepForward={stepForward}
      onReset={resetQueue}
      currentStep={currentStep}
      totalSteps={steps.length}
      complexity={{
        time: "O(1)",
        space: "O(n)",
      }}
      applications={applications}
    >
      <div className="w-full space-y-6">
        {/* Queue Visualization */}
        <div className="flex flex-wrap gap-2 justify-center min-h-[120px] items-center">
          {queue.length === 0 ? (
            <span className="text-muted-foreground">Queue is empty</span>
          ) : (
            queue.map((element, index) => (
              <div key={index} className="relative">
                <div
                  className={`
                    w-16 h-16 border-2 rounded-lg flex flex-col items-center justify-center
                    transition-all duration-300 cursor-pointer group
                    ${
                      index === 0
                        ? "bg-blue-100 border-blue-500 text-blue-800"
                        : "bg-card border-border hover:border-accent/50"
                    }
                  `}
                >
                  <span className="font-mono font-bold text-sm">{element.value}</span>
                  <span className="text-xs text-muted-foreground">[{index}]</span>
                  {index === 0 && <Badge variant="outline" className="mt-1 text-xs">Front</Badge>}
                  {peekedValue !== null && index === 0 && (
                    <Badge variant="secondary" className="mt-1 text-xs">Peeked: {peekedValue}</Badge>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute -top-2 -right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeElement(index)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))
          )}
        </div>

        {/* Controls */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Enqueue</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Enter number"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
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
            <CardContent className="space-y-3">
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
            <CardContent className="space-y-3">
              <Button onClick={peek} disabled={queue.length === 0} className="w-full">
                <Eye className="h-4 w-4 mr-2" />
                Peek
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Algorithm Steps */}
        {steps.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Operation Steps</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {steps.map((step, index) => (
                  <div
                    key={index}
                    className={`text-sm p-2 rounded ${
                      index === currentStep
                        ? "bg-accent/20 border border-accent"
                        : index < currentStep
                          ? "bg-muted/50 text-muted-foreground"
                          : "text-muted-foreground"
                    }`}
                  >
                    <Badge variant="outline" className="mr-2 text-xs">
                      {index + 1}
                    </Badge>
                    {step}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </VisualizerLayout>
  )
}
