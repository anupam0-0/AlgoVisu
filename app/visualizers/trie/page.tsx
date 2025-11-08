"use client"

import { useState, useEffect } from "react"
import { VisualizerLayout } from "../../../components/visualizer-layout"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../components/ui/card"
import { Badge } from "../../../components/ui/badge"
import { Plus, X, Search, GitBranch } from "lucide-react"

// Trie Node (as per GeeksforGeeks implementation)
interface TrieNode {
  children: (TrieNode | null)[]
  isEndOfWord: boolean
  char: string // for visualization only
  id: string
}

type Operation = "insert" | "search"

interface Step {
  description: string
  trieSnapshot: TrieNode
  highlightedNodes: string[]
  pathNodes: string[]
  codeLine: number
}

const pseudocode = [
  "class TrieNode:",
  "  children = array of size 26 (initialized to null)",
  "  isEndOfWord = false",
  "",
  "function insert(root, key):",
  "  node = root",
  "  for each character c in key:",
  "    index = c - 'a'",
  "    if node.children[index] is null:",
  "      node.children[index] = new TrieNode()",
  "    node = node.children[index]",
  "  node.isEndOfWord = true",
  "",
  "function search(root, key):",
  "  node = root",
  "  for each character c in key:",
  "    index = c - 'a'",
  "    if node.children[index] is null:",
  "      return false",
  "    node = node.children[index]",
  "  return node.isEndOfWord",
]

const ALPHABET_SIZE = 26

// Create new trie node
const createNode = (char: string = "", id: string): TrieNode => ({
  children: new Array(ALPHABET_SIZE).fill(null),
  isEndOfWord: false,
  char,
  id,
})

export default function TrieVisualizer() {
  const [root, setRoot] = useState<TrieNode>(createNode("", "root"))
  const [word, setWord] = useState("")
  const [operation, setOperation] = useState<Operation>("insert")
  const [steps, setSteps] = useState<Step[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [currentCodeLine, setCurrentCodeLine] = useState<number>(-1)

  const applications = [
    {
      title: "Autocomplete Systems",
      description: "Tries enable fast prefix-based suggestions in search bars and IDEs",
      examples: ["Google Search", "VS Code IntelliSense", "Command-line completion"],
    },
    {
      title: "Spell Checkers",
      description: "Efficiently validate words and suggest corrections",
      examples: ["Microsoft Word", "Grammarly", "Mobile keyboards"],
    },
    {
      title: "IP Routing",
      description: "Longest prefix matching in networking uses binary tries",
      examples: ["Router forwarding tables", "CDNs", "Load balancers"],
    },
  ]

  // Reset trie
  const resetTrie = () => {
    setRoot(createNode("", "root"))
    setSteps([])
    setCurrentStep(0)
    setCurrentCodeLine(-1)
  }

  // Clone node recursively (for immutability)
  const cloneNode = (node: TrieNode): TrieNode => {
    const cloned: TrieNode = {
      ...node,
      children: [...node.children],
      id: node.id,
    }
    for (let i = 0; i < ALPHABET_SIZE; i++) {
      if (node.children[i]) {
        cloned.children[i] = cloneNode(node.children[i]!)
      }
    }
    return cloned
  }

  // Add step helper
  const addStep = (
    description: string,
    trie: TrieNode,
    highlighted: string[],
    path: string[],
    codeLine: number
  ) => {
    setSteps((prev) => [
      ...prev,
      {
        description,
        trieSnapshot: cloneNode(trie),
        highlightedNodes: [...highlighted],
        pathNodes: [...path],
        codeLine,
      },
    ])
  }

  // === INSERT OPERATION (GeeksforGeeks style) ===
  const handleInsert = () => {
    if (!word.trim()) return
    const cleanWord = word.toLowerCase()
    
    // Validate input (only a-z)
    if (!/^[a-z]+$/.test(cleanWord)) {
      alert("Only lowercase letters a-z are supported.")
      return
    }

    let current = cloneNode(root)
    const path: string[] = []
    const highlighted: string[] = []

    addStep(`Starting insertion of "${cleanWord}"`, current, [], [], 5)
    
    let node = current
    for (let i = 0; i < cleanWord.length; i++) {
      const char = cleanWord[i]
      const index = char.charCodeAt(0) - 'a'.charCodeAt(0)
      path.push(node.id)

      if (node.children[index] === null) {
        const newId = `${node.id}-${char}`
        node.children[index] = createNode(char, newId)
        addStep(
          `Created new node for '${char}' at index ${index}`,
          current,
          [newId],
          [...path],
          9
        )
      }

      node = node.children[index]!
      highlighted.push(node.id)
      addStep(
        `Moved to node '${char}'`,
        current,
        [node.id],
        [...path, node.id],
        11
      )
    }

    node.isEndOfWord = true
    addStep(
      `Marked end of word "${cleanWord}"`,
      current,
      [node.id],
      [...path, node.id],
      12
    )

    setRoot(current)
    setCurrentStep(0)
    setWord("")
  }

  // === SEARCH OPERATION (GeeksforGeeks style) ===
  const handleSearch = () => {
    if (!word.trim()) return
    const cleanWord = word.toLowerCase()
    
    // Validate input (only a-z)
    if (!/^[a-z]+$/.test(cleanWord)) {
      alert("Only lowercase letters a-z are supported.")
      return
    }

    let current = cloneNode(root)
    const path: string[] = []
    let node = current

    addStep(`Starting search for "${cleanWord}"`, current, [], [], 14)

    for (let i = 0; i < cleanWord.length; i++) {
      const char = cleanWord[i]
      const index = char.charCodeAt(0) - 'a'.charCodeAt(0)
      path.push(node.id)

      if (node.children[index] === null) {
        addStep(
          `Character '${char}' not found at index ${index}. Word "${cleanWord}" does not exist.`,
          current,
          [],
          [...path],
          18
        )
        setCurrentStep(0)
        setWord("")
        return
      }

      node = node.children[index]!
      addStep(
        `Found '${char}' at index ${index}`,
        current,
        [node.id],
        [...path, node.id],
        20
      )
    }

    if (node.isEndOfWord) {
      addStep(
        `Word "${cleanWord}" found! (isEndOfWord = true)`,
        current,
        [node.id],
        [...path, node.id],
        21
      )
    } else {
      addStep(
        `"${cleanWord}" exists as prefix but is not a complete word (isEndOfWord = false)`,
        current,
        [node.id],
        [...path, node.id],
        21
      )
    }

    setCurrentStep(0)
    setWord("")
  }

  // Navigation
  const stepForward = () => {
    if (currentStep < steps.length - 1) setCurrentStep(currentStep + 1)
  }
  const stepBack = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1)
  }
  const reset = () => {
    resetTrie()
  }

  useEffect(() => {
    if (steps[currentStep]) {
      setCurrentCodeLine(steps[currentStep].codeLine)
    }
  }, [currentStep, steps])

  const currentStepData = steps[currentStep] || {
    description: "Ready to perform an operation.",
    trieSnapshot: root,
    highlightedNodes: [],
    pathNodes: [],
    codeLine: -1,
  }

  // Recursive render function
  const renderNode = (node: TrieNode, depth = 0): JSX.Element => {
    const isHighlighted = currentStepData.highlightedNodes.includes(node.id)
    const isPath = currentStepData.pathNodes.includes(node.id)
    const isEnd = node.isEndOfWord

    return (
      <div className="ml-4" key={node.id}>
        <div
          className={`
            flex items-center gap-2 p-2 rounded border mb-1
            ${isPath ? "bg-primary/10 border-primary" : "bg-background border-muted"}
            ${isHighlighted ? "ring-2 ring-primary/50" : ""}
          `}
        >
          <span className="font-mono w-6 text-center">
            {node.char || "•"}
          </span>
          {isEnd && (
            <Badge variant="outline" className="text-xs border-green-500 text-green-700 bg-green-50">
              END
            </Badge>
          )}
        </div>
        <div className="flex flex-wrap gap-1">
          {node.children.map((child, idx) => {
            if (child !== null) {
              return renderNode(child, depth + 1)
            }
            return null
          })}
        </div>
      </div>
    )
  }

  return (
    <VisualizerLayout
      title="Trie Visualizer"
      description="Visualize standard trie implementation for insert and search operations (GeeksforGeeks style)"
      difficulty="Intermediate"
      isPlaying={false}
      onPlay={() => {}}
      onPause={() => {}}
      onStepBack={stepBack}
      onStepForward={stepForward}
      onReset={reset}
      currentStep={currentStep}
      totalSteps={steps.length}
      complexity={{
        time: "O(m) per operation (m = word length)",
        space: "O(ALPHABET_SIZE × N × m)",
      }}
      applications={applications}
    >
      <div className="w-full space-y-6">
        {/* Info Card */}
        <Card className="bg-orange-50 border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <GitBranch className="h-5 w-5" />
              What is a Trie?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="space-y-2 text-sm">
              <span className="block">
                A <strong>trie</strong> (prefix tree) is a tree-like data structure that stores strings by sharing common prefixes.
                Each node represents a single character, and paths from root to marked nodes spell complete words.
              </span>
            </CardDescription>
          </CardContent>
        </Card>

        {/* Controls */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Operation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant={operation === "insert" ? "default" : "outline"}
                size="sm"
                onClick={() => setOperation("insert")}
                className="w-full justify-start"
              >
                <Plus className="h-4 w-4 mr-2" /> Insert
              </Button>
              <Button
                variant={operation === "search" ? "default" : "outline"}
                size="sm"
                onClick={() => setOperation("search")}
                className="w-full justify-start"
              >
                <Search className="h-4 w-4 mr-2" /> Search
              </Button>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Word Input</CardTitle>
            </CardHeader>
            <CardContent className="flex gap-2">
              <Input
                placeholder="Enter a word (a-z only)"
                value={word}
                onChange={(e) => setWord(e.target.value.toLowerCase())}
                className="flex-1"
              />
              <Button
                onClick={operation === "insert" ? handleInsert : handleSearch}
                className="gap-1"
              >
                {operation === "insert" ? "Insert" : "Search"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Reset</CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={reset} className="w-full" variant="outline">
                Clear Trie
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Visualization */}
        <Card>
          <CardHeader>
            <CardTitle>Trie Structure</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted/20 p-4 rounded min-h-64">
              {root.children.every(child => child === null) ? (
                <div className="text-muted-foreground italic">Trie is empty</div>
              ) : (
                <div className="font-sans">
                  {renderNode(root)}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pseudocode */}
        <Card>
          <CardHeader>
            <CardTitle>Pseudocode (GeeksforGeeks)</CardTitle>
          </CardHeader>
          <div className="font-mono text-sm bg-muted p-4 rounded-md max-h-60 overflow-y-auto">
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

        {/* Current Step */}
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

        {/* Legend */}
        <Card>
          <CardHeader>
            <CardTitle>Legend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="font-mono">•</span>
                <span>Root (no character)</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs border-green-500 text-green-700 bg-green-50">
                  END
                </Badge>
                <span>Complete Word</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded border-2 border-primary bg-primary/10"></div>
                <span>Highlighted Node</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded border-l-2 border-muted pl-2"></div>
                <span>Path Traversal</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </VisualizerLayout>
  )
}