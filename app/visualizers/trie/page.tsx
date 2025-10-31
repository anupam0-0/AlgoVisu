"use client"

import { useState, useEffect, useMemo } from "react"
import { VisualizerLayout } from "../../../components/visualizer-layout"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../components/ui/card"
import { Badge } from "../../../components/ui/badge"
import { Plus, X, Search, GitBranch, Hash, List, Zap } from "lucide-react"

// Trie Node
interface TrieNode {
  char: string
  isEnd: boolean
  children: { [key: string]: TrieNode }
  id: string
  isHighlighted?: boolean
  isPath?: boolean
}

type Operation = "insert" | "search" | "delete" | "findPrefix"

interface Step {
  description: string
  trieSnapshot: TrieNode
  highlightedNodes: string[]
  pathNodes: string[]
  codeLine: number
}

const pseudocode = [
  "class TrieNode:",
  "  char = ''",
  "  isEnd = false",
  "  children = {}",
  "",
  "// Insert",
  "function insert(word):",
  "  node = root",
  "  for char in word:",
  "    if char not in node.children:",
  "      node.children[char] = new TrieNode(char)",
  "    node = node.children[char]",
  "  node.isEnd = true",
  "",
  "// Search",
  "function search(word):",
  "  node = root",
  "  for char in word:",
  "    if char not in node.children: return false",
  "    node = node.children[char]",
  "  return node.isEnd",
  "",
  "// Delete",
  "function delete(word):",
  "  helper(root, word, 0)",
  "",
  "// Find Words with Prefix",
  "function findWordsWithPrefix(prefix):",
  "  node = traverseToPrefix(prefix)",
  "  if not node: return []",
  "  return dfsCollectWords(node, prefix)",
  "",
  "// DFS Helper",
  "function dfsCollectWords(node, current):",
  "  results = []",
  "  if node.isEnd: results.append(current)",
  "  for char, child in node.children.items():",
  "    results += dfsCollectWords(child, current + char)",
  "  return results",
]

export default function TrieVisualizer() {
  const [root, setRoot] = useState<TrieNode>({
    char: "",
    isEnd: false,
    children: {},
    id: "root",
  })
  const [word, setWord] = useState("")
  const [operation, setOperation] = useState<Operation>("insert")
  const [steps, setSteps] = useState<Step[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [currentCodeLine, setCurrentCodeLine] = useState<number>(-1)
  const [radixMode, setRadixMode] = useState(false) // Compressed trie toggle

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
    {
      title: "Unicode Text Processing",
      description: "Support for international characters and custom alphabets",
      examples: ["Multilingual search", "Emoji dictionaries", "Specialized symbol sets"],
    },
  ]

  // Reset trie
  const resetTrie = () => {
    setRoot({
      char: "",
      isEnd: false,
      children: {},
      id: "root",
    })
    setSteps([])
    setCurrentStep(0)
    setCurrentCodeLine(-1)
  }

  // Clone node recursively (for immutability)
  const cloneNode = (node: TrieNode): TrieNode => {
    const cloned: TrieNode = {
      ...node,
      children: {},
      id: node.id,
    }
    for (const key in node.children) {
      cloned.children[key] = cloneNode(node.children[key])
    }
    return cloned
  }

  // Compress trie into radix tree (single-child chains merged)
  const compressToRadix = (node: TrieNode): TrieNode => {
    const compressed: TrieNode = { ...node, children: {} }
    for (const char in node.children) {
      let child = node.children[char]
      let mergedChars = char

      // Traverse single-child chains
      while (Object.keys(child.children).length === 1 && !child.isEnd) {
        const nextChar = Object.keys(child.children)[0]
        mergedChars += nextChar
        child = child.children[nextChar]
      }

      // Recursively compress the end of chain
      const finalChild = compressToRadix(child)
      compressed.children[mergedChars] = {
        ...finalChild,
        char: mergedChars,
        id: `${node.id}-${mergedChars}`,
      }
    }
    return compressed
  }

  // Add step helper
  const addStep = (
    description: string,
    trie: TrieNode,
    highlighted: string[],
    path: string[],
    codeLine: number
  ) => {
    const snapshot = radixMode ? compressToRadix(trie) : trie
    setSteps((prev) => [
      ...prev,
      {
        description,
        trieSnapshot: cloneNode(snapshot),
        highlightedNodes: [...highlighted],
        pathNodes: [...path],
        codeLine,
      },
    ])
  }

  // === INSERT ===
  const handleInsert = () => {
    if (!word.trim()) return
    const cleanWord = word // Now supports Unicode!

    let current = cloneNode(root)
    const path: string[] = []
    const highlighted: string[] = []

    addStep(`Starting insertion of "${cleanWord}"`, current, [], [], 7)

    let node = current
    for (let i = 0; i < cleanWord.length; i++) {
      const char = cleanWord[i]
      path.push(node.id)

      if (!node.children[char]) {
        const newId = `${node.id}-${char}`
        node.children[char] = {
          char,
          isEnd: false,
          children: {},
          id: newId,
        }
        addStep(`Created new node for '${char}'`, current, [newId], [...path], 10)
      }

      node = node.children[char]
      highlighted.push(node.id)
      addStep(`Moved to node '${char}'`, current, [node.id], [...path, node.id], 12)
    }

    node.isEnd = true
    addStep(`Marked end of word "${cleanWord}"`, current, [node.id], [...path, node.id], 13)
    setRoot(current)
    setCurrentStep(0)
    setWord("")
  }

  // === SEARCH ===
  const handleSearch = () => {
    if (!word.trim()) return
    const cleanWord = word

    let current = cloneNode(root)
    const path: string[] = []
    let node = current

    addStep(`Starting search for "${cleanWord}"`, current, [], [], 16)

    for (let i = 0; i < cleanWord.length; i++) {
      const char = cleanWord[i]
      path.push(node.id)

      if (!node.children[char]) {
        addStep(
          `Character '${char}' not found. Word "${cleanWord}" does not exist.`,
          current,
          [],
          [...path],
          19
        )
        setCurrentStep(0)
        setWord("")
        return
      }

      node = node.children[char]
      addStep(`Found '${char}'`, current, [node.id], [...path, node.id], 20)
    }

    if (node.isEnd) {
      addStep(`Word "${cleanWord}" found!`, current, [node.id], [...path, node.id], 21)
    } else {
      addStep(
        `"${cleanWord}" is a prefix but not a complete word.`,
        current,
        [node.id],
        [...path, node.id],
        21
      )
    }

    setCurrentStep(0)
    setWord("")
  }

  // === DELETE ===
  const handleDelete = () => {
    if (!word.trim()) return
    const cleanWord = word

    let current = cloneNode(root)
    const path: TrieNode[] = [current]
    let node = current

    addStep(`Starting deletion of "${cleanWord}"`, current, [], [], 24)

    for (let i = 0; i < cleanWord.length; i++) {
      const char = cleanWord[i]
      if (!node.children[char]) {
        addStep(
          `Word "${cleanWord}" not found. Nothing to delete.`,
          current,
          [],
          path.map(n => n.id),
          30
        )
        setCurrentStep(0)
        setWord("")
        return
      }
      node = node.children[char]
      path.push(node)
      addStep(`Traversing to '${char}'`, current, [node.id], path.map(n => n.id), 31)
    }

    if (!node.isEnd) {
      addStep(
        `"${cleanWord}" is not a complete word. Cannot delete.`,
        current,
        [node.id],
        path.map(n => n.id),
        27
      )
    } else {
      node.isEnd = false
      addStep(
        `Deleted word "${cleanWord}" (marked as non-end).`,
        current,
        [node.id],
        path.map(n => n.id),
        28
      )
    }

    setRoot(current)
    setCurrentStep(0)
    setWord("")
  }

  // === FIND WORDS WITH PREFIX ===
  const handleFindPrefix = () => {
    if (!word.trim()) return
    const prefix = word

    let current = cloneNode(root)
    const path: string[] = []
    let node = current

    addStep(`Finding all words with prefix "${prefix}"`, current, [], [], 28)

    // Traverse to prefix
    for (let i = 0; i < prefix.length; i++) {
      const char = prefix[i]
      path.push(node.id)

      if (!node.children[char]) {
        addStep(
          `Prefix "${prefix}" not found in trie.`,
          current,
          [],
          [...path],
          29
        )
        setCurrentStep(0)
        setWord("")
        return
      }
      node = node.children[char]
      addStep(`Reached prefix node '${char}'`, current, [node.id], [...path, node.id], 29)
    }

    // DFS to collect all words
    const results: string[] = []
    const dfsStack: { node: TrieNode; current: string; path: string[] }[] = [
      { node, current: prefix, path: [...path, node.id] },
    ]
    const highlightedNodes: string[] = []

    while (dfsStack.length > 0) {
      const { node: currNode, current: currStr, path: currPath } = dfsStack.pop()!
      if (currNode.isEnd) {
        results.push(currStr)
        highlightedNodes.push(currNode.id)
      }
      for (const char of Object.keys(currNode.children).sort().reverse()) {
        const child = currNode.children[char]
        dfsStack.push({
          node: child,
          current: currStr + char,
          path: [...currPath, child.id],
        })
      }
    }

    addStep(
      results.length > 0
        ? `Found ${results.length} word(s): ${results.join(", ")}`
        : `No complete words found under prefix "${prefix}"`,
      current,
      highlightedNodes,
      [...path, node.id],
      35
    )

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
    trieSnapshot: radixMode ? compressToRadix(root) : root,
    highlightedNodes: [],
    pathNodes: [],
    codeLine: -1,
  }

  // Recursive render function with animation support
  const renderNode = (node: TrieNode, depth = 0): JSX.Element => {
    const isHighlighted = currentStepData.highlightedNodes.includes(node.id)
    const isPath = currentStepData.pathNodes.includes(node.id)
    const isEnd = node.isEnd

    return (
      <div
        className="ml-4 animate-fadeInUp"
        key={node.id}
        style={{ animationDelay: `${depth * 50}ms` }}
      >
        <div
          className={`
            flex items-center gap-2 p-2 rounded border mb-1 transition-all duration-300
            ${isPath ? "bg-primary/10 border-primary" : "bg-background border-muted"}
            ${isHighlighted ? "ring-2 ring-primary/50 scale-105" : ""}
          `}
        >
          <span className="font-mono w-8 text-center truncate">
            {node.char || "•"}
          </span>
          {isEnd && (
            <Badge variant="outline" className="text-xs border-green-500 text-green-700 bg-green-50">
              END
            </Badge>
          )}
        </div>
        {Object.keys(node.children).length > 0 && (
          <div className="border-l-2 border-dashed border-muted pl-2">
            {Object.keys(node.children)
              .sort()
              .map((char) => renderNode(node.children[char], depth + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <VisualizerLayout
      title="Trie Visualizer"
      description="Visualize prefix trees with Unicode support, prefix search, and radix compression"
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
      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.4s ease-out forwards;
          opacity: 0;
        }
      `}</style>

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
            <div className="space-y-2 text-sm">
              <div>
                A <strong>trie</strong> (prefix tree) stores strings by sharing common prefixes.
                Each node represents a character (or string segment in radix mode), and paths from root to marked nodes spell complete words.
              </div>
              <div>
                <strong>Now supports:</strong> Unicode characters, custom alphabets, prefix-based word search, and compressed (radix) representation.
              </div>
              <div>
                <strong>Radix Mode:</strong> Merges single-child chains to reduce memory and improve readability.
              </div>
            </div>
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
              <Button
                variant={operation === "delete" ? "default" : "outline"}
                size="sm"
                onClick={() => setOperation("delete")}
                className="w-full justify-start"
              >
                <X className="h-4 w-4 mr-2" /> Delete
              </Button>
              <Button
                variant={operation === "findPrefix" ? "default" : "outline"}
                size="sm"
                onClick={() => setOperation("findPrefix")}
                className="w-full justify-start"
              >
                <List className="h-4 w-4 mr-2" /> Find Prefix
              </Button>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Word / Prefix Input</CardTitle>
            </CardHeader>
            <CardContent className="flex gap-2">
              <Input
                placeholder="Enter word or prefix (supports Unicode!)"
                value={word}
                onChange={(e) => setWord(e.target.value)}
                className="flex-1"
              />
              <Button
                onClick={
                  operation === "insert"
                    ? handleInsert
                    : operation === "search"
                    ? handleSearch
                    : operation === "delete"
                    ? handleDelete
                    : handleFindPrefix
                }
                className="gap-1"
              >
                {operation === "insert"
                  ? "Insert"
                  : operation === "search"
                  ? "Search"
                  : operation === "delete"
                  ? "Delete"
                  : "Find Words"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Radix Mode</span>
                <Button
                  variant={radixMode ? "default" : "outline"}
                  size="sm"
                  onClick={() => setRadixMode(!radixMode)}
                  className="gap-1"
                >
                  <Zap className="h-3 w-3" />
                  {radixMode ? "ON" : "OFF"}
                </Button>
              </div>
              <Button onClick={reset} className="w-full" variant="outline">
                Clear Trie
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Visualization */}
        <Card>
          <CardHeader>
            <CardTitle>Trie Structure {radixMode && "(Radix Mode)"}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted/20 p-4 rounded min-h-64">
              {Object.keys(currentStepData.trieSnapshot.children).length === 0 ? (
                <div className="text-muted-foreground italic">Trie is empty</div>
              ) : (
                <div className="font-sans">
                  {renderNode(currentStepData.trieSnapshot)}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pseudocode */}
        <Card>
          <CardHeader>
            <CardTitle>Pseudocode</CardTitle>
          </CardHeader>
          <div className="font-mono text-sm bg-muted p-4 rounded-md max-h-60 overflow-y-auto">
            {pseudocode.map((line, index) => (
              <div
                key={index}
                className={`
                  py-1 px-2 rounded transition-all duration-200
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
                <span>Root</span>
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
                <div className="w-4 h-4 rounded border-l-2 border-dashed border-muted pl-2"></div>
                <span>Path Traversal</span>
              </div>
              {radixMode && (
                <div className="flex items-center gap-2">
                  <span className="font-mono">"abc"</span>
                  <span>Compressed Segment</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </VisualizerLayout>
  )
}