"use client"
import { useState, useEffect } from "react"
import { VisualizerLayout } from "../../../components/visualizer-layout"
import { Button } from "../../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select"
import { Switch } from "../../../components/ui/switch"
import { Label } from "../../../components/ui/label"
import { Input } from "../../../components/ui/input"
import { Alert, AlertDescription } from "../../../components/ui/alert"

interface LocationNode {
  id: string
  label: string
  x: number
  y: number
}

interface RoadEdge {
  from: string
  to: string
  baseTime: number
  trafficDelay: number
  isInPath?: boolean
}

interface NavigationStep {
  currentNode: string
  visited: string[]
  distances: { [key: string]: number }
  description: string
  pathEdges: string[]
  codeLine?: number
}

const pseudocodeFastest = [
  "function DijkstraWithTraffic(start):",
  "  distance[start] ← 0",
  "  for each vertex v ≠ start:",
  "    distance[v] ← ∞",
  "  Q ← set of all vertices",
  "  while Q is not empty:",
  "    u ← vertex in Q with min distance[u]",
  "    remove u from Q",
  "    for each neighbor v of u:",
  "      actualTime ← baseTime(u,v) + trafficDelay(u,v)",
  "      alt ← distance[u] + actualTime",
  "      if alt < distance[v]:",
  "        distance[v] ← alt",
  "        predecessor[v] ← u",
]

const pseudocodeShortest = [
  "function BFSForShortestHops(start):",
  "  create queue Q",
  "  mark start as visited",
  "  Q.enqueue(start)",
  "  while Q is not empty:",
  "    node = Q.dequeue()",
  "    for each neighbor of node:",
  "      if neighbor not visited:",
  "        mark neighbor as visited",
  "        Q.enqueue(neighbor)",
  "        parent[neighbor].add(node)",
]

// Initial graph
const initialNodes: LocationNode[] = [
  { id: "A", label: "Downtown", x: 200, y: 150 },
  { id: "B", label: "Airport", x: 600, y: 120 },
  { id: "C", label: "Mall", x: 400, y: 80 },
  { id: "D", label: "University", x: 160, y: 320 },
  { id: "E", label: "Hospital", x: 400, y: 280 },
  { id: "F", label: "Stadium", x: 620, y: 340 },
]

const initialEdges: RoadEdge[] = [
  { from: "A", to: "C", baseTime: 8, trafficDelay: 0 },
  { from: "A", to: "D", baseTime: 12, trafficDelay: 0 },
  { from: "C", to: "B", baseTime: 10, trafficDelay: 0 },
  { from: "C", to: "E", baseTime: 6, trafficDelay: 0 },
  { from: "D", to: "E", baseTime: 7, trafficDelay: 0 },
  { from: "E", to: "F", baseTime: 9, trafficDelay: 0 },
  { from: "B", to: "F", baseTime: 15, trafficDelay: 0 },
]

// Generate unique IDs A..Z, AA, AB, ...
const generateId = (existingIds: string[]): string => {
  let id = ""
  let n = existingIds.length
  do {
    id = String.fromCharCode(65 + (n % 26)) + id
    n = Math.floor(n / 26) - 1
  } while (n >= 0)
  return id
}

// All shortest paths from start to target using parent map
function findAllPaths(
  start: string,
  target: string,
  parents: { [node: string]: string[] }
): string[][] {
  const paths: string[][] = []
  function dfs(node: string, path: string[]) {
    if (node === start) {
      paths.push([start, ...path].reverse())
      return
    }
    for (const parent of parents[node] || []) {
      dfs(parent, [node, ...path])
    }
  }
  dfs(target, [])
  return paths
}

export default function NavigationSystemsVisualizer() {
  const [nodes, setNodes] = useState<LocationNode[]>(initialNodes)
  const [edges, setEdges] = useState<RoadEdge[]>(initialEdges)
  const [start, setStart] = useState("A")
  const [target, setTarget] = useState("F")
  const [steps, setSteps] = useState<NavigationStep[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [codeLine, setCodeLine] = useState(-1)
  const [routingMode, setRoutingMode] = useState<"fastest" | "shortest">("fastest")
  const [trafficEnabled, setTrafficEnabled] = useState(false)

  // Graph editing state
  const [newLocationLabel, setNewLocationLabel] = useState("")
  const [newLocationX, setNewLocationX] = useState("")
  const [newLocationY, setNewLocationY] = useState("")
  const [fromNode, setFromNode] = useState("")
  const [toNode, setToNode] = useState("")
  const [roadBaseTime, setRoadBaseTime] = useState("5")
  const [roadTrafficDelay, setRoadTrafficDelay] = useState("0")
  const [error, setError] = useState("")

  const resetState = () => {
    setSteps([])
    setCurrentStep(0)
    setIsPlaying(false)
    setCodeLine(-1)
    setEdges(prev => prev.map(e => ({ ...e, isInPath: false })))
    setError("")
  }

  const simulateTraffic = () => {
    setEdges(prev =>
      prev.map(e => {
        if ((e.from === "A" && e.to === "C") || (e.from === "C" && e.to === "B")) {
          return { ...e, trafficDelay: trafficEnabled ? 12 : 0 }
        }
        if (e.from === "E" && e.to === "F") {
          return { ...e, trafficDelay: trafficEnabled ? 8 : 0 }
        }
        return { ...e, trafficDelay: 0 }
      })
    )
  }

  useEffect(() => {
    simulateTraffic()
  }, [trafficEnabled])

  const getActualTime = (edge: RoadEdge) => edge.baseTime + (trafficEnabled ? edge.trafficDelay : 0)

  // ===== STEP CONTROLS =====
  const stepForward = () => {
    if (currentStep < steps.length - 1) setCurrentStep(currentStep + 1)
  }
  const stepBack = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1)
  }
  const play = () => {
    if (steps.length === 0) startAlgorithm()
    setIsPlaying(true)
  }
  const pause = () => setIsPlaying(false)
  const reset = () => resetState()

  useEffect(() => {
    if (isPlaying && currentStep < steps.length - 1) {
      const id = setTimeout(() => stepForward(), 1800)
      return () => clearTimeout(id)
    } else if (currentStep >= steps.length - 1) {
      setIsPlaying(false)
    }
  }, [isPlaying, currentStep, steps.length])

  useEffect(() => {
    if (steps[currentStep]?.codeLine !== undefined) {
      setCodeLine(steps[currentStep].codeLine!)
    }
  }, [currentStep])

  // ===== ALGORITHMS =====
  const runFastestRoute = () => {
    resetState()
    const dist: { [id: string]: number } = {}
    const prev: { [id: string]: string } = {}
    const visited = new Set<string>()
    const allNodes = nodes.map(n => n.id)

    allNodes.forEach(id => { dist[id] = id === start ? 0 : Infinity })

    const newSteps: NavigationStep[] = []
    newSteps.push({
      currentNode: start,
      visited: [],
      distances: { ...dist },
      description: `Initialize travel times from ${start} (${nodes.find(n => n.id === start)?.label}).`,
      pathEdges: [],
      codeLine: 2,
    })

    while (visited.size < allNodes.length) {
      let u: string | null = null
      let minDist = Infinity
      for (const id of allNodes) {
        if (!visited.has(id) && dist[id] < minDist) {
          minDist = dist[id]; u = id
        }
      }
      if (u === null || dist[u] === Infinity) break

      visited.add(u)

      const neighbors = edges
        .filter(e => e.from === u || e.to === u)
        .map(e => e.from === u ? e.to : e.from)

      newSteps.push({
        currentNode: u,
        visited: Array.from(visited),
        distances: { ...dist },
        description: `Processing ${u} (${nodes.find(n => n.id === u)?.label}).`,
        pathEdges: [],
        codeLine: 7,
      })

      for (const v of neighbors) {
        if (visited.has(v)) continue
        const edge = edges.find(e => (e.from === u && e.to === v) || (e.from === v && e.to === u))
        if (!edge) continue
        const actualTime = getActualTime(edge)
        const alt = dist[u] + actualTime
        if (alt < dist[v]) {
          dist[v] = alt
          prev[v] = u
          newSteps.push({
            currentNode: u,
            visited: Array.from(visited),
            distances: { ...dist },
            description: `Updated ${v} via ${u}: ${alt} min (base: ${edge.baseTime}, delay: ${edge.trafficDelay}).`,
            pathEdges: [`${u}-${v}`, `${v}-${u}`],
            codeLine: 11,
          })
        }
      }

      if (u === target) break
    }

    const path: string[] = []
    let curr = target
    while (curr && prev[curr]) {
      path.unshift(curr)
      curr = prev[curr]
    }
    if (curr === start) path.unshift(start)

    const pathEdges: string[] = []
    for (let i = 0; i < path.length - 1; i++) {
      pathEdges.push(`${path[i]}-${path[i + 1]}`, `${path[i + 1]}-${path[i]}`)
    }

    newSteps.push({
      currentNode: target,
      visited: Array.from(visited),
      distances: { ...dist },
      description: path.length > 1
        ? `Fastest route found: ${path.map(id => nodes.find(n => n.id === id)?.label).join(" → ")}. Total: ${dist[target]} min.`
        : `No path exists from ${start} to ${target}.`,
      pathEdges: path.length > 1 ? pathEdges : [],
      codeLine: -1,
    })

    setSteps(newSteps)
    setCodeLine(1)
  }

  const runShortestPath = () => {
    resetState()
    const visited = new Set<string>()
    const queue = [start]
    const parents: { [key: string]: string[] } = {}
    const distances: { [key: string]: number } = { [start]: 0 }

    const newSteps: NavigationStep[] = []
    newSteps.push({
      currentNode: start,
      visited: [],
      distances: { ...distances },
      description: `Starting unweighted BFS from ${start}.`,
      pathEdges: [],
      codeLine: 2,
    })

    while (queue.length > 0) {
      const u = queue.shift()!
      if (visited.has(u)) continue
      visited.add(u)

      newSteps.push({
        currentNode: u,
        visited: Array.from(visited),
        distances: { ...distances },
        description: `Visiting ${u} (${nodes.find(n => n.id === u)?.label}).`,
        pathEdges: [],
        codeLine: 5,
      })

      const neighbors = edges
        .filter(e => e.from === u || e.to === u)
        .map(e => e.from === u ? e.to : e.from)
        .filter(v => !visited.has(v) && !queue.includes(v))

      for (const v of neighbors) {
        queue.push(v)
        if (!parents[v]) parents[v] = []
        parents[v].push(u)
        distances[v] = distances[u] + 1
        newSteps.push({
          currentNode: u,
          visited: Array.from(visited),
          distances: { ...distances },
          description: `Added ${v} to queue (1 hop from ${u}).`,
          pathEdges: [`${u}-${v}`, `${v}-${u}`],
          codeLine: 8,
        })
      }

      if (u === target) break
    }

    let allPaths: string[][] = []
    const pathEdgesSet = new Set<string>()

    if (distances[target] !== undefined) {
      allPaths = findAllPaths(start, target, parents)
      for (const p of allPaths) {
        for (let i = 0; i < p.length - 1; i++) {
          pathEdgesSet.add(`${p[i]}-${p[i + 1]}`)
          pathEdgesSet.add(`${p[i + 1]}-${p[i]}`)
        }
      }
    }

    const pathEdges = Array.from(pathEdgesSet)
    const pathDescriptions = allPaths.map(p =>
      p.map(id => nodes.find(n => n.id === id)?.label).join(" → ")
    )

    newSteps.push({
      currentNode: target,
      visited: Array.from(visited),
      distances: { ...distances },
      description: allPaths.length > 0
        ? `Found ${allPaths.length} shortest path(s):\n${pathDescriptions.join("\n")}`
        : `No path exists from ${start} to ${target}.`,
      pathEdges,
      codeLine: -1,
    })

    setSteps(newSteps)
    setCodeLine(1)
  }

  const startAlgorithm = () => {
    if (start === target) {
      setError("Start and target cannot be the same!")
      return
    }
    routingMode === "fastest" ? runFastestRoute() : runShortestPath()
  }

  // ===== GRAPH EDITING =====
  const handleAddLocation = () => {
    if (!newLocationLabel.trim()) {
      setError("Location name is required.")
      return
    }

    const existingIds = nodes.map(n => n.id)
    const newId = generateId(existingIds)

    const x = newLocationX ? parseInt(newLocationX) : 200 + (nodes.length * 60) % 600
    const y = newLocationY ? parseInt(newLocationY) : 150 + Math.floor(nodes.length / 8) * 70

    const newNode: LocationNode = {
      id: newId,
      label: newLocationLabel.trim(),
      x: isNaN(x) ? 200 : Math.max(80, Math.min(720, x)),
      y: isNaN(y) ? 200 : Math.max(80, Math.min(420, y)),
    }

    setNodes([...nodes, newNode])
    if (nodes.length === 0) {
      setStart(newId)
      setTarget(newId)
    }

    setNewLocationLabel("")
    setNewLocationX("")
    setNewLocationY("")
    setError("")
  }

  const handleAddRoad = () => {
    if (!fromNode || !toNode) {
      setError("Please select both 'From' and 'To' locations.")
      return
    }
    if (fromNode === toNode) {
      setError("Cannot connect a location to itself.")
      return
    }

    const baseTime = parseInt(roadBaseTime) || 5
    const trafficDelay = parseInt(roadTrafficDelay) || 0

    const exists = edges.some(e =>
      (e.from === fromNode && e.to === toNode) ||
      (e.from === toNode && e.to === fromNode)
    )
    if (exists) {
      setError("A road already exists between these locations.")
      return
    }

    setEdges([...edges, { from: fromNode, to: toNode, baseTime, trafficDelay }])
    setFromNode("")
    setToNode("")
    setRoadBaseTime("5")
    setRoadTrafficDelay("0")
    setError("")
  }

  const handleDeleteLocation = (id: string) => {
    if (nodes.length <= 1) {
      setError("At least one location is required.")
      return
    }
    setNodes(nodes.filter(n => n.id !== id))
    setEdges(edges.filter(e => e.from !== id && e.to !== id))
    if (start === id) setStart(nodes.find(n => n.id !== id)?.id || "")
    if (target === id) setTarget(nodes.find(n => n.id !== id)?.id || "")
  }

  // ===== RENDER MAP =====
  const renderMap = () => {
    const step = steps[currentStep] || { visited: [], currentNode: "", pathEdges: [], distances: {} }
    return (
      <svg width="800" height="500" className="border rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 shadow-lg">
        {/* Background grid */}
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e5e7eb" strokeWidth="0.5" opacity="0.6" />
          </pattern>
        </defs>
        <rect width="800" height="500" fill="url(#grid)" />

        {/* Roads */}
        {edges.map((edge, i) => {
          const from = nodes.find(n => n.id === edge.from)!
          const to = nodes.find(n => n.id === edge.to)!
          const dx = to.x - from.x
          const dy = to.y - from.y
          const len = Math.sqrt(dx * dx + dy * dy)
          const normX = dx / len
          const normY = dy / len
          const offset = 28
          const startX = from.x + normX * offset
          const startY = from.y + normY * offset
          const endX = to.x - normX * offset
          const endY = to.y - normY * offset

          const isPath = step.pathEdges.includes(`${edge.from}-${edge.to}`)
          const actualTime = getActualTime(edge)
          const isCongested = trafficEnabled && edge.trafficDelay > 0

          return (
            <g key={i}>
              <line
                x1={startX}
                y1={startY}
                x2={endX}
                y2={endY}
                stroke={isPath ? "#10b981" : isCongested ? "#f97316" : "#94a3b8"}
                strokeWidth={isPath ? 5 : 2.5}
                style={{ transition: "stroke 0.3s, stroke-width 0.3s" }}
              />
              <text
                x={(startX + endX) / 2}
                y={(startY + endY) / 2 - 10}
                textAnchor="middle"
                className="text-xs font-medium fill-blue-700"
              >
                {actualTime}′
              </text>
              {isCongested && (
                <text
                  x={(startX + endX) / 2}
                  y={(startY + endY) / 2 + 16}
                  textAnchor="middle"
                  className="text-xs font-bold fill-orange-600"
                >
                  🚗
                </text>
              )}
            </g>
          )
        })}

        {/* Locations */}
        {nodes.map(node => {
          const isStart = node.id === start
          const isTarget = node.id === target
          const isCurrent = step.currentNode === node.id
          const isVisited = step.visited.includes(node.id)
          const isPath = step.pathEdges.some(e =>
            e.startsWith(node.id + "-") || e.endsWith("-" + node.id)
          )

          let fill = "#ffffff"
          let stroke = "#64748b"
          let strokeWidth = "2"
          if (isPath) {
            fill = "#10b981"
            stroke = "#059669"
          } else if (isCurrent) {
            fill = "#818cf8"
            stroke = "#4f46e5"
          } else if (isStart) {
            fill = "#10b981"
            stroke = "#059669"
          } else if (isTarget) {
            fill = "#ef4444"
            stroke = "#dc2626"
          } else if (isVisited) {
            fill = "#fbbf24"
            stroke = "#d97706"
          }

          return (
            <g key={node.id}>
              <circle 
                cx={node.x} 
                cy={node.y} 
                r="28" 
                fill={fill} 
                stroke={stroke} 
                strokeWidth={strokeWidth}
                className="cursor-pointer transition-all duration-200 hover:r-32 hover:stroke-3"
              />
              <text 
                x={node.x} 
                y={node.y + 6} 
                textAnchor="middle" 
                className="text-sm font-bold"
                fill={isPath || isCurrent || isStart || isTarget || isVisited ? "#fff" : "#1e293b"}
              >
                {node.label.split(" ")[0]}
              </text>
              {step.distances[node.id] !== undefined && step.distances[node.id] < Infinity && (
                <text 
                  x={node.x} 
                  y={node.y - 40} 
                  textAnchor="middle" 
                  className="text-xs font-bold"
                  fill={routingMode === "fastest" ? "#1d4ed8" : "#7c3aed"}
                >
                  {routingMode === "fastest" ? `${step.distances[node.id]}′` : `h:${step.distances[node.id]}`}
                </text>
              )}
            </g>
          )
        })}
      </svg>
    )
  }

  // ===== RENDER =====
  return (
    <VisualizerLayout
      title="Navigation Systems Visualizer"
      /* IMPORTANT: leave description empty so nothing goes to the sidebar */
      description=""
      difficulty="Advanced"
      currentStep={currentStep}
      totalSteps={steps.length}
      complexity={{
        time: routingMode === "fastest" ? "O((V + E) log V)" : "O(V + E)",
        space: "O(V)",
      }}
    >
      <div className="w-full space-y-6">
        {/* TOP-OF-PAGE DESCRIPTION (full width) */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">What this application demonstrates</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-3 text-black [&_p]:text-black [&_li]:text-black [&_strong]:text-black [&_em]:text-black">
            <p>
              This interactive visualizer models a small city as a <strong>graph</strong>—locations are nodes and roads are edges with travel times.
              You can experiment with traffic and compare two routing strategies used by real navigation apps.
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Fastest Route (Traffic-Aware Dijkstra)</strong>: Minimizes total <em>time</em>.
                Each road has a <em>base time</em> plus a possible <em>traffic delay</em>. During “Rush Hour,” selected roads become slower, and the algorithm adapts.
              </li>
              <li>
                <strong>Shortest Path (Unweighted BFS)</strong>: Minimizes the <em>number of hops</em> (road segments), ignoring times. Useful when every edge cost is treated equally (e.g., counting turns).
              </li>
            </ul>
            <p className="pt-1">
              You can <strong>add/delete locations</strong>, <strong>create roads</strong> with custom base times and delays, and then
              <strong> run the route finder</strong>. The map shows the current node, visited nodes, congestion, edge weights, and the final path.
            </p>
            <div className="grid md:grid-cols-2 gap-3 pt-1">
              <div className="bg-muted/30 p-3 rounded">
                <div className="font-medium mb-1">How to use</div>
                <ol className="list-decimal pl-5 space-y-1">
                  <li>Pick <em>Start</em> and <em>Destination</em>.</li>
                  <li>Choose <em>Routing Mode</em> (Fastest or Shortest).</li>
                  <li>Toggle <em>Rush Hour</em> to simulate traffic.</li>
                  <li>Click <em>Find Route</em> to step through the algorithm.</li>
                </ol>
              </div>
              <div className="bg-muted/30 p-3 rounded">
                <div className="font-medium mb-1">Learning outcomes</div>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Understand Dijkstra vs. BFS and when to use each.</li>
                  <li>See how traffic transforms edge weights in real time.</li>
                  <li>Connect routing concepts with real navigation apps.</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Map */}
        <div className="flex justify-center p-6 bg-gradient-to-b from-gray-50 to-gray-100 rounded-xl shadow-inner">
          {renderMap()}
        </div>

        {/* Pseudocode */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              {routingMode === "fastest" ? "Traffic-Aware Dijkstra" : "Shortest-Hop BFS"}
            </CardTitle>
          </CardHeader>
          <div className="font-mono text-sm bg-gray-50 p-5 rounded-lg max-h-80 overflow-y-auto border border-gray-200">
            {(routingMode === "fastest" ? pseudocodeFastest : pseudocodeShortest).map((line, idx) => (
              <div
                key={idx}
                className={`py-2 px-3 rounded-lg mb-1 transition-colors ${
                  codeLine === idx + 1
                    ? "bg-emerald-100 border-l-4 border-emerald-500 text-emerald-800 font-medium"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <span className="text-xs text-gray-500 mr-4 w-6 inline-block">{idx + 1}</span>
                {line}
              </div>
            ))}
          </div>
        </Card>

        {/* Controls */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-0 shadow-md">
            <CardHeader><CardTitle className="text-base">Start</CardTitle></CardHeader>
            <CardContent>
              <Select value={start} onValueChange={setStart}>
                <SelectTrigger><SelectValue placeholder="Select start" /></SelectTrigger>
                <SelectContent>
                  {nodes.map(n => <SelectItem key={n.id} value={n.id}>{n.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md">
            <CardHeader><CardTitle className="text-base">Destination</CardTitle></CardHeader>
            <CardContent>
              <Select value={target} onValueChange={setTarget}>
                <SelectTrigger><SelectValue placeholder="Select destination" /></SelectTrigger>
                <SelectContent>
                  {nodes.map(n => <SelectItem key={n.id} value={n.id}>{n.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md">
            <CardHeader><CardTitle className="text-base">Routing Mode</CardTitle></CardHeader>
            <CardContent>
              <Select value={routingMode} onValueChange={(v) => setRoutingMode(v as any)}>
                <SelectTrigger><SelectValue placeholder="Select mode" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="fastest">Fastest Route (Time)</SelectItem>
                  <SelectItem value="shortest">Shortest Path (Hops)</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md">
            <CardHeader><CardTitle className="text-base">Traffic</CardTitle></CardHeader>
            <CardContent className="flex items-center gap-3">
              <Switch checked={trafficEnabled} onCheckedChange={setTrafficEnabled} />
              <Label className="text-sm">Rush Hour</Label>
            </CardContent>
          </Card>
        </div>

        {/* Graph Editing */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="border-0 shadow-md">
            <CardHeader><CardTitle>Add Location</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <Input
                placeholder="Location name (e.g., Park)"
                value={newLocationLabel}
                onChange={e => setNewLocationLabel(e.target.value)}
              />
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  placeholder="X (80-720)"
                  value={newLocationX}
                  onChange={e => setNewLocationX(e.target.value)}
                />
                <Input
                  type="number"
                  placeholder="Y (80-420)"
                  value={newLocationY}
                  onChange={e => setNewLocationY(e.target.value)}
                />
              </div>
              <Button onClick={handleAddLocation} className="w-full bg-emerald-600 hover:bg-emerald-700">
                Add New Location
              </Button>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardHeader><CardTitle>Add Road</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <Select value={fromNode} onValueChange={setFromNode}>
                <SelectTrigger><SelectValue placeholder="From location" /></SelectTrigger>
                <SelectContent>
                  {nodes.map(n => <SelectItem key={n.id} value={n.id}>{n.label}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={toNode} onValueChange={setToNode}>
                <SelectTrigger><SelectValue placeholder="To location" /></SelectTrigger>
                <SelectContent>
                  {nodes.map(n => <SelectItem key={n.id} value={n.id}>{n.label}</SelectItem>)}
                </SelectContent>
              </Select>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  placeholder="Base time (min)"
                  value={roadBaseTime}
                  onChange={e => setRoadBaseTime(e.target.value)}
                  min="1"
                />
                <Input
                  type="number"
                  placeholder="Traffic delay"
                  value={roadTrafficDelay}
                  onChange={e => setRoadTrafficDelay(e.target.value)}
                  min="0"
                />
              </div>
              <Button onClick={handleAddRoad} className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={!fromNode || !toNode}>
                Add Road
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Delete Location */}
        <Card className="border-0 shadow-md">
          <CardHeader><CardTitle>Delete Location</CardTitle></CardHeader>
          <CardContent>
            <Select onValueChange={handleDeleteLocation}>
              <SelectTrigger><SelectValue placeholder="Select location to delete" /></SelectTrigger>
              <SelectContent>
                {nodes.map(n => (
                  <SelectItem key={n.id} value={n.id} disabled={nodes.length <= 1}>
                    {n.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {/* Run Navigation */}
        <Card className="border-0 shadow-lg">
          <CardHeader><CardTitle>Run Navigation</CardTitle></CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button onClick={play} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 text-lg font-medium">
              Find Route
            </Button>
            <Button variant="outline" onClick={stepBack} disabled={currentStep === 0}>Step Back</Button>
            <Button variant="outline" onClick={stepForward} disabled={currentStep >= steps.length - 1}>Step Forward</Button>
            <Button variant="ghost" onClick={pause} disabled={!isPlaying}>Pause</Button>
            <Button variant="secondary" onClick={reset}>Reset</Button>
          </CardContent>
        </Card>

        {/* Current Step Info */}
        {steps.length > 0 && (
          <Card className="border-0 shadow-md">
            <CardHeader><CardTitle>Navigation Step</CardTitle></CardHeader>
            <CardContent>
              <div className="text-sm p-4 bg-emerald-50 rounded-lg border border-emerald-200 whitespace-pre-line text-emerald-900">
                {steps[currentStep]?.description || "Ready"}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Legend */}
        <Card className="border-0 shadow-md">
          <CardHeader><CardTitle>Legend</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-5 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-white border-2 border-slate-400 rounded-full"></div>
                <span>Normal Location</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-emerald-500 rounded-full"></div>
                <span>Optimal Path</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-red-500 rounded-full"></div>
                <span>Destination</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-indigo-500 rounded-full"></div>
                <span>Current Node</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-amber-500 rounded-full"></div>
                <span>Visited</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-orange-500 rounded-full"></div>
                <span>Congested 🚗</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </VisualizerLayout>
  )
}
