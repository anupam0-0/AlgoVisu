"use client"

import React, { useState, useEffect, useCallback, useRef } from "react"
import { VisualizerLayout } from "../../../components/visualizer-layout"
import { Button } from "../../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select"
import { Slider } from "../../../components/ui/slider"
import { Play, RotateCcw, Eraser, MousePointer2 } from "lucide-react"

// Types
type NodeType = "start" | "target" | "wall" | "default" | "visited" | "path"
type Algorithm = "dijkstra" | "astar" | "bfs" | "dfs"

interface Node {
    row: number
    col: number
    type: NodeType
    distance: number
    isVisited: boolean
    previousNode: Node | null
    totalDistance: number // For A* (f = g + h)
    heuristic: number     // For A* (h)
}

const ROWS = 25
const COLS = 50

// Heuristics for A*
const manhattanDistance = (node: Node, target: Node) => {
    return Math.abs(node.row - target.row) + Math.abs(node.col - target.col)
}

export default function PathfindingVisualizer() {
    // State
    const [grid, setGrid] = useState<Node[][]>([])
    const [isMousePressed, setIsMousePressed] = useState(false)
    const [nodeTypeToPlace, setNodeTypeToPlace] = useState<"wall" | "start" | "target">("wall")
    const [startNodePos, setStartNodePos] = useState({ row: 12, col: 10 })
    const [targetNodePos, setTargetNodePos] = useState({ row: 12, col: 40 })
    const [algorithm, setAlgorithm] = useState<Algorithm>("dijkstra")
    const [isPlaying, setIsPlaying] = useState(false)
    const [speed, setSpeed] = useState([10])
    const [stats, setStats] = useState({ visited: 0, pathLength: 0, time: 0 })

    // Initialize Grid
    const createNode = (row: number, col: number): Node => {
        return {
            row,
            col,
            type: "default",
            distance: Infinity,
            isVisited: false,
            previousNode: null,
            totalDistance: Infinity,
            heuristic: 0
        }
    }

    const initializeGrid = useCallback((resetWalls = true) => {
        const newGrid: Node[][] = []
        for (let r = 0; r < ROWS; r++) {
            const currentRow: Node[] = []
            for (let c = 0; c < COLS; c++) {
                let node = createNode(r, c)
                if (!resetWalls && grid[r] && grid[r][c].type === "wall") {
                    node.type = "wall"
                }
                if (r === startNodePos.row && c === startNodePos.col) node.type = "start"
                if (r === targetNodePos.row && c === targetNodePos.col) node.type = "target"
                currentRow.push(node)
            }
            newGrid.push(currentRow)
        }
        setGrid(newGrid)
        setStats({ visited: 0, pathLength: 0, time: 0 })
    }, [startNodePos, targetNodePos]) // Removed 'grid' dependency to prevent feedback loop

    // Only run once on mount
    useEffect(() => {
        initializeGrid(true)
    }, [])

    // Mouse Handlers
    const handleMouseDown = (row: number, col: number) => {
        if (isPlaying) return
        setIsMousePressed(true)
        handleNodeClick(row, col)
    }

    const handleMouseEnter = (row: number, col: number) => {
        if (!isMousePressed || isPlaying) return
        handleNodeClick(row, col)
    }

    const handleMouseUp = () => {
        setIsMousePressed(false)
    }

    const handleNodeClick = (row: number, col: number) => {
        // Prevent overriding start/target unless logic handles dragging them (simplified here to Walls only)
        if ((row === startNodePos.row && col === startNodePos.col) ||
            (row === targetNodePos.row && col === targetNodePos.col)) {
            return
        }

        const newGrid = [...grid]
        const node = newGrid[row][col]

        // Toggle Wall
        if (node.type === "wall") {
            node.type = "default"
        } else if (node.type === "default" || node.type === "visited" || node.type === "path") {
            node.type = "wall"
        }
        setGrid(newGrid)
    }

    // ALGORITHMS
    const getNeighbors = (node: Node, grid: Node[][]) => {
        const neighbors: Node[] = []
        const { row, col } = node
        if (row > 0) neighbors.push(grid[row - 1][col])
        if (row < ROWS - 1) neighbors.push(grid[row + 1][col])
        if (col > 0) neighbors.push(grid[row][col - 1])
        if (col < COLS - 1) neighbors.push(grid[row][col + 1])
        return neighbors.filter(n => n.type !== "wall")
    }

    const runDijkstra = async (grid: Node[][], startNode: Node, targetNode: Node) => {
        startNode.distance = 0
        const unvisitedNodes = grid.flat()
        const visitedNodesInOrder: Node[] = []

        // Using a simple array as PQ for simplicity (O(N^2)), sufficient for 25x50
        // In production, use a MinHeap for O(E log V)

        while (unvisitedNodes.length) {
            unvisitedNodes.sort((a, b) => a.distance - b.distance)
            const closestNode = unvisitedNodes.shift()
            if (!closestNode || closestNode.distance === Infinity) return visitedNodesInOrder // No path

            closestNode.isVisited = true
            visitedNodesInOrder.push(closestNode)

            if (closestNode === targetNode) return visitedNodesInOrder

            const neighbors = getNeighbors(closestNode, grid)
            for (const neighbor of neighbors) {
                if (!neighbor.isVisited) {
                    const newDist = closestNode.distance + 1
                    if (newDist < neighbor.distance) {
                        neighbor.distance = newDist
                        neighbor.previousNode = closestNode
                    }
                }
            }
        }
        return visitedNodesInOrder
    }

    const runAStar = async (grid: Node[][], startNode: Node, targetNode: Node) => {
        startNode.distance = 0
        startNode.totalDistance = manhattanDistance(startNode, targetNode)

        let openSet = [startNode]
        const visitedNodesInOrder: Node[] = []

        while (openSet.length) {
            // Sort by f-score (totalDistance)
            openSet.sort((a, b) => a.totalDistance - b.totalDistance)
            const current = openSet.shift()
            if (!current) break

            current.isVisited = true
            visitedNodesInOrder.push(current)

            if (current === targetNode) return visitedNodesInOrder

            const neighbors = getNeighbors(current, grid)
            for (const neighbor of neighbors) {
                if (neighbor.isVisited) continue

                const tempG = current.distance + 1
                if (tempG < neighbor.distance) {
                    neighbor.previousNode = current
                    neighbor.distance = tempG
                    neighbor.heuristic = manhattanDistance(neighbor, targetNode)
                    neighbor.totalDistance = neighbor.distance + neighbor.heuristic

                    if (!openSet.includes(neighbor)) {
                        openSet.push(neighbor)
                    }
                }
            }
        }
        return visitedNodesInOrder
    }

    const runBFS = async (grid: Node[][], startNode: Node, targetNode: Node) => {
        const queue = [startNode]
        startNode.isVisited = true
        const visitedNodesInOrder: Node[] = []

        while (queue.length) {
            const current = queue.shift()
            if (!current) break
            visitedNodesInOrder.push(current)

            if (current === targetNode) return visitedNodesInOrder

            const neighbors = getNeighbors(current, grid)
            for (const neighbor of neighbors) {
                if (!neighbor.isVisited && neighbor.previousNode === null && neighbor !== startNode) {
                    neighbor.isVisited = true
                    neighbor.previousNode = current
                    queue.push(neighbor)
                }
            }
        }
        return visitedNodesInOrder
    }

    // Animation
    const animatePath = (visitedNodesInOrder: Node[], EndNode: Node) => {
        // 1. Animate Visitation
        for (let i = 0; i <= visitedNodesInOrder.length; i++) {
            if (i === visitedNodesInOrder.length) {
                setTimeout(() => {
                    animateShortestPath(EndNode)
                }, speed[0] * i)
                return
            }
            setTimeout(() => {
                const node = visitedNodesInOrder[i]
                // Direct DOM manipulation for performance on simple grid, OR state update
                // Using state for React purity but performance might be hit.
                // Let's use ClassName update via Ref or straightforward re-render if it's not too slow.
                // For 1250 nodes, setState might be laggy. Direct DOM is better.
                // BUT strict React is preferred. Let's try to update the 'type' in state?
                // Actually, let's use document.getElementById with a specific ID strategy to be super fast.
                const el = document.getElementById(`node-${node.row}-${node.col}`)
                if (el && node.type !== "start" && node.type !== "target") {
                    el.className = `w-full h-full border-[0.5px] border-sky-100 bg-sky-500 animate-pulse`
                }
            }, speed[0] * i)
        }
    }

    const animateShortestPath = (EndNode: Node) => {
        const shortestPathNodes: Node[] = []
        let currentNode: Node | null = EndNode
        while (currentNode !== null) {
            shortestPathNodes.unshift(currentNode)
            currentNode = currentNode.previousNode
        }

        // Stats
        const startTime = performance.now() // Mock timing relative to animation

        for (let i = 0; i < shortestPathNodes.length; i++) {
            setTimeout(() => {
                const node = shortestPathNodes[i]
                const el = document.getElementById(`node-${node.row}-${node.col}`)
                if (el && node.type !== "start" && node.type !== "target") {
                    el.className = `w-full h-full border-[0.5px] border-yellow-200 bg-yellow-400 scale-110 transition-transform`
                }
                if (i === shortestPathNodes.length - 1) {
                    setIsPlaying(false)
                    setStats(prev => ({ ...prev, pathLength: shortestPathNodes.length }))
                }
            }, 30 * i)
        }
    }

    const visualize = async () => {
        if (isPlaying) return
        setIsPlaying(true)

        // Soft reset (keep walls)
        initializeGrid(false) // Wait, this resets visited states but keeps walls.
        // Need to handle soft reset of previous paths specifically if they exist on the DOM
        // For now, re-initialize state does the job logic-wise, but DOM needs cleanup.
        // Let's force a clean DOM update via key or explicit reset loop

        // We need to re-fetch the FRESH grid from state updater or refs?
        // State 'grid' is currently holding old visited data if we didn't clear.
        // Actually, initializeGrid(false) sets a NEW grid object with defaults but copies walls.
        // So 'grid' variable here is STALE. We need to use the functional update or effects.

        // hack: just delay execution slightly or use refs. 
        // better: Split reset logic.

        // Let's perform the algorithm on the CURRENT grid (which we just reset visually?? no).

        // CORRECT FLOW:
        // 1. Reset Board Logic (keep walls)
        // 2. Wait for state update
        // 3. Run Algo

        // To simplifiy, let's just create a local copy to run algo on, based on current known walls.
        const cleanGrid: Node[][] = []
        for (let r = 0; r < ROWS; r++) {
            const row: Node[] = []
            for (let c = 0; c < COLS; c++) {
                let node = createNode(r, c)
                // Persist walls from current state
                if (grid[r][c].type === "wall") node.type = "wall"
                if (r === startNodePos.row && c === startNodePos.col) node.type = "start"
                if (r === targetNodePos.row && c === targetNodePos.col) node.type = "target"

                // Reset DOM styles manually
                const el = document.getElementById(`node-${r}-${c}`)
                if (el) {
                    const type = node.type
                    if (type === 'start') el.className = "w-full h-full bg-green-500"
                    else if (type === 'target') el.className = "w-full h-full bg-red-500"
                    else if (type === 'wall') el.className = "w-full h-full bg-slate-800"
                    else el.className = "w-full h-full border-[0.5px] border-slate-200 bg-white"
                }

                row.push(node)
            }
            cleanGrid.push(row)
        }

        const startNode = cleanGrid[startNodePos.row][startNodePos.col]
        const targetNode = cleanGrid[targetNodePos.row][targetNodePos.col]

        let visitedNodes: Node[] = []
        if (algorithm === "dijkstra") visitedNodes = await runDijkstra(cleanGrid, startNode, targetNode)
        else if (algorithm === "astar") visitedNodes = await runAStar(cleanGrid, startNode, targetNode)
        else if (algorithm === "bfs") visitedNodes = await runBFS(cleanGrid, startNode, targetNode)

        setStats({ visited: visitedNodes.length, pathLength: 0, time: 0 })
        animatePath(visitedNodes, targetNode)
    }

    const clearBoard = () => {
        initializeGrid(true)
        // Clear DOM
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                const el = document.getElementById(`node-${r}-${c}`)
                if (el) {
                    // Default styles
                    const isStart = r === startNodePos.row && c === startNodePos.col
                    const isTarget = r === targetNodePos.row && c === targetNodePos.col
                    if (isStart) el.className = "w-full h-full bg-green-500"
                    else if (isTarget) el.className = "w-full h-full bg-red-500"
                    else el.className = "w-full h-full border-[0.5px] border-slate-200 bg-white"
                }
            }
        }
        setIsPlaying(false)
    }

    // Grid Cell Helper
    const getCellClass = (node: Node) => {
        const { type } = node
        if (type === "start") return "bg-green-500"
        if (type === "target") return "bg-red-500"
        if (type === "wall") return "bg-slate-800"
        return "border-[0.5px] border-slate-200 bg-white"
    }

    return (
        <VisualizerLayout
            title="Pathfinding Visualizer"
            description="Visualize A*, Dijkstra, and BFS finding the shortest path"
            difficulty="Advanced"
            onReset={clearBoard}
            applications={[
                { title: "GPS Navigation", description: "Finding shortest driving routes", examples: ["Google Maps", "Uber"] },
                { title: "Network Routing", description: "Packet routing in computer networks", examples: ["OSPF", "IS-IS"] },
                { title: "Game AI", description: "NPCs finding paths around obstacles", examples: ["StarCraft", "Unity NavMesh"] }
            ]}
        >
            <div className="space-y-6">
                {/* Controls */}
                <Card>
                    <CardHeader className="pb-3 pl-6">
                        <CardTitle>Controls</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-wrap items-end gap-4">
                        <div className="grid w-[180px] items-center gap-1.5">
                            <span className="text-sm font-medium">Algorithm</span>
                            <Select value={algorithm} onValueChange={(v: Algorithm) => setAlgorithm(v)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="dijkstra">Dijkstra&apos;s Algorithm</SelectItem>
                                    <SelectItem value="astar">A* Search</SelectItem>
                                    <SelectItem value="bfs">Breadth-First Search (BFS)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <Button onClick={visualize} disabled={isPlaying} className="bg-primary text-primary-foreground hover:bg-primary/90">
                            <Play className="mr-2 h-4 w-4" /> Visualize
                        </Button>

                        <Button variant="outline" onClick={clearBoard} disabled={isPlaying}>
                            <RotateCcw className="mr-2 h-4 w-4" /> Clear Board
                        </Button>

                        <div className="px-4 border-l">
                            <div className="text-sm font-medium mb-2">Speed</div>
                            <Slider
                                value={speed} onValueChange={setSpeed}
                                min={5} max={100} step={5} className="w-[100px]"
                            // Invert logic visually if needed, but 10ms is fast, 100ms is slow
                            />
                        </div>

                        <div className="ml-auto text-sm text-muted-foreground flex gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-green-500 rounded-sm"></div> Start
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-red-500 rounded-sm"></div> Target
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-slate-800 rounded-sm"></div> Wall
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                    <Card className="p-4 flex flex-col items-center">
                        <div className="text-2xl font-bold">{stats.visited}</div>
                        <div className="text-xs text-muted-foreground uppercase tracking-wider">Visited Nodes</div>
                    </Card>
                    <Card className="p-4 flex flex-col items-center">
                        <div className="text-2xl font-bold">{stats.pathLength}</div>
                        <div className="text-xs text-muted-foreground uppercase tracking-wider">Path Length</div>
                    </Card>
                    <Card className="p-4 flex flex-col items-center">
                        <div className="text-2xl font-bold text-primary">{algorithm === 'astar' ? 'Optimal' : algorithm === 'bfs' ? 'Shortest' : 'Shortest'}</div>
                        <div className="text-xs text-muted-foreground uppercase tracking-wider">Guarantee</div>
                    </Card>
                </div>

                {/* The Grid */}
                <div className="flex justify-center overflow-auto p-4 border rounded-lg bg-muted/10">
                    <div
                        className="relative border-2 border-slate-900 bg-slate-100 shadow-xl overflow-hidden touch-none select-none"
                        style={{
                            display: 'grid',
                            gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))`,
                            width: 'fit-content'
                        }}
                        onMouseLeave={handleMouseUp}
                    >
                        {grid.map((row, r) => (
                            row.map((node, c) => (
                                <div
                                    key={`${r}-${c}`}
                                    id={`node-${r}-${c}`}
                                    className={`w-6 h-6 ${getCellClass(node)}`} // Removed transition for dragging perf
                                    onMouseDown={() => handleMouseDown(r, c)}
                                    onMouseEnter={() => handleMouseEnter(r, c)}
                                    onMouseUp={handleMouseUp}
                                />
                            ))
                        ))}
                    </div>
                </div>

                <div className="text-center text-sm text-muted-foreground">
                    Click and drag to place walls. Algorithms will navigate around them.
                </div>
            </div>
        </VisualizerLayout>
    )
}
