"use client"

import { useState, useEffect, useCallback } from "react"
import { VisualizerLayout } from "../../../components/visualizer-layout"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "../../../components/ui/card"
import { Plus, Trash2, RefreshCcw, GitBranch, Play, Square, RotateCcw } from "lucide-react"
import type { JSX } from "react/jsx-runtime"

interface TreeNode {
  value: number
  id: string
  left?: TreeNode
  right?: TreeNode
  x?: number
  y?: number
  isHighlighted?: boolean
  isVisited?: boolean
  isFound?: boolean
  isBeingInserted?: boolean
}

interface TraversalStep {
  node: TreeNode
  description: string
  visitedNodes: string[]
  currentPath: string[]
  codeLine?: number
}

type TraversalType = "inorder" | "preorder" | "postorder" | "levelorder"
type TreeMode = "binary" | "bst"

export default function TreeVisualizerPage() {
  const [root, setRoot] = useState<TreeNode | null>(null)
  const [inputValue, setInputValue] = useState("")
  const [searchValue, setSearchValue] = useState("")
  const [traversalType, setTraversalType] = useState<TraversalType>("inorder")
  const [traversalSteps, setTraversalSteps] = useState<TraversalStep[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [traversalResult, setTraversalResult] = useState<number[]>([])
  const [treeHeight, setTreeHeight] = useState(0)
  const [nodeCount, setNodeCount] = useState(0)
  const [speed, setSpeed] = useState([1000])
  const [deleteValue, setDeleteValue] = useState("")
  const [mode, setMode] = useState<TreeMode>("bst")

  const applications = [
    {
      title: "Database Indexing",
      description: "B-trees and B+ trees optimize database queries and storage efficiency",
      examples: ["MySQL InnoDB indexes", "PostgreSQL B-tree indexes", "Database query optimization"],
    },
    {
      title: "File System Organization",
      description: "Operating systems use tree structures to organize files and directories",
      examples: ["Directory hierarchies", "File allocation tables", "Filesystem metadata"],
    },
    {
      title: "Expression Parsing",
      description: "Compilers use syntax trees to parse and evaluate mathematical expressions",
      examples: ["Abstract syntax trees", "Compiler design", "Mathematical expression evaluation"],
    },
    {
      title: "Decision Making Systems",
      description: "Decision trees help in machine learning and automated decision processes",
      examples: ["Machine learning algorithms", "Expert systems", "Game AI decision trees"],
    },
  ]

  useEffect(() => {
    resetTree()
  }, [mode])

  const resetTree = () => {
    if (mode === "bst") {
      const sampleBST: TreeNode = {
        value: 50,
        id: "50",
        left: {
          value: 30,
          id: "30",
          left: { value: 20, id: "20" },
          right: { value: 40, id: "40" },
        },
        right: {
          value: 70,
          id: "70",
          left: { value: 60, id: "60" },
          right: { value: 80, id: "80" },
        },
      }
      setRoot(sampleBST)
      calculateTreeMetrics(sampleBST)
    } else {
      const sampleBT: TreeNode = {
        value: 10,
        id: "10",
        left: {
          value: 20,
          id: "20",
          left: { value: 40, id: "40" },
          right: { value: 50, id: "50" },
        },
        right: {
          value: 30,
          id: "30",
          left: { value: 60, id: "60" },
          right: { value: 70, id: "70" },
        },
      }
      setRoot(sampleBT)
      calculateTreeMetrics(sampleBT)
    }
    resetTraversal()
  }

  const resetTraversal = () => {
    setTraversalSteps([])
    setTraversalResult([])
    setCurrentStep(0)
    setIsPlaying(false)
  }

  const calculateTreeMetrics = (node: TreeNode | null): void => {
    if (!node) {
      setTreeHeight(0)
      setNodeCount(0)
      return
    }

    const getHeight = (n: TreeNode | null): number => {
      if (!n) return 0
      return 1 + Math.max(getHeight(n.left), getHeight(n.right))
    }

    const countNodes = (n: TreeNode | null): number => {
      if (!n) return 0
      return 1 + countNodes(n.left) + countNodes(n.right)
    }

    setTreeHeight(getHeight(node))
    setNodeCount(countNodes(node))
  }

  const insertNode = (value: number): void => {
    if (value === undefined || value === null || isNaN(value)) return

    const newNode = { value, id: `${value}-${Date.now()}` }

    if (!root) {
      setRoot(newNode)
      calculateTreeMetrics(newNode)
      setInputValue("")
      resetTraversal()
      return
    }

    if (mode === "bst") {
      const insert = (node: TreeNode | null, val: number): TreeNode => {
        if (!node) return { value: val, id: val.toString() }
        if (val < node.value) {
          node.left = insert(node.left, val)
        } else if (val > node.value) {
          node.right = insert(node.right, val)
        }
        return node
      }
      const newRoot = insert(root, value)
      setRoot(newRoot)
      calculateTreeMetrics(newRoot)
    } else {
      const insertLevelOrder = (root: TreeNode, newNode: TreeNode): TreeNode => {
        const queue: TreeNode[] = [root]
        while (queue.length > 0) {
          const current = queue.shift()!
          if (!current.left) {
            current.left = newNode
            return root
          } else if (!current.right) {
            current.right = newNode
            return root
          } else {
            queue.push(current.left)
            queue.push(current.right)
          }
        }
        return root
      }
      const newRoot = insertLevelOrder({ ...root }, newNode)
      setRoot(newRoot)
      calculateTreeMetrics(newRoot)
    }

    setInputValue("")
    resetTraversal()
  }

  const searchNode = (value: number): boolean => {
    if (!root) return false

    const search = (node: TreeNode | null, val: number): boolean => {
      if (!node) return false
      if (node.value === val) {
        node.isFound = true
        return true
      }
      node.isVisited = true
      return search(node.left, val) || search(node.right, val)
    }

    resetNodeStates(root)
    const found = search(root, value)
    setRoot({ ...root })
    return found
  }

  const resetNodeStates = (node: TreeNode | null): void => {
    if (!node) return
    node.isHighlighted = false
    node.isVisited = false
    node.isFound = false
    node.isBeingInserted = false
    resetNodeStates(node.left)
    resetNodeStates(node.right)
  }

  const deleteNode = (value: number): void => {
    if (!root) return

    if (mode === "bst") {
      const deleteNodeHelper = (node: TreeNode | null, val: number): TreeNode | null => {
        if (!node) return null
        if (val < node.value) {
          node.left = deleteNodeHelper(node.left, val)
        } else if (val > node.value) {
          node.right = deleteNodeHelper(node.right, val)
        } else {
          if (!node.left) return node.right
          if (!node.right) return node.left
          const minRight = findMin(node.right)
          node.value = minRight.value
          node.id = minRight.id
          node.right = deleteNodeHelper(node.right, minRight.value)
        }
        return node
      }

      const findMin = (node: TreeNode): TreeNode => {
        while (node.left) node = node.left
        return node
      }

      const newRoot = deleteNodeHelper(root, value)
      setRoot(newRoot)
      calculateTreeMetrics(newRoot)
    } else {
      alert("Deletion in generic Binary Tree is complex and often not visualized. Try BST mode for deletion.")
      return
    }

    resetTraversal()
  }

  const pseudocodeDefinitions = {
    inorder: [
      "function inorder(node):",
      "  if node is null:",
      "    return",
      "  inorder(node.left)",
      "  visit(node)",
      "  inorder(node.right)",
    ],
    preorder: [
      "function preorder(node):",
      "  if node is null:",
      "    return",
      "  visit(node)",
      "  preorder(node.left)",
      "  preorder(node.right)",
    ],
    postorder: [
      "function postorder(node):",
      "  if node is null:",
      "    return",
      "  postorder(node.left)",
      "  postorder(node.right)",
      "  visit(node)",
    ],
    levelorder: [
      "function levelorder(root):",
      "  if root is null:",
      "    return",
      "  queue = [root]",
      "  while queue is not empty:",
      "    node = queue.pop()",
      "    visit(node)",
      "    if node.left:",
      "      queue.push(node.left)",
      "    if node.right:",
      "      queue.push(node.right)",
    ],
  }

  const performTraversal = (type: TraversalType): void => {
    if (!root) return

    const steps: TraversalStep[] = []
    const result: number[] = []
    const visited: string[] = []

    const pushStep = (
      node: TreeNode,
      description: string,
      codeLine: number,
      currentPath: string[] = []
    ) => {
      steps.push({
        node,
        description,
        visitedNodes: [...visited],
        currentPath,
        codeLine,
      })
    }

    const inorderTraversal = (node: TreeNode | null, path: string[] = []): void => {
      if (!node) {
        pushStep({ value: -1, id: "null" } as TreeNode, "Node is null, return", 2, path)
        return
      }
      const currentPath = [...path, node.id]
      pushStep(node, `Traverse left of ${node.value}`, 4, currentPath)
      inorderTraversal(node.left, currentPath)
      visited.push(node.id)
      result.push(node.value)
      pushStep(node, `Visit node ${node.value}`, 5, currentPath)
      pushStep(node, `Traverse right of ${node.value}`, 6, currentPath)
      inorderTraversal(node.right, currentPath)
    }

    const preorderTraversal = (node: TreeNode | null, path: string[] = []): void => {
      if (!node) {
        pushStep({ value: -1, id: "null" } as TreeNode, "Node is null, return", 2, path)
        return
      }
      const currentPath = [...path, node.id]
      visited.push(node.id)
      result.push(node.value)
      pushStep(node, `Visit node ${node.value}`, 4, currentPath)
      pushStep(node, `Traverse left of ${node.value}`, 5, currentPath)
      preorderTraversal(node.left, currentPath)
      pushStep(node, `Traverse right of ${node.value}`, 6, currentPath)
      preorderTraversal(node.right, currentPath)
    }

    const postorderTraversal = (node: TreeNode | null, path: string[] = []): void => {
      if (!node) {
        pushStep({ value: -1, id: "null" } as TreeNode, "Node is null, return", 2, path)
        return
      }
      const currentPath = [...path, node.id]
      pushStep(node, `Traverse left of ${node.value}`, 4, currentPath)
      postorderTraversal(node.left, currentPath)
      pushStep(node, `Traverse right of ${node.value}`, 5, currentPath)
      postorderTraversal(node.right, currentPath)
      visited.push(node.id)
      result.push(node.value)
      pushStep(node, `Visit node ${node.value}`, 6, currentPath)
    }

    const levelorderTraversal = (): void => {
      const queue: TreeNode[] = [root]
      let level = 0

      while (queue.length > 0) {
        const levelSize = queue.length
        steps.push({
          node: root,
          description: `Processing level ${level}`,
          visitedNodes: [...visited],
          currentPath: [],
        })

        for (let i = 0; i < levelSize; i++) {
          const node = queue.shift()!
          visited.push(node.id)
          result.push(node.value)

          steps.push({
            node,
            description: `Processing node ${node.value} at level ${level}`,
            visitedNodes: [...visited],
            currentPath: [node.id],
          })

          if (node.left) queue.push(node.left)
          if (node.right) queue.push(node.right)
        }
        level++
      }
    }

    resetNodeStates(root)

    switch (type) {
      case "inorder":
        inorderTraversal(root)
        break
      case "preorder":
        preorderTraversal(root)
        break
      case "postorder":
        postorderTraversal(root)
        break
      case "levelorder":
        levelorderTraversal()
        break
    }

    setTraversalSteps(steps)
    setTraversalResult(result)
    setCurrentStep(0)
    setIsPlaying(true)
  }

  const calculateNodePositions = useCallback((node: TreeNode | null, x = 400, y = 50, level = 0): TreeNode | null => {
    if (!node) return null
    const spacing = Math.max(200 / (level + 1), 50)
    return {
      ...node,
      x,
      y,
      left: node.left ? calculateNodePositions(node.left, x - spacing, y + 80, level + 1) : null,
      right: node.right ? calculateNodePositions(node.right, x + spacing, y + 80, level + 1) : null,
    }
  }, [])

  const renderTree = (node: TreeNode | null): JSX.Element | null => {
    if (!node) return null

    const currentStepData = traversalSteps[currentStep]
    const isCurrentNode = currentStepData?.node.id === node.id
    const isVisited = currentStepData?.visitedNodes.includes(node.id)

    return (
      <g key={node.id}>
        {node.left && <line x1={node.x} y1={node.y} x2={node.left.x} y2={node.left.y} stroke="#e5e7eb" strokeWidth="2" />}
        {node.right && <line x1={node.x} y1={node.y} x2={node.right.x} y2={node.right.y} stroke="#e5e7eb" strokeWidth="2" />}

        {renderTree(node.left)}
        {renderTree(node.right)}

        <circle
          cx={node.x}
          cy={node.y}
          r="25"
          fill={
            node.isFound
              ? "#22c55e"
              : isCurrentNode
                ? "#6366f1"
                : isVisited
                  ? "#f59e0b"
                  : node.isVisited
                    ? "#ef4444"
                    : "#ffffff"
          }
          stroke={
            node.isFound
              ? "#16a34a"
              : isCurrentNode
                ? "#4f46e5"
                : isVisited
                  ? "#d97706"
                  : node.isVisited
                    ? "#dc2626"
                    : "#6b7280"
          }
          strokeWidth="2"
          className="cursor-pointer transition-all duration-300"
        />
        <text
          x={node.x}
          y={node.y + 5}
          textAnchor="middle"
          className="text-sm font-bold fill-current"
          fill={node.isFound || isCurrentNode || isVisited || node.isVisited ? "#ffffff" : "#374151"}
        >
          {node.value}
        </text>
      </g>
    )
  }

  const stepForward = () => {
    if (currentStep < traversalSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      setIsPlaying(false)
    }
  }

  useEffect(() => {
    if (isPlaying && currentStep < traversalSteps.length - 1) {
      const timer = setTimeout(() => stepForward(), speed[0])
      return () => clearTimeout(timer)
    } else if (currentStep >= traversalSteps.length - 1) {
      setIsPlaying(false)
    }
  }, [isPlaying, currentStep, traversalSteps.length, speed])

  const positionedRoot = calculateNodePositions(root)
  const currentPseudocode = pseudocodeDefinitions[traversalType]
  const currentCodeLine = traversalSteps[currentStep]?.codeLine ?? -1

  // Local control handlers
  const handleStart = () => {
    if (traversalSteps.length === 0) {
      performTraversal(traversalType)
    } else {
      setIsPlaying(true)
    }
  }

  const handlePause = () => {
    setIsPlaying(false)
  }

  const handleResetTraversal = () => {
    resetTraversal()
    resetNodeStates(root)
    setRoot({ ...root })
  }

  return (
    <VisualizerLayout
      title="Binary Tree & BST Visualizer"
      description="Compare generic binary trees and binary search trees with interactive operations"
      difficulty="Intermediate"
      // Removed global controls
      complexity={{
        time: mode === "bst" ? "O(log n) avg, O(n) worst" : "O(n)",
        space: "O(h)",
      }}
      applications={applications}
    >
      <div className="w-full space-y-6">
        {/* Mode Selector */}
        <Card className="bg-orange-50 border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <GitBranch className="h-5 w-5" />
              Tree Type
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <button
                onClick={() => setMode("binary")}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  mode === "binary"
                    ? "bg-blue-600 text-white"
                    : "bg-muted hover:bg-muted/80"
                }`}
              >
                Binary Tree (BT)
              </button>
              <button
                onClick={() => setMode("bst")}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  mode === "bst"
                    ? "bg-green-600 text-white"
                    : "bg-muted hover:bg-muted/80"
                }`}
              >
                Binary Search Tree (BST)
              </button>
            </div>
            <CardDescription className="text-sm">
              {mode === "binary"
                ? "A Binary Tree allows any structure—each node has up to two children with no ordering rules. Used in expression trees, Huffman coding, and more."
                : "A Binary Search Tree enforces ordering: left child < parent < right child. Enables efficient search, insertion, and deletion."}
            </CardDescription>
          </CardContent>
        </Card>

        {/* Tree Visualization */}
        <div className="bg-muted/10 rounded-lg p-4 min-h-[400px] overflow-auto">
          <svg width="800" height="400" className="mx-auto">
            {positionedRoot && renderTree(positionedRoot)}
          </svg>
        </div>

        {/* Controls Row */}
        <div className="flex flex-wrap gap-4 mb-2">
          <button
            onClick={() => generateRandomTree()}
            className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700"
            title="Generate Random Tree"
          >
            <RefreshCcw className="h-5 w-5" />
            Random Tree
          </button>
        </div>

        {/* Pseudocode Panel */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">Pseudocode</CardTitle>
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
                <span className="text-xs text-muted-foreground/70 mr-3">{index + 1}</span>
                {line || "\u00A0"}
              </div>
            ))}
          </div>
        </Card>

        {/* Tree Operations */}
        <div className="grid md:grid-cols-4 gap-4">
          {/* Insert */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Insert Node
              </CardTitle>
            </CardHeader>
            <div className="p-4 pt-0 space-y-3">
              <input
                type="number"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Enter value"
                className="w-full px-3 py-2 border rounded-md"
                onKeyPress={(e) => e.key === "Enter" && insertNode(Number(inputValue))}
              />
              <button
                onClick={() => insertNode(Number(inputValue))}
                disabled={!inputValue}
                className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                Insert
              </button>
            </div>
          </Card>

          {/* Search */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Search Node</CardTitle>
            </CardHeader>
            <div className="p-4 pt-0 space-y-3">
              <input
                type="number"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Enter value to search"
                className="w-full px-3 py-2 border rounded-md"
                onKeyPress={(e) => e.key === "Enter" && searchNode(Number(searchValue))}
              />
              <button
                onClick={() => searchNode(Number(searchValue))}
                disabled={!searchValue}
                className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                Search
              </button>
            </div>
          </Card>

          {/* Delete */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Trash2 className="h-5 w-5" />
                Delete Node
              </CardTitle>
            </CardHeader>
            <div className="p-4 pt-0 space-y-3">
              <input
                type="number"
                value={deleteValue}
                onChange={(e) => setDeleteValue(e.target.value)}
                placeholder="Enter value to delete"
                className="w-full px-3 py-2 border rounded-md"
                onKeyPress={(e) => e.key === "Enter" && handleDeleteNode()}
              />
              <button
                onClick={handleDeleteNode}
                disabled={!deleteValue || mode === "binary"}
                className={`w-full py-2 rounded-md ${
                  mode === "binary"
                    ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                    : "bg-red-600 text-white hover:bg-red-700"
                }`}
                title={mode === "binary" ? "Deletion not supported in generic Binary Tree mode" : ""}
              >
                {mode === "binary" ? "Delete (BST Only)" : "Delete"}
              </button>
            </div>
          </Card>

          {/* Traversal Controls — Updated */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tree Traversal</CardTitle>
            </CardHeader>
            <div className="p-4 pt-0 space-y-3">
              <select
                value={traversalType}
                onChange={(e) => {
                  setTraversalType(e.target.value as TraversalType)
                  resetTraversal()
                }}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="inorder">Inorder (L-Root-R)</option>
                <option value="preorder">Preorder (Root-L-R)</option>
                <option value="postorder">Postorder (L-R-Root)</option>
                <option value="levelorder">Level Order (BFS)</option>
              </select>
              <div className="flex gap-2">
                {!isPlaying ? (
                  <button
                    onClick={handleStart}
                    className="flex-1 bg-purple-600 text-white py-2 rounded-md hover:bg-purple-700 flex items-center justify-center gap-1"
                  >
                    <Play className="h-4 w-4" /> Start
                  </button>
                ) : (
                  <button
                    onClick={handlePause}
                    className="flex-1 bg-yellow-600 text-white py-2 rounded-md hover:bg-yellow-700 flex items-center justify-center gap-1"
                  >
                    <Square className="h-4 w-4" /> Pause
                  </button>
                )}
                <button
                  onClick={handleResetTraversal}
                  className="flex-1 bg-gray-600 text-white py-2 rounded-md hover:bg-gray-700 flex items-center justify-center gap-1"
                >
                  <RotateCcw className="h-4 w-4" /> Reset
                </button>
              </div>
            </div>
          </Card>

          {/* Speed Control */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Speed</CardTitle>
            </CardHeader>
            <div className="p-4 pt-0 space-y-3">
              <input
                type="range"
                min={200}
                max={2000}
                step={100}
                value={speed[0]}
                onChange={e => setSpeed([parseInt(e.target.value)])}
                className="w-full"
                disabled={isPlaying}
              />
              <div className="text-sm text-muted-foreground text-center">
                {speed[0] <= 400 ? "Fast" : speed[0] <= 1000 ? "Medium" : "Slow"}
              </div>
            </div>
          </Card>
        </div>

        {/* Metrics */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">Tree Height</CardTitle>
            </CardHeader>
            <div className="p-4 pt-0">
              <div className="text-2xl font-bold text-blue-600">{treeHeight}</div>
            </div>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">Node Count</CardTitle>
            </CardHeader>
            <div className="p-4 pt-0">
              <div className="text-2xl font-bold text-green-600">{nodeCount}</div>
            </div>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">Traversal Result</CardTitle>
            </CardHeader>
            <div className="p-4 pt-0">
              <div className="text-sm font-mono bg-muted p-2 rounded">[{traversalResult.join(", ")}]</div>
            </div>
          </Card>
        </div>

        {/* Step Info */}
        {traversalSteps.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Traversal Progress</CardTitle>
            </CardHeader>
            <div className="p-4 pt-0">
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">
                  Step {currentStep + 1} of {traversalSteps.length}
                </div>
                <div className="text-base">{traversalSteps[currentStep]?.description}</div>
                <div className="text-sm text-muted-foreground">
                  Visited: [{traversalSteps[currentStep]?.visitedNodes.join(", ")}]
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </VisualizerLayout>
  )

  // Utility to generate random tree
  function generateRandomTree(nodeCount = 7, min = 10, max = 99) {
    const values = new Set<number>()
    while (values.size < nodeCount) {
      values.add(Math.floor(Math.random() * (max - min + 1)) + min)
    }
    const arr = Array.from(values)
    let newRoot: TreeNode | null = null

    if (mode === "bst") {
      const insert = (node: TreeNode | null, val: number): TreeNode => {
        if (!node) return { value: val, id: val.toString() }
        if (val < node.value) node.left = insert(node.left, val)
        else if (val > node.value) node.right = insert(node.right, val)
        return node
      }
      for (const v of arr) {
        newRoot = insert(newRoot, v)
      }
    } else {
      if (arr.length === 0) return
      newRoot = { value: arr[0], id: `${arr[0]}-${Date.now()}` }
      const queue: TreeNode[] = [newRoot]
      for (let i = 1; i < arr.length; i++) {
        const parent = queue[0]
        const newNode = { value: arr[i], id: `${arr[i]}-${Date.now()}` }
        if (!parent.left) {
          parent.left = newNode
        } else {
          parent.right = newNode
          queue.shift()
        }
        queue.push(newNode)
      }
    }

    setRoot(newRoot)
    calculateTreeMetrics(newRoot)
    resetTraversal()
  }

  function handleDeleteNode() {
    if (!deleteValue) return
    deleteNode(Number(deleteValue))
    setDeleteValue("")
  }
}