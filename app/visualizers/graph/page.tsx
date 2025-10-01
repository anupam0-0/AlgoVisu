"use client"

import { useState, useEffect } from "react"
import { VisualizerLayout } from "../../../components/visualizer-layout"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { Badge } from "../../../components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select"
import { Switch } from "../../../components/ui/switch"
import { Label } from "../../../components/ui/label"
import { Plus, Shuffle, X } from "lucide-react"
import type { JSX } from "react/jsx-runtime"

interface GraphNode {
  id: string
  label: string
  x: number
  y: number
  isVisited?: boolean
  isCurrentNode?: boolean
  isStartNode?: boolean
  isTargetNode?: boolean
  distance?: number
}

interface GraphEdge {
  from: string
  to: string
  weight?: number
  isHighlighted?: boolean
  isInPath?: boolean
}

interface TraversalStep {
  currentNode: string
  visitedNodes: string[]
  queue?: string[]
  stack?: string[]
  description: string
  highlightedEdges: string[]
  distances?: { [key: string]: number }
}

type AlgorithmType = "bfs" | "dfs" | "dijkstra"

// --- Pseudocode Definitions ---
const pseudocodeDefinitions = {
  bfs: [
    "function BFS(start):",
    "  create queue Q",
    "  mark start as visited",
    "  Q.enqueue(start)",
    "  while Q is not empty:",
    "    node = Q.dequeue()",
    "    for each neighbor of node:",
    "      if neighbor not visited:",
    "        mark neighbor as visited",
    "        Q.enqueue(neighbor)",
  ],
  dfs: [
    "function DFS(start):",
    "  create stack S",
    "  S.push(start)",
    "  while S is not empty:",
    "    node = S.pop()",
    "    if node not visited:",
    "      mark node as visited",
    "      for each neighbor of node:",
    "        if neighbor not visited:",
    "          S.push(neighbor)",
  ],
  dijkstra: [
    "function Dijkstra(start):",
    "  set distance[start] = 0",
    "  for all nodes v ≠ start: distance[v] = ∞",
    "  create min-priority queue Q",
    "  Q.insert(start, 0)",
    "  while Q is not empty:",
    "    u = Q.extractMin()",
    "    for each neighbor v of u:",
    "      alt = distance[u] + weight(u, v)",
    "      if alt < distance[v]:",
    "        distance[v] = alt",
    "        Q.decreaseKey(v, alt)",
  ],
}

// Helper to reconstruct path from BFS/DFS traversal
function reconstructPath(
  edges: GraphEdge[],
  start: string,
  target: string,
  parentMap: { [key: string]: string }
): string[] {
  const path: string[] = []
  let current = target
  while (current !== start && parentMap[current]) {
    path.push(current)
    current = parentMap[current]
  }
  if (current === start) path.push(start)
  return path.reverse()
}

export default function GraphVisualizerPage() {
  const [nodes, setNodes] = useState<GraphNode[]>([])
  const [edges, setEdges] = useState<GraphEdge[]>([])
  const [isDirected, setIsDirected] = useState(false)
  const [isWeighted, setIsWeighted] = useState(false)
  const [algorithm, setAlgorithm] = useState<AlgorithmType>("bfs")
  const [startNode, setStartNode] = useState<string>("")
  const [targetNode, setTargetNode] = useState<string>("")
  const [newNodeLabel, setNewNodeLabel] = useState("")
  const [edgeFrom, setEdgeFrom] = useState("")
  const [edgeTo, setEdgeTo] = useState("")
  const [edgeWeight, setEdgeWeight] = useState("")
  const [traversalSteps, setTraversalSteps] = useState<TraversalStep[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentPseudocode, setCurrentPseudocode] = useState<string[]>(pseudocodeDefinitions.bfs)
  const [currentCodeLine, setCurrentCodeLine] = useState<number>(-1)

  // New state for delete controls
  const [deleteVertexId, setDeleteVertexId] = useState<string>("")
  const [deleteEdgeFrom, setDeleteEdgeFrom] = useState<string>("")
  const [deleteEdgeTo, setDeleteEdgeTo] = useState<string>("")

  // State for editing edge weight
  const [editEdgeFrom, setEditEdgeFrom] = useState<string>("")
  const [editEdgeTo, setEditEdgeTo] = useState<string>("")
  const [editEdgeWeight, setEditEdgeWeight] = useState<string>("")

  const applications = [
    {
      title: "Social Network Analysis",
      description: "Graph algorithms analyze connections and relationships in social media platforms",
      examples: ["Friend recommendations", "Community detection", "Influence measurement"],
    },
    {
      title: "Navigation Systems",
      description: "GPS and mapping services use graph algorithms to find optimal routes",
      examples: ["Google Maps routing", "Traffic optimization", "Shortest path finding"],
    },
    {
      title: "Network Infrastructure",
      description: "Internet routing and network topology optimization rely on graph algorithms",
      examples: ["Internet routing protocols", "Network reliability", "Load balancing"],
    },
    {
      title: "Recommendation Systems",
      description: "E-commerce and streaming platforms use graphs to suggest relevant content",
      examples: ["Product recommendations", "Content discovery", "Collaborative filtering"],
    },
  ]

  // Initialize with sample graph
  useEffect(() => {
    const sampleNodes: GraphNode[] = [
      { id: "A", label: "A", x: 150, y: 100 },
      { id: "B", label: "B", x: 300, y: 50 },
      { id: "C", label: "C", x: 450, y: 100 },
      { id: "D", label: "D", x: 150, y: 250 },
      { id: "E", label: "E", x: 300, y: 200 },
      { id: "F", label: "F", x: 450, y: 250 },
    ]

    const sampleEdges: GraphEdge[] = [
      { from: "A", to: "B", weight: 4 },
      { from: "A", to: "D", weight: 2 },
      { from: "B", to: "C", weight: 3 },
      { from: "B", to: "E", weight: 1 },
      { from: "C", to: "F", weight: 2 },
      { from: "D", to: "E", weight: 5 },
      { from: "E", to: "F", weight: 1 },
    ]

    setNodes(sampleNodes)
    setEdges(sampleEdges)
    setStartNode("A")
    setTargetNode("F")
  }, [])

  const addNode = () => {
    if (!newNodeLabel.trim()) return

    const newNode: GraphNode = {
      id: newNodeLabel.toUpperCase(),
      label: newNodeLabel.toUpperCase(),
      x: Math.random() * 400 + 100,
      y: Math.random() * 200 + 100,
    }

    if (!nodes.find((n) => n.id === newNode.id)) {
      setNodes([...nodes, newNode])
      setNewNodeLabel("")
    }
  }

  const removeNode = (nodeId: string) => {
    setNodes(nodes.filter((n) => n.id !== nodeId))
    setEdges(edges.filter((e) => e.from !== nodeId && e.to !== nodeId))
    if (startNode === nodeId) setStartNode("")
    if (targetNode === nodeId) setTargetNode("")
  }

  const addEdge = () => {
    if (!edgeFrom || !edgeTo || edgeFrom === edgeTo) return

    const weight = isWeighted ? Number.parseInt(edgeWeight) || 1 : undefined
    const newEdge: GraphEdge = {
      from: edgeFrom,
      to: edgeTo,
      weight,
    }

    // Check if edge already exists
    const existingEdge = edges.find((e) => e.from === edgeFrom && e.to === edgeTo)
    if (!existingEdge) {
      setEdges([...edges, newEdge])
      setEdgeFrom("")
      setEdgeTo("")
      setEdgeWeight("")
    }
  }

  const removeEdge = (from: string, to: string) => {
    setEdges(edges.filter((e) => !(e.from === from && e.to === to)))
  }

  const generateRandomGraph = () => {
    const nodeCount = 6
    const newNodes: GraphNode[] = []
    const newEdges: GraphEdge[] = []

    // Generate nodes
    for (let i = 0; i < nodeCount; i++) {
      const angle = (i * 2 * Math.PI) / nodeCount
      const radius = 120
      const centerX = 300
      const centerY = 150

      newNodes.push({
        id: String.fromCharCode(65 + i), // A, B, C, etc.
        label: String.fromCharCode(65 + i),
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
      })
    }

    // Generate random edges
    for (let i = 0; i < nodeCount; i++) {
      const connections = Math.floor(Math.random() * 3) + 1
      for (let j = 0; j < connections; j++) {
        const targetIndex = Math.floor(Math.random() * nodeCount)
        if (targetIndex !== i) {
          const weight = isWeighted ? Math.floor(Math.random() * 9) + 1 : undefined
          const edge: GraphEdge = {
            from: newNodes[i].id,
            to: newNodes[targetIndex].id,
            weight,
          }

          // Avoid duplicate edges
          if (!newEdges.find((e) => e.from === edge.from && e.to === edge.to)) {
            newEdges.push(edge)
          }
        }
      }
    }

    setNodes(newNodes)
    setEdges(newEdges)
    setStartNode(newNodes[0]?.id || "")
    setTargetNode(newNodes[nodeCount - 1]?.id || "")
  }

  const resetGraph = () => {
    setNodes(
      nodes.map((node) => ({
        ...node,
        isVisited: false,
        isCurrentNode: false,
        isStartNode: false,
        isTargetNode: false,
        distance: undefined,
      })),
    )
    setEdges(edges.map((edge) => ({ ...edge, isHighlighted: false, isInPath: false })))
    setTraversalSteps([])
    setCurrentStep(0)
    setIsPlaying(false)
  }

  // --- Pseudocode Step Helpers ---
  const highlightPseudocode = (algo: AlgorithmType, line: number) => {
    setCurrentPseudocode(pseudocodeDefinitions[algo])
    setCurrentCodeLine(line)
  }

  // --- Modified BFS/DFS to include pseudocode highlighting ---
  const performBFS = () => {
    if (!startNode) return

    const steps: TraversalStep[] = []
    const visited = new Set<string>()
    const queue = [startNode]
    const distances: { [key: string]: number } = { [startNode]: 0 }
    const parent: { [key: string]: string } = {}

    highlightPseudocode("bfs", 1) // function BFS(start)
    steps.push({
      currentNode: startNode,
      visitedNodes: [],
      queue: [...queue],
      description: `Starting BFS from node ${startNode}`,
      highlightedEdges: [],
      distances: { ...distances },
    })

    highlightPseudocode("bfs", 2) // create queue Q
    highlightPseudocode("bfs", 3) // mark start as visited
    highlightPseudocode("bfs", 4) // Q.enqueue(start)

    let found = false

    while (queue.length > 0) {
      highlightPseudocode("bfs", 5) // while Q is not empty
      const currentNode = queue.shift()!
      visited.add(currentNode)

      highlightPseudocode("bfs", 6) // node = Q.dequeue()
      steps.push({
        currentNode,
        visitedNodes: Array.from(visited),
        queue: [...queue],
        description: `Visiting node ${currentNode}`,
        highlightedEdges: [],
        distances: { ...distances },
      })

      // Find neighbors
      const neighbors = edges
        .filter((edge) => edge.from === currentNode)
        .map((edge) => edge.to)
        .filter((neighbor) => !visited.has(neighbor) && !queue.includes(neighbor))

      for (const neighbor of neighbors) {
        highlightPseudocode("bfs", 7) // for each neighbor of node
        highlightPseudocode("bfs", 8) // if neighbor not visited
        queue.push(neighbor)
        distances[neighbor] = distances[currentNode] + 1
        parent[neighbor] = currentNode
        highlightPseudocode("bfs", 9) // mark neighbor as visited
        highlightPseudocode("bfs", 10) // Q.enqueue(neighbor)

        steps.push({
          currentNode,
          visitedNodes: Array.from(visited),
          queue: [...queue],
          description: `Added ${neighbor} to queue`,
          highlightedEdges: [`${currentNode}-${neighbor}`],
          distances: { ...distances },
        })
      }

      if (targetNode && currentNode === targetNode) {
        found = true
        steps.push({
          currentNode,
          visitedNodes: Array.from(visited),
          queue: [...queue],
          description: `Found target node ${targetNode}!`,
          highlightedEdges: [],
          distances: { ...distances },
        })
        break
      }
    }

    // If found, mark the path nodes as green in the last step
    if (found) {
      const path = reconstructPath(edges, startNode, targetNode, parent)
      const lastStep = steps[steps.length - 1]
      const pathSet = new Set(path)
      // Add a new step with path info
      steps.push({
        ...lastStep,
        description: "Final path highlighted in green.",
        // Add a new property for path nodes
        highlightedEdges: lastStep.highlightedEdges,
        // Add a new property for path nodes
        // We'll use this in the renderGraph function
        pathNodes: path,
      } as any)
    }

    setTraversalSteps(steps)
    setCurrentPseudocode(pseudocodeDefinitions.bfs)
    setCurrentCodeLine(-1)
  }

  const performDFS = () => {
    if (!startNode) return

    const steps: TraversalStep[] = []
    const visited = new Set<string>()
    const stack = [startNode]

    highlightPseudocode("dfs", 1) // function DFS(start)
    steps.push({
      currentNode: startNode,
      visitedNodes: [],
      stack: [...stack],
      description: `Starting DFS from node ${startNode}`,
      highlightedEdges: [],
    })

    highlightPseudocode("dfs", 2) // create stack S
    highlightPseudocode("dfs", 3) // S.push(start)

    while (stack.length > 0) {
      highlightPseudocode("dfs", 4) // while S is not empty
      const currentNode = stack.pop()!

      if (visited.has(currentNode)) continue

      highlightPseudocode("dfs", 5) // node = S.pop()
      highlightPseudocode("dfs", 6) // if node not visited
      visited.add(currentNode)
      highlightPseudocode("dfs", 7) // mark node as visited

      steps.push({
        currentNode,
        visitedNodes: Array.from(visited),
        stack: [...stack],
        description: `Visiting node ${currentNode}`,
        highlightedEdges: [],
      })

      // Find neighbors (add in reverse order for correct DFS behavior)
      const neighbors = edges
        .filter((edge) => edge.from === currentNode)
        .map((edge) => edge.to)
        .filter((neighbor) => !visited.has(neighbor))
        .reverse()

      for (const neighbor of neighbors) {
        highlightPseudocode("dfs", 8) // for each neighbor of node
        highlightPseudocode("dfs", 9) // if neighbor not visited
        stack.push(neighbor)
        highlightPseudocode("dfs", 10) // S.push(neighbor)

        steps.push({
          currentNode,
          visitedNodes: Array.from(visited),
          stack: [...stack],
          description: `Added ${neighbor} to stack`,
          highlightedEdges: [`${currentNode}-${neighbor}`],
        })
      }

      if (targetNode && currentNode === targetNode) {
        steps.push({
          currentNode,
          visitedNodes: Array.from(visited),
          stack: [...stack],
          description: `Found target node ${targetNode}!`,
          highlightedEdges: [],
        })
        break
      }
    }

    setTraversalSteps(steps)
    setCurrentPseudocode(pseudocodeDefinitions.dfs)
    setCurrentCodeLine(-1)
  }

  const startAlgorithm = () => {
    resetGraph()
    setCurrentStep(0)

    switch (algorithm) {
      case "bfs":
        performBFS()
        break
      case "dfs":
        performDFS()
        break
      case "dijkstra":
        // Placeholder for Dijkstra's algorithm
        break
    }
  }

  const stepForward = () => {
    if (currentStep < traversalSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const stepBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const play = () => {
    if (traversalSteps.length === 0) {
      startAlgorithm()
    }
    setIsPlaying(true)
  }

  const pause = () => {
    setIsPlaying(false)
  }

  const reset = () => {
    resetGraph()
  }

  useEffect(() => {
    if (isPlaying && currentStep < traversalSteps.length - 1) {
      const timer = setTimeout(() => {
        stepForward()
      }, 1500)
      return () => clearTimeout(timer)
    } else if (currentStep >= traversalSteps.length - 1) {
      setIsPlaying(false)
    }
  }, [isPlaying, currentStep, traversalSteps.length])

  // --- Modified renderGraph to color path nodes green ---
  const renderGraph = (): JSX.Element => {
    const currentStepData = traversalSteps[currentStep]
    // For path coloring
    const pathNodes: string[] = (currentStepData as any)?.pathNodes || []

    return (
      <svg width="600" height="300" className="border rounded-lg bg-white">
        {/* Arrow marker for directed graphs */}
        {isDirected && (
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="10"
              refY="3.5"
              orient="auto"
              markerUnits="strokeWidth"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill="#6366f1" />
            </marker>
          </defs>
        )}

        {/* Render edges */}
        {edges.map((edge, index) => {
          const fromNode = nodes.find((n) => n.id === edge.from)
          const toNode = nodes.find((n) => n.id === edge.to)
          if (!fromNode || !toNode) return null

          // Calculate direction for arrowhead offset
          const dx = toNode.x - fromNode.x
          const dy = toNode.y - fromNode.y
          const len = Math.sqrt(dx * dx + dy * dy)
          const offset = 20 // node radius
          const normX = dx / len
          const normY = dy / len

          // Start and end points for the edge line (so arrowhead doesn't overlap node)
          const startX = fromNode.x + normX * offset
          const startY = fromNode.y + normY * offset
          const endX = toNode.x - normX * offset
          const endY = toNode.y - normY * offset

          const isHighlighted = currentStepData?.highlightedEdges.includes(`${edge.from}-${edge.to}`)

          // Highlight edge green if both nodes are in pathNodes and consecutive
          const isPathEdge =
            pathNodes.length > 1 &&
            pathNodes.some((id, idx) => idx < pathNodes.length - 1 && pathNodes[idx] === edge.from && pathNodes[idx + 1] === edge.to)

          return (
            <g key={index}>
              <line
                x1={startX}
                y1={startY}
                x2={endX}
                y2={endY}
                stroke={
                  isPathEdge
                    ? "#22c55e"
                    : isHighlighted
                    ? "#6366f1"
                    : "#e5e7eb"
                }
                strokeWidth={isPathEdge ? "4" : isHighlighted ? "3" : "2"}
                markerEnd={isDirected ? "url(#arrowhead)" : undefined}
                style={{ transition: "stroke 0.3s, stroke-width 0.3s" }}
              />
              {isWeighted && edge.weight !== undefined && (
                <text
                  x={(startX + endX) / 2 + 10 * -normY}
                  y={(startY + endY) / 2 + 10 * normX}
                  textAnchor="middle"
                  className="text-xs font-bold fill-blue-600"
                  style={{ userSelect: "none" }}
                >
                  {edge.weight}
                </text>
              )}
            </g>
          )
        })}

        {/* Render nodes */}
        {nodes.map((node) => {
          const isVisited = currentStepData?.visitedNodes.includes(node.id)
          const isCurrent = currentStepData?.currentNode === node.id
          const isStart = node.id === startNode
          const isTarget = node.id === targetNode
          const distance = currentStepData?.distances?.[node.id]
          const isPathNode = pathNodes.includes(node.id)

          return (
            <g key={node.id}>
              <circle
                cx={node.x}
                cy={node.y}
                r="20"
                fill={
                  isPathNode
                    ? "#22c55e"
                    : isCurrent
                    ? "#6366f1"
                    : isStart
                    ? "#22c55e"
                    : isTarget
                    ? "#ef4444"
                    : isVisited
                    ? "#f59e0b"
                    : "#ffffff"
                }
                stroke={
                  isPathNode
                    ? "#16a34a"
                    : isCurrent
                    ? "#4f46e5"
                    : isStart
                    ? "#16a34a"
                    : isTarget
                    ? "#dc2626"
                    : isVisited
                    ? "#d97706"
                    : "#6b7280"
                }
                strokeWidth="2"
                className="cursor-pointer"
                onClick={() => {
                  if (!startNode) setStartNode(node.id)
                  else if (!targetNode && node.id !== startNode) setTargetNode(node.id)
                }}
                style={{ transition: "fill 0.3s, stroke 0.3s" }}
              />
              <text
                x={node.x}
                y={node.y + 5}
                textAnchor="middle"
                className="text-sm font-bold pointer-events-none"
                fill={
                  isPathNode ||
                  isCurrent ||
                  isStart ||
                  isTarget ||
                  isVisited
                    ? "#ffffff"
                    : "#374151"
                }
              >
                {node.label}
              </text>
              {distance !== undefined && (
                <text x={node.x} y={node.y - 30} textAnchor="middle" className="text-xs font-bold fill-blue-600">
                  d: {distance}
                </text>
              )}
            </g>
          )
        })}
      </svg>
    )
  }

  const algorithmInfo = {
    bfs: {
      name: "Breadth-First Search",
      description: "Explores nodes level by level using a queue",
      timeComplexity: "O(V + E)",
      spaceComplexity: "O(V)",
    },
    dfs: {
      name: "Depth-First Search",
      description: "Explores as far as possible along each branch using a stack",
      timeComplexity: "O(V + E)",
      spaceComplexity: "O(V)",
    },
    dijkstra: {
      name: "Dijkstra's Algorithm",
      description: "Finds shortest paths from source to all other vertices",
      timeComplexity: "O((V + E) log V)",
      spaceComplexity: "O(V)",
    },
  }

  const currentAlgorithm = algorithmInfo[algorithm]

  // Update pseudocode when algorithm changes
  useEffect(() => {
    setCurrentPseudocode(pseudocodeDefinitions[algorithm])
    setCurrentCodeLine(-1)
  }, [algorithm])

  // Handler for editing edge weight
  const handleEditEdgeWeight = () => {
    if (!editEdgeFrom || !editEdgeTo || !editEdgeWeight) return
    setEdges((prev) =>
      prev.map((e) =>
        e.from === editEdgeFrom && e.to === editEdgeTo
          ? { ...e, weight: Number(editEdgeWeight) }
          : e
      )
    )
    setEditEdgeFrom("")
    setEditEdgeTo("")
    setEditEdgeWeight("")
  }

  return (
    <VisualizerLayout
      title="Graph Algorithm Visualizer"
      description="Learn graph traversal and shortest path algorithms"
      difficulty="Advanced"
      isPlaying={isPlaying}
      onPlay={play}
      onPause={pause}
      onStepBack={stepBack}
      onStepForward={stepForward}
      onReset={reset}
      currentStep={currentStep}
      totalSteps={traversalSteps.length}
      complexity={{
        time: currentAlgorithm.timeComplexity,
        space: currentAlgorithm.spaceComplexity,
      }}
      applications={applications}
    >
      <div className="w-full space-y-6">
        {/* Graph Visualization */}
        <div className="flex justify-center p-4 bg-muted/10 rounded-lg">{renderGraph()}</div>

        {/* Pseudocode Panel BELOW the visualizer */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              Pseudocode
            </CardTitle>
          </CardHeader>
          <div className="font-mono text-sm bg-muted p-4 rounded-md max-h-96 overflow-y-auto">
            {currentPseudocode.map((line, index) => (
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
                <span className="text-xs text-muted-foreground/70 mr-3">
                  {index + 1}
                </span>
                {line || "\u00A0"}
              </div>
            ))}
          </div>
        </Card>

        {/* Graph Controls */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Graph Type</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-2">
                <Switch id="directed" checked={isDirected} onCheckedChange={setIsDirected} />
                <Label htmlFor="directed">Directed</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="weighted" checked={isWeighted} onCheckedChange={setIsWeighted} />
                <Label htmlFor="weighted">Weighted</Label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Algorithm</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={algorithm} onValueChange={(value: AlgorithmType) => setAlgorithm(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bfs">BFS</SelectItem>
                  <SelectItem value="dfs">DFS</SelectItem>
                  <SelectItem value="dijkstra">Dijkstra</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Start/Target</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Select value={startNode} onValueChange={setStartNode}>
                <SelectTrigger>
                  <SelectValue placeholder="Start node" />
                </SelectTrigger>
                <SelectContent>
                  {nodes.map((node) => (
                    <SelectItem key={node.id} value={node.id}>
                      {node.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={targetNode} onValueChange={setTargetNode}>
                <SelectTrigger>
                  <SelectValue placeholder="Target node" />
                </SelectTrigger>
                <SelectContent>
                  {nodes.map((node) => (
                    <SelectItem key={node.id} value={node.id}>
                      {node.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Generate</CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={generateRandomGraph} className="w-full">
                <Shuffle className="h-4 w-4 mr-2" />
                Random Graph
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Add/Delete Vertices and Edges */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Add Vertex */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Add Vertex</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder="Vertex label"
                  value={newNodeLabel}
                  onChange={(e) => setNewNodeLabel(e.target.value)}
                  maxLength={1}
                />
                <Button onClick={addNode} disabled={!newNodeLabel}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Add Edge */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Add Edge</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Select value={edgeFrom} onValueChange={setEdgeFrom}>
                  <SelectTrigger>
                    <SelectValue placeholder="From" />
                  </SelectTrigger>
                  <SelectContent>
                    {nodes.map((node) => (
                      <SelectItem key={node.id} value={node.id}>
                        {node.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={edgeTo} onValueChange={setEdgeTo}>
                  <SelectTrigger>
                    <SelectValue placeholder="To" />
                  </SelectTrigger>
                  <SelectContent>
                    {nodes.map((node) => (
                      <SelectItem key={node.id} value={node.id}>
                        {node.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {isWeighted && (
                  <Input
                    type="number"
                    placeholder="Weight"
                    value={edgeWeight}
                    onChange={(e) => setEdgeWeight(e.target.value)}
                    className="w-36"
                  />
                )}
                <Button onClick={addEdge} disabled={!edgeFrom || !edgeTo}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Delete Vertex/Edge by Select */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Delete Vertex */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Delete Vertex</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Select value={deleteVertexId} onValueChange={setDeleteVertexId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select vertex" />
                  </SelectTrigger>
                  <SelectContent>
                    {nodes.map((node) => (
                      <SelectItem key={node.id} value={node.id}>
                        {node.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="destructive"
                  onClick={() => {
                    if (deleteVertexId) {
                      removeNode(deleteVertexId)
                      setDeleteVertexId("")
                    }
                  }}
                  disabled={!deleteVertexId}
                >
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Delete Edge */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Delete Edge</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Select value={deleteEdgeFrom} onValueChange={setDeleteEdgeFrom}>
                  <SelectTrigger>
                    <SelectValue placeholder="From" />
                  </SelectTrigger>
                  <SelectContent>
                    {nodes.map((node) => (
                      <SelectItem key={node.id} value={node.id}>
                        {node.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={deleteEdgeTo} onValueChange={setDeleteEdgeTo}>
                  <SelectTrigger>
                    <SelectValue placeholder="To" />
                  </SelectTrigger>
                  <SelectContent>
                    {nodes.map((node) => (
                      <SelectItem key={node.id} value={node.id}>
                        {node.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="destructive"
                  onClick={() => {
                    if (deleteEdgeFrom && deleteEdgeTo) {
                      removeEdge(deleteEdgeFrom, deleteEdgeTo)
                      setDeleteEdgeFrom("")
                      setDeleteEdgeTo("")
                    }
                  }}
                  disabled={!deleteEdgeFrom || !deleteEdgeTo}
                >
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Edit Edge Weight */}
        {isWeighted && (
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Edit Edge Weight</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <Select value={editEdgeFrom} onValueChange={setEditEdgeFrom}>
                    <SelectTrigger>
                      <SelectValue placeholder="From" />
                    </SelectTrigger>
                    <SelectContent>
                      {nodes.map((node) => (
                        <SelectItem key={node.id} value={node.id}>
                          {node.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={editEdgeTo} onValueChange={setEditEdgeTo}>
                    <SelectTrigger>
                      <SelectValue placeholder="To" />
                    </SelectTrigger>
                    <SelectContent>
                      {nodes.map((node) => (
                        <SelectItem key={node.id} value={node.id}>
                          {node.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    placeholder="Weight"
                    value={editEdgeWeight}
                    onChange={(e) => setEditEdgeWeight(e.target.value)}
                    className="w-36 text-base px-4 py-2" // Increased width and font size
                  />
                  <Button
                    onClick={handleEditEdgeWeight}
                    disabled={!editEdgeFrom || !editEdgeTo || !editEdgeWeight}
                  >
                    Change
                  </Button>
                </div>
                <div className="text-xs text-muted-foreground">
                  Select an edge and enter a new weight to update.
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Algorithm Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{currentAlgorithm.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">{currentAlgorithm.description}</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-accent">{nodes.length}</div>
                <div className="text-sm text-muted-foreground">Vertices</div>
              </div>
              <div>
                <div className="text-lg font-bold text-accent">{edges.length}</div>
                <div className="text-sm text-muted-foreground">Edges</div>
              </div>
              <div>
                <div className="text-lg font-bold text-accent">
                  {traversalSteps[currentStep]?.visitedNodes.length || 0}
                </div>
                <div className="text-sm text-muted-foreground">Visited</div>
              </div>
              <div>
                <div className="text-lg font-bold text-accent">
                  {traversalSteps[currentStep]?.queue?.length || traversalSteps[currentStep]?.stack?.length || 0}
                </div>
                <div className="text-sm text-muted-foreground">{algorithm === "bfs" ? "Queue" : "Stack"}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Step Description */}
        {traversalSteps.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Current Step</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm p-3 bg-accent/10 rounded-lg border border-accent/20">
                {traversalSteps[currentStep]?.description || "Ready to start algorithm"}
              </div>
              {algorithm === "bfs" && traversalSteps[currentStep]?.queue && (
                <div className="mt-3">
                  <div className="text-sm font-medium mb-1">Queue:</div>
                  <div className="flex gap-1">
                    {traversalSteps[currentStep].queue!.map((nodeId, index) => (
                      <Badge key={index} variant="outline">
                        {nodeId}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {algorithm === "dfs" && traversalSteps[currentStep]?.stack && (
                <div className="mt-3">
                  <div className="text-sm font-medium mb-1">Stack:</div>
                  <div className="flex gap-1">
                    {traversalSteps[currentStep].stack!.map((nodeId, index) => (
                      <Badge key={index} variant="outline">
                        {nodeId}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Legend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Legend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-white border-2 border-gray-400 rounded-full"></div>
                <span>Unvisited</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                <span>Start Node</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                <span>Target Node</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                <span>Current Node</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                <span>Visited</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </VisualizerLayout>
  )
}
