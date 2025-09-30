"use client"

import { useState, useEffect, useMemo } from "react"
import { VisualizerLayout } from "../../../components/visualizer-layout"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { Badge } from "../../../components/ui/badge"
import { Plus, Trash2, ChevronRight, ArrowRight, Repeat, ArrowLeftRight, ArrowLeft } from "lucide-react"

interface NodeItem {
  value: string | number
  isHighlighted?: boolean
  isRemoved?: boolean
  isTraversed?: boolean
  nextId?: number
  prevId?: number
}

type ListType = "singly" | "doubly" | "circular"

function buildPointers(nodes: NodeItem[], listType: ListType): NodeItem[] {
  return nodes.map((node, i) => ({
    ...node,
    nextId: i < nodes.length - 1 ? i + 1 : (listType === "circular" && nodes.length > 1 ? 0 : undefined),
    prevId: (listType === "doubly" || listType === "circular") && i > 0 ? i - 1 : (listType === "circular" && i === 0 && nodes.length > 1 ? nodes.length - 1 : undefined)
  }))
}

export default function LinkedListVisualizerPage() {
  const [nodes, setNodes] = useState<NodeItem[]>(buildPointers([
    { value: 10 },
    { value: 20 },
    { value: 30 },
  ], "singly"))
  const [inputValue, setInputValue] = useState("")
  const [currentStep, setCurrentStep] = useState(0)
  const [operations, setOperations] = useState<string[]>([])
  const [isPlaying, setIsPlaying] = useState(false)
  const [traversalIndex, setTraversalIndex] = useState<number | null>(null)
  const [traversalDone, setTraversalDone] = useState(false)
  const [listType, setListType] = useState<ListType>("singly")
  const [traversalDirection, setTraversalDirection] = useState<"forward" | "backward">("forward")

  // Head and tail indices
  const headIndex = nodes.length > 0 ? 0 : null
  const tailIndex = nodes.length > 0 ? nodes.length - 1 : null

  // Rebuild pointers on list type change
  useEffect(() => {
    setNodes(prev => buildPointers(prev, listType))
    setTraversalIndex(null)
    setTraversalDone(false)
    setCurrentStep(0)
  }, [listType])

  const resetList = () => {
    setNodes(buildPointers([
      { value: 10 },
      { value: 20 },
      { value: 30 },
    ], listType))
    setOperations([])
    setCurrentStep(0)
    setIsPlaying(false)
    setTraversalIndex(null)
    setTraversalDone(false)
  }

  const appendNode = () => {
    if (!inputValue.trim()) return
    const newValue = isNaN(Number(inputValue)) ? inputValue : Number(inputValue)
    setNodes(prev => buildPointers([...prev, { value: newValue, isHighlighted: true }], listType))
    setOperations(prev => [...prev, `Appended ${newValue}`])
    setInputValue("")
    setTraversalDone(false)
    setTimeout(() => {
      setNodes(prev => prev.map(n => ({ ...n, isHighlighted: false })))
    }, 400)
  }

  const prependNode = () => {
    if (!inputValue.trim()) return
    const newValue = isNaN(Number(inputValue)) ? inputValue : Number(inputValue)
    setNodes(prev => buildPointers([{ value: newValue, isHighlighted: true }, ...prev], listType))
    setOperations(prev => [...prev, `Prepended ${newValue}`])
    setInputValue("")
    setTraversalDone(false)
    setTimeout(() => {
      setNodes(prev => prev.map(n => ({ ...n, isHighlighted: false })))
    }, 400)
  }

  const removeNode = (index: number) => {
    setNodes(prev => prev.map((n, i) => i === index ? { ...n, isRemoved: true } : n))
    const node = nodes[index]
    setOperations(prev => [...prev, `Removed ${node?.value}`])
    setTimeout(() => {
      setNodes(prev => buildPointers(prev.filter((_, i) => i !== index), listType))
      setTraversalIndex(null)
      setTraversalDone(false)
    }, 300)
  }

  // Get node by index
  const getNodeByIndex = (index: number | null) => index !== null && index >= 0 && index < nodes.length ? nodes[index] : null

  const startTraversal = (direction: "forward" | "backward" = "forward") => {
    setNodes(prev => prev.map(n => ({ ...n, isTraversed: false })))
    setTraversalDirection(direction)
    if (direction === "forward") {
      setTraversalIndex(headIndex)
      setOperations(prev => [...prev, `Started forward traversal`])
    } else {
      setTraversalIndex(tailIndex)
      setOperations(prev => [...prev, `Started backward traversal`])
    }
    setCurrentStep(0)
    setTraversalDone(false)
  }

  const stepForward = () => {
    if (traversalIndex === null) return
    setNodes(prev => prev.map((n, i) => i === traversalIndex ? { ...n, isTraversed: true } : n))
    const current = getNodeByIndex(traversalIndex)
    let nextIndex: number | null | undefined
    if (traversalDirection === "forward") {
      nextIndex = current?.nextId
      if (listType === "circular" && nextIndex === headIndex) nextIndex = null
    } else {
      nextIndex = current?.prevId
      if (listType === "circular" && nextIndex === tailIndex) nextIndex = null
    }
    if (nextIndex !== undefined && nextIndex !== null && getNodeByIndex(nextIndex)) {
      setTraversalIndex(nextIndex)
      setCurrentStep(s => s + 1)
    } else {
      setTraversalIndex(null)
      setIsPlaying(false)
      setTraversalDone(true)
    }
  }

  const stepBack = () => {
    if (traversalIndex === null) return
    let prevIndex: number | null | undefined
    if (traversalDirection === "forward") {
      prevIndex = getNodeByIndex(traversalIndex)?.prevId
    } else {
      prevIndex = getNodeByIndex(traversalIndex)?.nextId
    }
    if (prevIndex !== undefined && prevIndex !== null && prevIndex >= 0 && prevIndex < nodes.length) {
      setNodes(prev => prev.map((n, i) => i === prevIndex ? { ...n, isTraversed: false } : n))
      setTraversalIndex(prevIndex)
      setCurrentStep(s => s - 1)
      setTraversalDone(false)
    }
  }

  const play = () => {
    if (nodes.length === 0) return
    setIsPlaying(true)
    if (traversalIndex === null) startTraversal(traversalDirection)
    setTraversalDone(false)
  }

  const pause = () => setIsPlaying(false)

  useEffect(() => {
    if (isPlaying && traversalIndex !== null) {
      const timer = setTimeout(() => {
        stepForward()
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [isPlaying, traversalIndex, nodes.length])

  useEffect(() => {
    if (traversalDone) {
      setNodes(prev => prev.map(n => ({ ...n, isTraversed: true })))
    }
  }, [traversalDone])

  // List type selection UI
  const listTypeOptions = [
    { value: "singly", label: "Singly Linked List", icon: <ChevronRight className="inline h-4 w-4" /> },
    { value: "doubly", label: "Doubly Linked List", icon: <ArrowLeftRight className="inline h-4 w-4" /> },
    { value: "circular", label: "Circular Linked List", icon: <Repeat className="inline h-4 w-4" /> },
  ]

  // For rendering, follow pointers from head
  const renderNodes = useMemo(() => {
    if (nodes.length === 0) return []
    
    const result: (NodeItem & { index: number })[] = []
    const visited = new Set<number>()
    let currentIndex = headIndex
    
    while (currentIndex !== null && !visited.has(currentIndex)) {
      const node = getNodeByIndex(currentIndex)
      if (!node) break
      
      result.push({ ...node, index: currentIndex })
      visited.add(currentIndex)
      
      // Stop if we've completed a full circle in circular list
      if (listType === "circular" && result.length > 1 && currentIndex === headIndex) break
      
      currentIndex = node.nextId ?? null
    }
    
    return result
  }, [nodes, headIndex, listType])

  const applications = [
    {
      title: "Dynamic Memory",
      description: "Linked lists allow efficient insertions and deletions without reallocating entire structures",
      examples: ["Memory allocators", "Adjacency lists", "Undo/Redo lists"],
    },
    {
      title: "Flexible Data Structures",
      description: "Used where size changes frequently and random access is not required",
      examples: ["Implementing stacks/queues", "Graph representations", "Sparse data"],
    },
  ]

  return (
    <VisualizerLayout
      title="Linked List Visualizer"
      description="Visualize singly, doubly, and circular linked list operations: insert, delete, and traversal"
      difficulty="Advanced"
      isPlaying={isPlaying}
      onPlay={play}
      onPause={pause}
      onStepBack={stepBack}
      onStepForward={stepForward}
      onReset={resetList}
      currentStep={currentStep}
      totalSteps={Math.max(operations.length, nodes.length)}
      complexity={{
        time: "O(n)",
        space: "O(n)",
      }}
      applications={applications}
    >
      <div className="w-full space-y-6">
        {/* List type selection */}
        <div className="flex gap-2 items-center mb-2">
          <span className="font-semibold">List Type:</span>
          {listTypeOptions.map((opt) => (
            <Button
              key={opt.value}
              variant={listType === opt.value ? "secondary" : "outline"}
              size="sm"
              onClick={() => setListType(opt.value as ListType)}
              className="flex items-center gap-1"
            >
              {opt.icon}
              {opt.label}
            </Button>
          ))}
        </div>

        {/* Linked list visualization */}
        <div className="flex items-center justify-center gap-4 overflow-x-auto py-4 min-h-[140px]">
          {renderNodes.length === 0 ? (
            <div className="text-muted-foreground">List is empty</div>
          ) : (
            <div className="flex items-center relative">
              {/* HEAD indicator */}
              {listType !== "circular" && (
                <div className="flex flex-col items-center mr-4">
                  <div className="text-xs text-muted-foreground mb-1">HEAD</div>
                  <div className="w-8 h-0.5 bg-primary"></div>
                </div>
              )}

              {/* Nodes and arrows */}
              {renderNodes.map((node, idx) => {
                const hasNext = node.nextId !== undefined && node.nextId >= 0 && node.nextId < nodes.length
                const hasPrev = node.prevId !== undefined && node.prevId >= 0 && node.prevId < nodes.length
                
                return (
                  <div key={node.index} className="flex items-center gap-2 relative">
                    {/* Node */}
                    <div
                      className={`
                        w-24 h-20 border-2 rounded-lg flex flex-col items-center justify-center relative
                        transition-all duration-300 z-10
                        ${
                          node.isRemoved
                            ? "bg-red-100 border-red-500 opacity-60 line-through"
                            : traversalIndex === node.index
                              ? "bg-blue-200 border-blue-500 scale-105 shadow-lg"
                              : node.isTraversed
                                ? "bg-green-200 border-green-500"
                                : node.isHighlighted
                                  ? "bg-accent/20 border-accent scale-105"
                                  : "bg-card border-border"
                        }
                      `}
                    >
                      <div className="font-mono font-bold text-lg">{node.value}</div>
                      <div className="absolute -bottom-6 text-xs text-muted-foreground">
                        Index: {node.index}
                      </div>
                    </div>

                    {/* Arrows */}
                    {hasNext && (
                      <div className="flex flex-col items-center">
                        {(listType === "singly" || listType === "circular") && (
                          <ChevronRight className="h-6 w-6 text-accent" />
                        )}
                        {listType === "doubly" && (
                          <div className="flex flex-col items-center">
                            <ChevronRight className="h-6 w-6 text-accent" />
                            <ArrowLeft className="h-6 w-6 text-accent -mt-2" />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}

              {/* TAIL indicator */}
              {listType !== "circular" && (
                <div className="flex flex-col items-center ml-4">
                  <div className="w-8 h-0.5 bg-primary"></div>
                  <div className="text-xs text-muted-foreground mt-1">TAIL</div>
                </div>
              )}

              {/* Circular connection arrow */}
              {listType === "circular" && renderNodes.length > 1 && (
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-accent/30 -z-10">
                  <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2">
                    <Repeat className="h-5 w-5 text-accent rotate-90" />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Insert
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                placeholder="Value to insert"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && appendNode()}
              />
              <div className="flex gap-2">
                <Button onClick={appendNode} disabled={!inputValue.trim()} className="w-full">
                  Append
                </Button>
                <Button onClick={prependNode} disabled={!inputValue.trim()} className="w-full" variant="outline">
                  Prepend
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Trash2 className="h-5 w-5" />
                Delete
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">Click the trash icon on a node to remove it</p>
              <div className="flex flex-wrap gap-2">
                {renderNodes.map((n) => (
                  <Button key={n.index} variant="destructive" size="sm" onClick={() => removeNode(n.index)}>
                    Delete {n.value}
                  </Button>
                ))}
                {renderNodes.length === 0 && <div className="text-sm text-muted-foreground">No nodes to delete</div>}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <ArrowRight className="h-5 w-5" />
                Traverse
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2 flex-wrap">
                <Button 
                  onClick={() => startTraversal("forward")} 
                  disabled={renderNodes.length === 0}
                  className="w-full sm:w-auto"
                >
                  Start Forward
                </Button>
                {(listType === "doubly" || listType === "circular") && (
                  <Button 
                    onClick={() => startTraversal("backward")} 
                    disabled={renderNodes.length === 0}
                    className="w-full sm:w-auto"
                    variant="outline"
                  >
                    Start Backward
                  </Button>
                )}
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={stepBack} 
                  disabled={traversalIndex === null}
                  variant="outline"
                >
                  Back
                </Button>
                <Button
                  onClick={stepForward}
                  disabled={traversalIndex === null}
                  variant="outline"
                >
                  Next
                </Button>
              </div>

              <div className="text-sm text-muted-foreground mt-2">
                Current:{" "}
                {traversalIndex === null ? "—" : `${getNodeByIndex(traversalIndex)?.value} (index ${traversalIndex})`}
                {traversalIndex !== null && ` | Direction: ${traversalDirection}`}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Operations / Steps */}
        {operations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Operations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {operations.map((op, i) => (
                  <div
                    key={i}
                    className={`text-sm p-2 rounded ${
                      i === currentStep
                        ? "bg-accent/20 border border-accent"
                        : i < currentStep
                          ? "bg-muted/50 text-muted-foreground"
                          : "text-muted-foreground"
                    }`}
                  >
                    <Badge variant="outline" className="mr-2 text-xs">
                      {i + 1}
                    </Badge>
                    {op}
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