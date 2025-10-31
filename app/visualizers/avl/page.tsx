"use client"

import { useState, useEffect } from "react"
import { VisualizerLayout } from "../../../components/visualizer-layout"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../components/ui/card"
import { Badge } from "../../../components/ui/badge"
import { Plus, X, GitBranch } from "lucide-react"

interface AVLNode {
  value: number
  left: AVLNode | null
  right: AVLNode | null
  height: number
  id: string
  isHighlighted?: boolean
  rotationType?: "LL" | "RR" | "LR" | "RL"
}

type AVLStep = {
  description: string
  tree: AVLNode | null
  highlightedNodes: string[]
  codeLine: number
}

const pseudocode = [
  "function insert(root, value):",
  "  if root is null: return new Node(value)",
  "  if value < root.value:",
  "    root.left = insert(root.left, value)",
  "  else if value > root.value:",
  "    root.right = insert(root.right, value)",
  "  else: return root  // duplicate",
  "  root.height = 1 + max(height(root.left), height(root.right))",
  "  balance = getBalance(root)",
  "  // Left Left",
  "  if balance > 1 and value < root.left.value:",
  "    return rotateRight(root)",
  "  // Right Right",
  "  if balance < -1 and value > root.right.value:",
  "    return rotateLeft(root)",
  "  // Left Right",
  "  if balance > 1 and value > root.left.value:",
  "    root.left = rotateLeft(root.left)",
  "    return rotateRight(root)",
  "  // Right Left",
  "  if balance < -1 and value < root.right.value:",
  "    root.right = rotateRight(root.right)",
  "    return rotateLeft(root)",
  "  return root",
  "",
  "function delete(root, value):",
  "  if root is null: return root",
  "  if value < root.value:",
  "    root.left = delete(root.left, value)",
  "  else if value > root.value:",
  "    root.right = delete(root.right, value)",
  "  else:",
  "    if root.left is null or root.right is null:",
  "      temp = root.left ? root.left : root.right",
  "      if temp is null:",
  "        root = null",
  "      else:",
  "        root = temp",
  "    else:",
  "      temp = minValueNode(root.right)",
  "      root.value = temp.value",
  "      root.right = delete(root.right, temp.value)",
  "  if root is null: return root",
  "  root.height = 1 + max(height(root.left), height(root.right))",
  "  balance = getBalance(root)",
  "  // Left Left",
  "  if balance > 1 and getBalance(root.left) >= 0:",
  "    return rotateRight(root)",
  "  // Left Right",
  "  if balance > 1 and getBalance(root.left) < 0:",
  "    root.left = rotateLeft(root.left)",
  "    return rotateRight(root)",
  "  // Right Right",
  "  if balance < -1 and getBalance(root.right) <= 0:",
  "    return rotateLeft(root)",
  "  // Right Left",
  "  if balance < -1 and getBalance(root.right) > 0:",
  "    root.right = rotateRight(root.right)",
  "    return rotateLeft(root)",
  "  return root",
]

let nodeIdCounter = 0

const createNode = (value: number): AVLNode => ({
  value,
  left: null,
  right: null,
  height: 1,
  id: `node-${++nodeIdCounter}`,
  rotationType: undefined,
})

const getHeight = (node: AVLNode | null): number => node?.height || 0

const getBalance = (node: AVLNode | null): number => 
  node ? getHeight(node.left) - getHeight(node.right) : 0

const rotateRight = (y: AVLNode): AVLNode => {
  const x = y.left!
  const T2 = x.right
  x.right = y
  y.left = T2
  y.height = Math.max(getHeight(y.left), getHeight(y.right)) + 1
  x.height = Math.max(getHeight(x.left), getHeight(x.right)) + 1
  x.rotationType = "LL"
  return x
}

const rotateLeft = (x: AVLNode): AVLNode => {
  const y = x.right!
  const T2 = y.left
  y.left = x
  x.right = T2
  x.height = Math.max(getHeight(x.left), getHeight(x.right)) + 1
  y.height = Math.max(getHeight(y.left), getHeight(y.right)) + 1
  y.rotationType = "RR"
  return y
}

const minValueNode = (node: AVLNode): AVLNode => {
  let current = node
  while (current.left !== null) {
    current = current.left
  }
  return current
}

export default function AVLVisualizer() {
  const [root, setRoot] = useState<AVLNode | null>(null)
  const [inputValue, setInputValue] = useState("")
  const [steps, setSteps] = useState<AVLStep[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [currentCodeLine, setCurrentCodeLine] = useState<number>(-1)

  const applications = [
    {
      title: "Database Indexing",
      description: "AVL trees ensure O(log n) lookups for indexed columns",
      examples: ["MySQL indexes", "File systems", "Symbol tables"],
    },
    {
      title: "In-Memory Data Stores",
      description: "Balanced trees maintain performance under dynamic loads",
      examples: ["Caches", "Session stores", "Leaderboards"],
    },
    {
      title: "Compiler Design",
      description: "Efficient symbol table management during parsing",
      examples: ["Variable scoping", "Function lookup", "Optimization passes"],
    },
  ]

  const resetTree = () => {
    setRoot(null)
    setSteps([])
    setCurrentStep(0)
    setCurrentCodeLine(-1)
    nodeIdCounter = 0
  }

  const cloneNode = (node: AVLNode | null): AVLNode | null => {
    if (!node) return null
    return {
      ...node,
      left: cloneNode(node.left),
      right: cloneNode(node.right),
      id: node.id,
    }
  }

  const addStep = (description: string, tree: AVLNode | null, highlighted: string[], codeLine: number) => {
    setSteps(prev => [...prev, { description, tree: cloneNode(tree), highlightedNodes: [...highlighted], codeLine }])
  }

  const insertRecursive = (
    node: AVLNode | null,
    value: number,
    stepsSnapshot: AVLStep[],
    path: string[] = []
  ): AVLNode => {
    if (!node) {
      const newNode = createNode(value)
      stepsSnapshot.push({
        description: `Inserted ${value}.`,
        tree: cloneNode(newNode),
        highlightedNodes: [newNode.id],
        codeLine: 2,
      })
      return newNode
    }

    path.push(node.id)

    if (value < node.value) {
      stepsSnapshot.push({
        description: `Going left from ${node.value} to insert ${value}.`,
        tree: cloneNode(node),
        highlightedNodes: [node.id],
        codeLine: 3,
      })
      node.left = insertRecursive(node.left, value, stepsSnapshot, path)
    } else if (value > node.value) {
      stepsSnapshot.push({
        description: `Going right from ${node.value} to insert ${value}.`,
        tree: cloneNode(node),
        highlightedNodes: [node.id],
        codeLine: 5,
      })
      node.right = insertRecursive(node.right, value, stepsSnapshot, path)
    } else {
      return node // duplicate
    }

    node.height = 1 + Math.max(getHeight(node.left), getHeight(node.right))
    const balance = getBalance(node)

    if (balance > 1 && value < (node.left?.value || 0)) {
      stepsSnapshot.push({
        description: `LL imbalance at ${node.value}. Performing right rotation.`,
        tree: cloneNode(node),
        highlightedNodes: [node.id],
        codeLine: 11,
      })
      return rotateRight(node)
    }
    if (balance < -1 && value > (node.right?.value || 0)) {
      stepsSnapshot.push({
        description: `RR imbalance at ${node.value}. Performing left rotation.`,
        tree: cloneNode(node),
        highlightedNodes: [node.id],
        codeLine: 14,
      })
      return rotateLeft(node)
    }
    if (balance > 1 && value > (node.left?.value || 0)) {
      stepsSnapshot.push({
        description: `LR imbalance at ${node.value}. Left rotation on left child, then right rotation.`,
        tree: cloneNode(node),
        highlightedNodes: [node.id],
        codeLine: 17,
      })
      node.left = rotateLeft(node.left!)
      node.left.rotationType = "LR"
      return rotateRight(node)
    }
    if (balance < -1 && value < (node.right?.value || 0)) {
      stepsSnapshot.push({
        description: `RL imbalance at ${node.value}. Right rotation on right child, then left rotation.`,
        tree: cloneNode(node),
        highlightedNodes: [node.id],
        codeLine: 21,
      })
      node.right = rotateRight(node.right!)
      node.right.rotationType = "RL"
      return rotateLeft(node)
    }

    return node
  }

  const deleteRecursive = (
    node: AVLNode | null,
    value: number,
    stepsSnapshot: AVLStep[],
    path: string[] = []
  ): AVLNode | null => {
    if (!node) return null

    path.push(node.id)

    if (value < node.value) {
      stepsSnapshot.push({
        description: `Going left from ${node.value} to delete ${value}.`,
        tree: cloneNode(node),
        highlightedNodes: [node.id],
        codeLine: 28,
      })
      node.left = deleteRecursive(node.left, value, stepsSnapshot, path)
    } else if (value > node.value) {
      stepsSnapshot.push({
        description: `Going right from ${node.value} to delete ${value}.`,
        tree: cloneNode(node),
        highlightedNodes: [node.id],
        codeLine: 30,
      })
      node.right = deleteRecursive(node.right, value, stepsSnapshot, path)
    } else {
      if (!node.left || !node.right) {
        const temp = node.left || node.right
        if (!temp) {
          stepsSnapshot.push({
            description: `Deleting leaf node ${value}.`,
            tree: cloneNode(node),
            highlightedNodes: [node.id],
            codeLine: 34,
          })
          return null
        } else {
          stepsSnapshot.push({
            description: `Deleting node ${value} with one child.`,
            tree: cloneNode(node),
            highlightedNodes: [node.id],
            codeLine: 36,
          })
          return temp
        }
      } else {
        const temp = minValueNode(node.right)
        node.value = temp.value
        stepsSnapshot.push({
          description: `Replacing ${value} with inorder successor ${temp.value}.`,
          tree: cloneNode(node),
          highlightedNodes: [node.id, temp.id],
          codeLine: 40,
        })
        node.right = deleteRecursive(node.right, temp.value, stepsSnapshot, [...path])
      }
    }

    if (!node) return null

    node.height = 1 + Math.max(getHeight(node.left), getHeight(node.right))
    const balance = getBalance(node)

    if (balance > 1 && getBalance(node.left) >= 0) {
      stepsSnapshot.push({
        description: `LL imbalance at ${node.value}. Right rotation.`,
        tree: cloneNode(node),
        highlightedNodes: [node.id],
        codeLine: 44,
      })
      return rotateRight(node)
    }
    if (balance > 1 && getBalance(node.left) < 0) {
      stepsSnapshot.push({
        description: `LR imbalance at ${node.value}. Left rotation on left child, then right rotation.`,
        tree: cloneNode(node),
        highlightedNodes: [node.id],
        codeLine: 47,
      })
      node.left = rotateLeft(node.left!)
      node.left.rotationType = "LR"
      return rotateRight(node)
    }
    if (balance < -1 && getBalance(node.right) <= 0) {
      stepsSnapshot.push({
        description: `RR imbalance at ${node.value}. Left rotation.`,
        tree: cloneNode(node),
        highlightedNodes: [node.id],
        codeLine: 51,
      })
      return rotateLeft(node)
    }
    if (balance < -1 && getBalance(node.right) > 0) {
      stepsSnapshot.push({
        description: `RL imbalance at ${node.value}. Right rotation on right child, then left rotation.`,
        tree: cloneNode(node),
        highlightedNodes: [node.id],
        codeLine: 54,
      })
      node.right = rotateRight(node.right!)
      node.right.rotationType = "RL"
      return rotateLeft(node)
    }

    return node
  }

  const handleInsert = () => {
    const val = Number(inputValue)
    if (isNaN(val)) return
    const stepsSnapshot: AVLStep[] = []
    const newRoot = insertRecursive(root, val, stepsSnapshot)
    setRoot(newRoot)
    setSteps(stepsSnapshot)
    setCurrentStep(0)
    setInputValue("")
  }

  const handleDelete = () => {
    const val = Number(inputValue)
    if (isNaN(val)) return
    const stepsSnapshot: AVLStep[] = []
    const newRoot = deleteRecursive(root, val, stepsSnapshot)
    setRoot(newRoot)
    setSteps(stepsSnapshot)
    setCurrentStep(0)
    setInputValue("")
  }

  const stepForward = () => setCurrentStep(prev => Math.min(prev + 1, steps.length - 1))
  const stepBack = () => setCurrentStep(prev => Math.max(prev - 1, 0))
  const reset = () => resetTree()

  useEffect(() => {
    if (steps[currentStep]) {
      setCurrentCodeLine(steps[currentStep].codeLine)
    }
  }, [currentStep, steps])

  const currentStepData = steps[currentStep] || {
    description: "Ready to perform an operation.",
    tree: root,
    highlightedNodes: [],
    codeLine: -1,
  }

  const renderNode = (node: AVLNode | null, depth = 0): JSX.Element | null => {
    if (!node) return null

    const isHighlighted = currentStepData.highlightedNodes.includes(node.id)

    return (
      <div className="flex flex-col items-center" key={node.id}>
        <div
          className={`
            w-16 h-16 rounded-full flex items-center justify-center border-2 font-bold relative
            ${isHighlighted ? "border-primary bg-primary/10 ring-2 ring-primary/30" : "border-muted bg-background"}
          `}
        >
          {node.value}
          {node.rotationType && (
            <Badge variant="outline" className="absolute -top-2 -right-2 text-xs bg-yellow-100 text-yellow-800 border-yellow-500">
              {node.rotationType}
            </Badge>
          )}
        </div>
        <div className="text-xs text-muted-foreground mt-1">h:{node.height}</div>
        <div className="flex space-x-6 mt-2">
          {renderNode(node.left, depth + 1)}
          {renderNode(node.right, depth + 1)}
        </div>
      </div>
    )
  }

  return (
    <VisualizerLayout
      title="AVL Tree Visualizer"
      description="Self-balancing binary search trees with automatic rotations to maintain O(log n) height"
      difficulty="Advanced"
      isPlaying={false}
      onPlay={() => {}}
      onPause={() => {}}
      onStepBack={stepBack}
      onStepForward={stepForward}
      onReset={reset}
      currentStep={currentStep}
      totalSteps={steps.length}
      complexity={{
        time: "Insert/Delete/Search: O(log n)",
        space: "O(n)",
      }}
      applications={applications}
    >
      <div className="w-full space-y-6">
        <Card className="bg-orange-50 border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <GitBranch className="h-5 w-5" />
              What is an AVL Tree?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="space-y-2 text-sm">
              <div>
                An <strong>AVL tree</strong> is a self-balancing binary search tree where the height difference (balance factor)
                between left and right subtrees of any node is at most 1.
              </div>
              <div>
                After insertions or deletions, <strong>rotations</strong> (LL, RR, LR, RL) restore balance, guaranteeing O(log n) operations.
                Rotations are visually indicated during steps.
              </div>
            </CardDescription>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
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
              <Button variant="destructive" onClick={handleDelete} className="gap-1">
                <X className="h-4 w-4" /> Delete
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Reset</CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={reset} className="w-full" variant="outline">
                Clear Tree
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>AVL Tree</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="min-h-64 p-4 bg-muted/10 rounded flex justify-center items-start">
              {currentStepData.tree ? renderNode(currentStepData.tree) : (
                <div className="text-muted-foreground italic">Tree is empty</div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pseudocode (Insert & Delete)</CardTitle>
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
                <div className="w-6 h-6 rounded-full border-2 border-primary bg-primary/10"></div>
                <span>Highlighted Node</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs bg-yellow-100 text-yellow-800 border-yellow-500">LL</Badge>
                <span>Rotation Type</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs">h:3</span>
                <span>Height</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </VisualizerLayout>
  )
}