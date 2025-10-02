"use client"
import { useState, useEffect, useRef } from "react"
import { VisualizerLayout } from "../../../components/visualizer-layout"
import { Button } from "../../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { Badge } from "../../../components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select"
import { Shuffle } from "lucide-react"
import type { JSX } from "react/jsx-runtime"

interface CityNode {
  id: string
  label: string
  x: number
  y: number
  isMST?: boolean
  isTSP?: boolean
}

interface WeightedEdge {
  from: string
  to: string
  weight: number
  isInMST?: boolean
  isInTSP?: boolean
}

interface MSTStep {
  description: string
  mstEdges: string[]
  visitedNodes?: string[]
  codeLine?: number
}

const pseudocode = [
  "function MST_TSP_Approx(cities):",
  "  // Step 1: Create complete graph with Euclidean distances",
  "  for each pair of cities (u, v):",
  "    weight(u, v) = distance(u, v)",
  "  // Step 2: Build MST using Prim's algorithm",
  "  MST = Prim(start=cities[0])",
  "  // Step 3: Preorder traversal of MST → TSP tour",
  "  tour = PreorderDFS(MST, root=cities[0])",
  "  return tour",
]

const usaCitiesData = [
  { id: "NYC", label: "NYC", lat: 40.7128, lng: -74.0060 },
  { id: "LA", label: "LA", lat: 34.0522, lng: -118.2437 },
  { id: "CHI", label: "CHI", lat: 41.8781, lng: -87.6298 },
  { id: "MIA", label: "MIA", lat: 25.7617, lng: -80.1918 },
  { id: "SEA", label: "SEA", lat: 47.6062, lng: -122.3321 },
  { id: "DEN", label: "DEN", lat: 39.7392, lng: -104.9903 },
]

// Scale lat/lng to fit 600x300 canvas
function scaleCitiesToCanvas(cities: { id: string; label: string; lat: number; lng: number }[]): CityNode[] {
  const lats = cities.map(c => c.lat)
  const lngs = cities.map(c => c.lng)
  const minLat = Math.min(...lats), maxLat = Math.max(...lats)
  const minLng = Math.min(...lngs), maxLng = Math.max(...lngs)

  return cities.map(city => {
    const x = 50 + ((city.lng - minLng) / (maxLng - minLng)) * 500
    const y = 50 + ((maxLat - city.lat) / (maxLat - minLat)) * 200
    return { id: city.id, label: city.label, x, y }
  })
}

function euclideanDistance(a: CityNode, b: CityNode): number {
  const dx = a.x - b.x
  const dy = a.y - b.y
  return Math.round(Math.sqrt(dx * dx + dy * dy))
}

function getNeighbors(nodeId: string, edges: WeightedEdge[]): string[] {
  const neighbors: string[] = []
  for (const edge of edges) {
    if (edge.from === nodeId) neighbors.push(edge.to)
    else if (edge.to === nodeId) neighbors.push(edge.from)
  }
  return neighbors
}

export default function TSPMSTApproxPage() {
  const [nodes, setNodes] = useState<CityNode[]>([])
  const [edges, setEdges] = useState<WeightedEdge[]>([])
  const [mstSteps, setMstSteps] = useState<MSTStep[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentCodeLine, setCurrentCodeLine] = useState<number>(-1)
  const [tspTour, setTspTour] = useState<string[]>([])
  const [mstCost, setMstCost] = useState(0)
  const [tspCost, setTspCost] = useState(0)
  const svgRef = useRef<SVGSVGElement>(null)

  const applications = [
    {
      title: "Logistics & Delivery",
      description: "MST-based TSP approximations optimize delivery routes for packages, food, or services",
      examples: ["UPS/FedEx routing", "Pizza delivery", "Ride-sharing pickups"],
    },
    {
      title: "Circuit Design",
      description: "Minimizing wire length in circuit boards using MST heuristics",
      examples: ["PCB layout", "Chip design", "Network cabling"],
    },
    {
      title: "Approximation Algorithms",
      description: "MST provides a provable 2-approximation for metric TSP",
      examples: ["Traveling Salesman heuristic", "Facility location"],
    },
  ]

  // Initialize with US cities
  useEffect(() => {
    loadExample("usa6")
  }, [])

  const loadExample = (key: string) => {
    let cities: CityNode[] = []
    if (key === "usa6") {
      cities = scaleCitiesToCanvas(usaCitiesData)
    } else {
      // Random points
      cities = Array.from({ length: 6 }, (_, i) => ({
        id: String.fromCharCode(65 + i),
        label: String.fromCharCode(65 + i),
        x: 100 + Math.random() * 400,
        y: 50 + Math.random() * 200,
      }))
    }
    setNodes(cities)
    generateCompleteGraph(cities)
    setMstSteps([])
    setCurrentStep(0)
    setTspTour([])
    setMstCost(0)
    setTspCost(0)
  }

  const generateCompleteGraph = (cities: CityNode[]) => {
    const newEdges: WeightedEdge[] = []
    for (let i = 0; i < cities.length; i++) {
      for (let j = i + 1; j < cities.length; j++) {
        const w = euclideanDistance(cities[i], cities[j])
        newEdges.push({ from: cities[i].id, to: cities[j].id, weight: w })
      }
    }
    setEdges(newEdges)
  }

  const performMSTThenTSP = () => {
    if (nodes.length === 0) return
    const start = nodes[0].id
    const steps: MSTStep[] = []
    const mstEdges: string[] = []
    const visited = new Set<string>()
    const key: { [id: string]: number } = {}
    const parent: { [id: string]: string | null } = {}
    const inQueue = new Set(nodes.map(n => n.id))

    for (const node of nodes) {
      key[node.id] = node.id === start ? 0 : Infinity
      parent[node.id] = null
    }

    steps.push({ description: `Initialize MST from ${start}`, mstEdges: [], codeLine: 5 })

    while (inQueue.size > 0) {
      let minNode = ""
      let minKey = Infinity
      for (const id of inQueue) {
        if (key[id] < minKey) {
          minKey = key[id]
          minNode = id
        }
      }
      if (minKey === Infinity) break

      inQueue.delete(minNode)
      visited.add(minNode)

      if (parent[minNode] !== null) {
        const e = `${parent[minNode]}-${minNode}`
        mstEdges.push(e)
        steps.push({ description: `Add edge ${e} to MST`, mstEdges: [...mstEdges], codeLine: 6 })
      } else {
        steps.push({ description: `Start MST at ${minNode}`, mstEdges: [], codeLine: 6 })
      }

      const neighbors = getNeighbors(minNode, edges)
      for (const v of neighbors) {
        if (inQueue.has(v)) {
          const edge = edges.find(e =>
            (e.from === minNode && e.to === v) || (e.from === v && e.to === minNode)
          )
          if (edge && edge.weight < key[v]) {
            key[v] = edge.weight
            parent[v] = minNode
          }
        }
      }
    }

    // Preorder DFS for TSP tour
    const adj: { [id: string]: string[] } = {}
    for (const e of mstEdges) {
      const [u, v] = e.split('-')
      if (!adj[u]) adj[u] = []
      if (!adj[v]) adj[v] = []
      adj[u].push(v)
      adj[v].push(u)
    }

    const tour: string[] = []
    const visitedTour = new Set<string>()
    const dfs = (node: string) => {
      visitedTour.add(node)
      tour.push(node)
      for (const neighbor of adj[node] || []) {
        if (!visitedTour.has(neighbor)) {
          dfs(neighbor)
        }
      }
    }
    dfs(start)
    tour.push(start) // return to start

    // Compute costs
    let mstTotal = 0
    for (const e of mstEdges) {
      const edge = edges.find(ed =>
        (ed.from === e.split('-')[0] && ed.to === e.split('-')[1]) ||
        (ed.from === e.split('-')[1] && ed.to === e.split('-')[0])
      )
      if (edge) mstTotal += edge.weight
    }

    let tspTotal = 0
    for (let i = 0; i < tour.length - 1; i++) {
      const edge = edges.find(ed =>
        (ed.from === tour[i] && ed.to === tour[i + 1]) ||
        (ed.from === tour[i + 1] && ed.to === tour[i])
      )
      if (edge) tspTotal += edge.weight
    }

    setMstCost(mstTotal)
    setTspCost(tspTotal)
    setTspTour(tour)
    setMstSteps(steps)
    setCurrentCodeLine(-1)
  }

  const startAlgorithm = () => {
    setCurrentStep(0)
    setIsPlaying(false)
    performMSTThenTSP()
  }

  const stepForward = () => {
    if (currentStep < mstSteps.length - 1) setCurrentStep(currentStep + 1)
  }

  const stepBack = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1)
  }

  const play = () => {
    if (mstSteps.length === 0) startAlgorithm()
    setIsPlaying(true)
  }

  const pause = () => setIsPlaying(false)

  const reset = () => {
    setMstSteps([])
    setCurrentStep(0)
    setIsPlaying(false)
    setTspTour([])
  }

  useEffect(() => {
    if (isPlaying && currentStep < mstSteps.length - 1) {
      const timer = setTimeout(stepForward, 1200)
      return () => clearTimeout(timer)
    } else if (currentStep >= mstSteps.length - 1) {
      setIsPlaying(false)
    }
  }, [isPlaying, currentStep, mstSteps.length])

  useEffect(() => {
    if (mstSteps[currentStep]?.codeLine !== undefined) {
      setCurrentCodeLine(mstSteps[currentStep].codeLine)
    }
  }, [currentStep, mstSteps])

  const renderGraph = (): JSX.Element => {
    const current = mstSteps[currentStep] || { mstEdges: [] }
    const mstEdgeSet = new Set(current.mstEdges)
    const tspEdgeSet = new Set<string>()
    for (let i = 0; i < tspTour.length - 1; i++) {
      const a = tspTour[i], b = tspTour[i + 1]
      tspEdgeSet.add(`${a}-${b}`)
      tspEdgeSet.add(`${b}-${a}`)
    }

    return (
      <svg ref={svgRef} width="600" height="300" className="border rounded-lg bg-white">
        {/* MST Edges */}
        {edges.map((edge, idx) => {
          const from = nodes.find(n => n.id === edge.from)
          const to = nodes.find(n => n.id === edge.to)
          if (!from || !to) return null

          const dx = to.x - from.x
          const dy = to.y - from.y
          const len = Math.sqrt(dx * dx + dy * dy)
          const offset = 20
          const normX = dx / len
          const normY = dy / len
          const startX = from.x + normX * offset
          const startY = from.y + normY * offset
          const endX = to.x - normX * offset
          const endY = to.y - normY * offset

          const edgeKey1 = `${edge.from}-${edge.to}`
          const edgeKey2 = `${edge.to}-${edge.from}`
          const isInMST = mstEdgeSet.has(edgeKey1) || mstEdgeSet.has(edgeKey2)
          const isInTSP = tspEdgeSet.has(edgeKey1)

          return (
            <g key={idx}>
              {/* TSP Tour (dashed purple) */}
              {isInTSP && (
                <line
                  x1={startX}
                  y1={startY}
                  x2={endX}
                  y2={endY}
                  stroke="#8b5cf6"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                  style={{ transition: "opacity 0.3s" }}
                />
              )}
              {/* MST (solid green) */}
              {isInMST && (
                <line
                  x1={startX}
                  y1={startY}
                  x2={endX}
                  y2={endY}
                  stroke="#22c55e"
                  strokeWidth="4"
                  style={{ transition: "stroke 0.3s" }}
                />
              )}
              {/* Weight label */}
              <text
                x={(startX + endX) / 2 + 10 * -normY}
                y={(startY + endY) / 2 + 10 * normX}
                textAnchor="middle"
                className="text-xs font-bold fill-blue-600"
              >
                {edge.weight}
              </text>
            </g>
          )
        })}

        {/* Nodes */}
        {nodes.map(node => {
          const isInMST = current.mstEdges?.some(e => e.includes(node.id))
          const isInTSP = tspTour.includes(node.id)
          return (
            <g key={node.id}>
              <circle
                cx={node.x}
                cy={node.y}
                r="20"
                fill={isInTSP ? "#8b5cf6" : isInMST ? "#22c55e" : "#ffffff"}
                stroke={isInTSP ? "#7c3aed" : isInMST ? "#16a34a" : "#6b7280"}
                strokeWidth="2"
              />
              <text
                x={node.x}
                y={node.y + 5}
                textAnchor="middle"
                className="text-sm font-bold"
                fill={isInTSP || isInMST ? "#ffffff" : "#374151"}
              >
                {node.label}
              </text>
            </g>
          )
        })}
      </svg>
    )
  }

  return (
    <VisualizerLayout
      title="MST-Based TSP Approximation"
      description="Visualize how MSTs provide a 2-approximation for the Traveling Salesman Problem"
      difficulty="Advanced"
      isPlaying={isPlaying}
      onPlay={play}
      onPause={pause}
      onStepBack={stepBack}
      onStepForward={stepForward}
      onReset={reset}
      currentStep={currentStep}
      totalSteps={mstSteps.length}
      complexity={{
        time: "O(V²)",
        space: "O(V²)",
      }}
      applications={applications}
    >
      <div className="w-full space-y-6">
        <div className="flex justify-center p-4 bg-muted/10 rounded-lg">{renderGraph()}</div>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">Pseudocode</CardTitle>
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

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Example</CardTitle>
            </CardHeader>
            <CardContent>
              <Select onValueChange={loadExample} defaultValue="usa6">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="usa6">6 US Cities</SelectItem>
                  <SelectItem value="random">Random Points</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Generate</CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={startAlgorithm} className="w-full">
                <Shuffle className="h-4 w-4 mr-2" />
                Run MST → TSP
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">MST Cost</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{mstCost}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">TSP Tour Cost</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{tspCost}</div>
              <div className="text-xs text-muted-foreground mt-1">
                ≤ 2 × MST (guaranteed for metric TSP)
              </div>
            </CardContent>
          </Card>
        </div>

        {tspTour.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">TSP Tour</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {tspTour.map((city, i) => (
                  <Badge key={i} variant={i === 0 || i === tspTour.length - 1 ? "default" : "secondary"}>
                    {city}
                  </Badge>
                ))}
              </div>
              <div className="text-sm text-muted-foreground mt-2">
                Generated by preorder traversal of MST. Returns to start.
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Legend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                <span>MST Edge / Node</span>
              </div>
              <div className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 16 16">
                  <line x1="0" y1="8" x2="16" y2="8" stroke="#8b5cf6" strokeWidth="2" strokeDasharray="3,3" />
                </svg>
                <span>TSP Tour (Approximate)</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </VisualizerLayout>
  )
}