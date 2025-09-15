"use client"

import { useState, useEffect, useCallback } from "react"
import { VisualizerLayout } from "../../../components/visualizer-layout"
import { Card, CardHeader, CardTitle } from "../../../components/ui/card"
import { Plus } from "lucide-react"
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
}

type TraversalType = "inorder" | "preorder" | "postorder" | "levelorder"

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

  // Added real-world applications for trees and BST
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

  // Initialize with sample tree
  useEffect(() => {
    const sampleTree: TreeNode = {
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
    setRoot(sampleTree)
    calculateTreeMetrics(sampleTree)
  }, [])

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
    if (!value) return

    const insert = (node: TreeNode | null, val: number): TreeNode => {
      if (!node) {
        return { value: val, id: val.toString() }
      }

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
    setInputValue("")
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
      if (val < node.value) {
        return search(node.left, val)
      } else {
        return search(node.right, val)
      }
    }

    // Reset previous search highlights
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
    const deleteNodeHelper = (node: TreeNode | null, val: number): TreeNode | null => {
      if (!node) return null

      if (val < node.value) {
        node.left = deleteNodeHelper(node.left, val)
      } else if (val > node.value) {
        node.right = deleteNodeHelper(node.right, val)
      } else {
        // Node to be deleted found
        if (!node.left) return node.right
        if (!node.right) return node.left

        // Node with two children
        const minRight = findMin(node.right)
        node.value = minRight.value
        node.id = minRight.id
        node.right = deleteNodeHelper(node.right, minRight.value)
      }

      return node
    }

    const findMin = (node: TreeNode): TreeNode => {
      while (node.left) {
        node = node.left
      }
      return node
    }

    const newRoot = deleteNodeHelper(root, value)
    setRoot(newRoot)
    calculateTreeMetrics(newRoot)
  }

  const performTraversal = (type: TraversalType): void => {
    if (!root) return

    const steps: TraversalStep[] = []
    const result: number[] = []
    const visited: string[] = []

    const inorderTraversal = (node: TreeNode | null, path: string[] = []): void => {
      if (!node) return

      const currentPath = [...path, node.id]

      if (node.left) {
        steps.push({
          node,
          description: `Visiting left subtree of ${node.value}`,
          visitedNodes: [...visited],
          currentPath,
        })
        inorderTraversal(node.left, currentPath)
      }

      visited.push(node.id)
      result.push(node.value)
      steps.push({
        node,
        description: `Processing node ${node.value}`,
        visitedNodes: [...visited],
        currentPath,
      })

      if (node.right) {
        steps.push({
          node,
          description: `Visiting right subtree of ${node.value}`,
          visitedNodes: [...visited],
          currentPath,
        })
        inorderTraversal(node.right, currentPath)
      }
    }

    const preorderTraversal = (node: TreeNode | null, path: string[] = []): void => {
      if (!node) return

      const currentPath = [...path, node.id]
      visited.push(node.id)
      result.push(node.value)
      steps.push({
        node,
        description: `Processing node ${node.value}`,
        visitedNodes: [...visited],
        currentPath,
      })

      if (node.left) {
        steps.push({
          node,
          description: `Visiting left subtree of ${node.value}`,
          visitedNodes: [...visited],
          currentPath,
        })
        preorderTraversal(node.left, currentPath)
      }

      if (node.right) {
        steps.push({
          node,
          description: `Visiting right subtree of ${node.value}`,
          visitedNodes: [...visited],
          currentPath,
        })
        preorderTraversal(node.right, currentPath)
      }
    }

    const postorderTraversal = (node: TreeNode | null, path: string[] = []): void => {
      if (!node) return

      const currentPath = [...path, node.id]

      if (node.left) {
        steps.push({
          node,
          description: `Visiting left subtree of ${node.value}`,
          visitedNodes: [...visited],
          currentPath,
        })
        postorderTraversal(node.left, currentPath)
      }

      if (node.right) {
        steps.push({
          node,
          description: `Visiting right subtree of ${node.value}`,
          visitedNodes: [...visited],
          currentPath,
        })
        postorderTraversal(node.right, currentPath)
      }

      visited.push(node.id)
      result.push(node.value)
      steps.push({
        node,
        description: `Processing node ${node.value}`,
        visitedNodes: [...visited],
        currentPath,
      })
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
  }

  const calculateNodePositions = useCallback((node: TreeNode | null, x = 400, y = 50, level = 0): TreeNode | null => {
    if (!node) return null

    const spacing = Math.max(200 / (level + 1), 50)

    const newNode = {
      ...node,
      x,
      y,
      left: node.left ? calculateNodePositions(node.left, x - spacing, y + 80, level + 1) : null,
      right: node.right ? calculateNodePositions(node.right, x + spacing, y + 80, level + 1) : null,
    }

    return newNode
  }, [])

  const renderTree = (node: TreeNode | null): JSX.Element | null => {
    if (!node) return null

    const currentStepData = traversalSteps[currentStep]
    const isCurrentNode = currentStepData?.node.id === node.id
    const isVisited = currentStepData?.visitedNodes.includes(node.id)

    return (
      <g key={node.id}>
        {/* Render connections to children */}
        {node.left && (
          <line x1={node.x} y1={node.y} x2={node.left.x} y2={node.left.y} stroke="#e5e7eb" strokeWidth="2" />
        )}
        {node.right && (
          <line x1={node.x} y1={node.y} x2={node.right.x} y2={node.right.y} stroke="#e5e7eb" strokeWidth="2" />
        )}

        {/* Render child nodes */}
        {renderTree(node.left)}
        {renderTree(node.right)}

        {/* Render current node */}
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
    }
  }

  const stepBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const play = () => {
    if (traversalSteps.length === 0) {
      performTraversal(traversalType)
    }
    setIsPlaying(true)
  }

  const pause = () => {
    setIsPlaying(false)
  }

  const reset = () => {
    resetNodeStates(root)
    setTraversalSteps([])
    setCurrentStep(0)
    setTraversalResult([])
    setIsPlaying(false)
    setRoot({ ...root })
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

  const positionedRoot = calculateNodePositions(root)

  return (
    <VisualizerLayout
      title="Tree & BST Visualizer"
      description="Learn binary trees, BST operations, and tree traversals"
      difficulty="Intermediate"
      isPlaying={isPlaying}
      onPlay={play}
      onPause={pause}
      onStepBack={stepBack}
      onStepForward={stepForward}
      onReset={reset}
      currentStep={currentStep}
      totalSteps={traversalSteps.length}
      complexity={{
        time: "O(log n) - O(n)",
        space: "O(h)",
      }}
      applications={applications}
    >
      <div className="w-full space-y-6">
        {/* Tree Visualization */}
        <div className="bg-muted/10 rounded-lg p-4 min-h-[400px] overflow-auto">
          <svg width="800" height="400" className="mx-auto">
            {positionedRoot && renderTree(positionedRoot)}
          </svg>
        </div>

        {/* Tree Operations */}
        <div className="grid md:grid-cols-3 gap-4">
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
                onKeyPress={(e) => e.key === "Enter" && insertNode(Number.parseInt(inputValue))}
              />
              <button
                onClick={() => insertNode(Number.parseInt(inputValue))}
                disabled={!inputValue}
                className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                Insert
              </button>
            </div>
          </Card>

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
                onKeyPress={(e) => e.key === "Enter" && searchNode(Number.parseInt(searchValue))}
              />
              <button
                onClick={() => searchNode(Number.parseInt(searchValue))}
                disabled={!searchValue}
                className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                Search
              </button>
            </div>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tree Traversal</CardTitle>
            </CardHeader>
            <div className="p-4 pt-0 space-y-3">
              <select
                value={traversalType}
                onChange={(e) => setTraversalType(e.target.value as TraversalType)}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="inorder">Inorder (L-Root-R)</option>
                <option value="preorder">Preorder (Root-L-R)</option>
                <option value="postorder">Postorder (L-R-Root)</option>
                <option value="levelorder">Level Order (BFS)</option>
              </select>
              <button
                onClick={() => performTraversal(traversalType)}
                className="w-full bg-purple-600 text-white py-2 rounded-md hover:bg-purple-700"
              >
                Start Traversal
              </button>
            </div>
          </Card>
        </div>

        {/* Tree Metrics */}
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

        {/* Current Step Info */}
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
}
