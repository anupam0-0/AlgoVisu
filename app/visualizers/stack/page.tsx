"use client"

import { useState, useEffect } from "react"
import { VisualizerLayout } from "../../../components/visualizer-layout"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { Badge } from "../../../components/ui/badge"
import { Plus, Minus, Eye } from "lucide-react"

interface StackElement {
  value: string | number
  id: number
  isHighlighted?: boolean
  isPopped?: boolean
}

interface StackOperation {
  type: "push" | "pop" | "peek"
  value?: string | number
  description: string
}

export default function StackVisualizerPage() {
  const [stack, setStack] = useState<StackElement[]>([
    { value: "Bottom", id: 0 },
    { value: 42, id: 1 },
    { value: "Hello", id: 2 },
  ])
  const [inputValue, setInputValue] = useState("")
  const [operations, setOperations] = useState<StackOperation[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [lastOperation, setLastOperation] = useState<string>("")
  const [peekedValue, setPeekedValue] = useState<string | number | null>(null)

  const applications = [
    {
      title: "Function Call Management",
      description: "Programming languages use stacks to manage function calls and local variables",
      examples: ["Call stack in debuggers", "Recursion handling", "Memory management"],
    },
    {
      title: "Expression Evaluation",
      description: "Stacks evaluate mathematical expressions and check balanced parentheses",
      examples: ["Calculator applications", "Compiler syntax parsing", "Formula validation"],
    },
    {
      title: "Undo Operations",
      description: "Applications use stacks to implement undo/redo functionality",
      examples: ["Text editors", "Image editing software", "Version control systems"],
    },
    {
      title: "Browser Navigation",
      description: "Web browsers use stacks to manage page history and navigation",
      examples: ["Back button functionality", "Tab management", "Session history"],
    },
  ]

  const resetStack = () => {
    setStack([
      { value: "Bottom", id: 0 },
      { value: 42, id: 1 },
      { value: "Hello", id: 2 },
    ])
    setOperations([])
    setCurrentStep(0)
    setIsPlaying(false)
    setLastOperation("")
    setPeekedValue(null)
  }

  const pushElement = () => {
    if (inputValue.trim()) {
      const newElement: StackElement = {
        value: isNaN(Number(inputValue)) ? inputValue : Number(inputValue),
        id: Date.now(),
        isHighlighted: true,
      }

      const newStack = [...stack, newElement]
      setStack(newStack)

      const operation: StackOperation = {
        type: "push",
        value: newElement.value,
        description: `Pushed "${newElement.value}" onto the stack`,
      }
      setOperations([...operations, operation])
      setLastOperation(`Pushed: ${newElement.value}`)
      setInputValue("")

      // Remove highlight after animation
      setTimeout(() => {
        setStack((prev) => prev.map((el) => ({ ...el, isHighlighted: false })))
      }, 500)
    }
  }

  const popElement = () => {
    if (stack.length > 0) {
      const poppedElement = stack[stack.length - 1]

      // Highlight the element being popped
      setStack((prev) => prev.map((el, idx) => (idx === prev.length - 1 ? { ...el, isPopped: true } : el)))

      const operation: StackOperation = {
        type: "pop",
        value: poppedElement.value,
        description: `Popped "${poppedElement.value}" from the stack`,
      }
      setOperations([...operations, operation])
      setLastOperation(`Popped: ${poppedElement.value}`)

      // Remove element after animation
      setTimeout(() => {
        setStack((prev) => prev.slice(0, -1))
      }, 300)
    }
  }

  const peekElement = () => {
    if (stack.length > 0) {
      const topElement = stack[stack.length - 1]
      setPeekedValue(topElement.value)

      // Highlight the top element
      setStack((prev) =>
        prev.map((el, idx) =>
          idx === prev.length - 1 ? { ...el, isHighlighted: true } : { ...el, isHighlighted: false },
        ),
      )

      const operation: StackOperation = {
        type: "peek",
        value: topElement.value,
        description: `Peeked at top element: "${topElement.value}"`,
      }
      setOperations([...operations, operation])
      setLastOperation(`Peeked: ${topElement.value}`)

      // Remove highlight after animation
      setTimeout(() => {
        setStack((prev) => prev.map((el) => ({ ...el, isHighlighted: false })))
        setPeekedValue(null)
      }, 2000)
    }
  }

  const stepForward = () => {
    if (currentStep < operations.length - 1) {
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
    if (isPlaying && currentStep < operations.length - 1) {
      const timer = setTimeout(() => {
        setCurrentStep(currentStep + 1)
      }, 1500)
      return () => clearTimeout(timer)
    } else if (currentStep >= operations.length - 1) {
      setIsPlaying(false)
    }
  }, [isPlaying, currentStep, operations.length])

  return (
    <VisualizerLayout
      title="Stack Visualizer"
      description="Learn LIFO (Last In, First Out) operations with push, pop, and peek"
      difficulty="Beginner"
      isPlaying={isPlaying}
      onPlay={play}
      onPause={pause}
      onStepBack={stepBack}
      onStepForward={stepForward}
      onReset={resetStack}
      currentStep={currentStep}
      totalSteps={operations.length}
      complexity={{
        time: "O(1)",
        space: "O(n)",
      }}
      applications={applications}
    >
      <div className="w-full space-y-6">
        {/* Stack Visualization */}
        <div className="flex flex-col items-center space-y-2">
          <div className="text-sm text-muted-foreground mb-2">
            Top of Stack {peekedValue && <Badge variant="secondary">Peeking: {peekedValue}</Badge>}
          </div>

          <div className="flex flex-col-reverse space-y-reverse space-y-1 min-h-[200px] justify-end">
            {stack.map((element, index) => (
              <div
                key={element.id}
                className={`
                  w-32 h-12 border-2 rounded-lg flex items-center justify-center
                  transition-all duration-300 relative
                  ${
                    element.isHighlighted
                      ? "bg-accent/20 border-accent scale-105"
                      : element.isPopped
                        ? "bg-red-100 border-red-500 scale-95 opacity-50"
                        : "bg-card border-border"
                  }
                `}
                style={{
                  transform: element.isPopped ? "translateX(100px)" : "translateX(0)",
                }}
              >
                <span className="font-mono font-bold text-sm">{element.value}</span>
                {index === stack.length - 1 && (
                  <div className="absolute -right-8 top-1/2 transform -translate-y-1/2">
                    <div className="text-xs text-accent font-medium">← TOP</div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="text-sm text-muted-foreground mt-2">Bottom of Stack</div>
        </div>

        {/* Stack Operations */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Push
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                placeholder="Enter value to push"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && pushElement()}
              />
              <Button onClick={pushElement} disabled={!inputValue.trim()} className="w-full">
                Push to Stack
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Minus className="h-5 w-5" />
                Pop
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">Remove the top element from the stack</p>
              <Button onClick={popElement} disabled={stack.length === 0} className="w-full" variant="destructive">
                Pop from Stack
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Peek
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">View the top element without removing it</p>
              <Button
                onClick={peekElement}
                disabled={stack.length === 0}
                className="w-full bg-transparent"
                variant="outline"
              >
                Peek at Top
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Stack Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Stack Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-accent">{stack.length}</div>
                <div className="text-sm text-muted-foreground">Size</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-accent">
                  {stack.length > 0 ? stack[stack.length - 1].value : "Empty"}
                </div>
                <div className="text-sm text-muted-foreground">Top Element</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-accent">{stack.length === 0 ? "Yes" : "No"}</div>
                <div className="text-sm text-muted-foreground">Is Empty</div>
              </div>
              <div>
                <div className="text-sm font-medium text-accent">{lastOperation || "No operations yet"}</div>
                <div className="text-sm text-muted-foreground">Last Operation</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Operations History */}
        {operations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Operations History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {operations.map((operation, index) => (
                  <div
                    key={index}
                    className={`text-sm p-2 rounded flex items-center gap-2 ${
                      index === currentStep
                        ? "bg-accent/20 border border-accent"
                        : index < currentStep
                          ? "bg-muted/50 text-muted-foreground"
                          : "text-muted-foreground"
                    }`}
                  >
                    <Badge
                      variant={
                        operation.type === "push" ? "default" : operation.type === "pop" ? "destructive" : "secondary"
                      }
                      className="text-xs"
                    >
                      {operation.type.toUpperCase()}
                    </Badge>
                    {operation.description}
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
