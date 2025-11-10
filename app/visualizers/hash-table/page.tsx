"use client"

import { useState, useEffect } from "react"
import { VisualizerLayout } from "../../../components/visualizer-layout"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../components/ui/card"
import { Badge } from "../../../components/ui/badge"
import { Plus, X, Search, Hash } from "lucide-react"

type HashBucket = string[]
type HashTable = HashBucket[]

interface Step {
  description: string
  tableState: HashTable
  highlightedIndex: number | null
  codeLine: number
}

const pseudocode = [
  "// Hash Function",
  "function hash(key):",
  "  sum = 0",
  "  for each char in key:",
  "    sum += Unicode(char)",
  "  return sum % tableSize",
  "",
  "// Insert",
  "function insert(key):",
  "  index = hash(key)",
  "  if key not in table[index]:",
  "    table[index].push(key)",
  "",
  "// Search",
  "function search(key):",
  "  index = hash(key)",
  "  return key in table[index]",
  "",
  "// Delete",
  "function delete(key):",
  "  index = hash(key)",
  "  remove key from table[index]",
]

const hashFunction = (key: string, tableSize: number): number => {
  let sum = 0
  for (let i = 0; i < key.length; i++) {
    sum += key.charCodeAt(i)
  }
  return sum % tableSize
}

const getCharSum = (key: string): number => {
  return key.split('').reduce((sum, c) => sum + c.charCodeAt(0), 0)
}

// Deep clone helper
const cloneTable = (table: HashTable): HashTable => {
  return table.map(bucket => [...bucket])
}

export default function HashTableVisualizer() {
  const [tableSize, setTableSize] = useState<number>(10)
  const [key, setKey] = useState("")
  const [steps, setSteps] = useState<Step[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [currentCodeLine, setCurrentCodeLine] = useState<number>(-1)

  const initTable = (size: number): HashTable => {
    return Array.from({ length: size }, () => [])
  }

  const [table, setTable] = useState<HashTable>(initTable(10))

  const resetTable = () => {
    const newTable = initTable(tableSize)
    setTable(newTable)
    setSteps([])
    setCurrentStep(0)
    setCurrentCodeLine(-1)
  }

  useEffect(() => {
    resetTable()
  }, [tableSize])

  // ---------------------------
  // INSERT OPERATION
  // ---------------------------
  const handleInsert = () => {
    if (!key.trim()) return
    const cleanKey = key.trim()
    const index = hashFunction(cleanKey, tableSize)
    const charSum = getCharSum(cleanKey)

    const newTable = cloneTable(table)
    const stepsSnapshot: Step[] = []

    stepsSnapshot.push({
      description: `Hash("${cleanKey}") = ${index} (sum: ${charSum} % ${tableSize})`,
      tableState: cloneTable(newTable),
      highlightedIndex: index,
      codeLine: 2,
    })

    if (newTable[index].includes(cleanKey)) {
      stepsSnapshot.push({
        description: `Key "${cleanKey}" already exists in bucket ${index}.`,
        tableState: cloneTable(newTable),
        highlightedIndex: index,
        codeLine: 11,
      })
    } else {
      newTable[index].push(cleanKey)
      const updatedTable = cloneTable(newTable)

      stepsSnapshot.push({
        description: `Inserted "${cleanKey}" into bucket ${index}.`,
        tableState: updatedTable,
        highlightedIndex: index,
        codeLine: 12,
      })

      setTable(updatedTable)
    }

    setSteps(stepsSnapshot)
    setCurrentStep(stepsSnapshot.length - 1)
    setKey("")
  }

  // ---------------------------
  // SEARCH OPERATION
  // ---------------------------
  const handleSearch = () => {
    if (!key.trim()) return
    const cleanKey = key.trim()
    const index = hashFunction(cleanKey, tableSize)
    const charSum = getCharSum(cleanKey)

    const stepsSnapshot: Step[] = []
    stepsSnapshot.push({
      description: `Hash("${cleanKey}") = ${index} (sum: ${charSum} % ${tableSize})`,
      tableState: cloneTable(table),
      highlightedIndex: index,
      codeLine: 15,
    })

    const found = table[index].includes(cleanKey)
    stepsSnapshot.push({
      description: found
        ? `Found "${cleanKey}" in bucket ${index}.`
        : `"${cleanKey}" not found in bucket ${index}.`,
      tableState: cloneTable(table),
      highlightedIndex: index,
      codeLine: 16,
    })

    setSteps(stepsSnapshot)
    setCurrentStep(stepsSnapshot.length - 1)
    setKey("")
  }

  // ---------------------------
  // DELETE OPERATION
  // ---------------------------
  const handleDelete = () => {
    if (!key.trim()) return
    const cleanKey = key.trim()
    const index = hashFunction(cleanKey, tableSize)
    const charSum = getCharSum(cleanKey)

    const newTable = cloneTable(table)
    const stepsSnapshot: Step[] = []

    stepsSnapshot.push({
      description: `Hash("${cleanKey}") = ${index} (sum: ${charSum} % ${tableSize})`,
      tableState: cloneTable(newTable),
      highlightedIndex: index,
      codeLine: 19,
    })

    const bucket = newTable[index]
    const itemIndex = bucket.indexOf(cleanKey)
    if (itemIndex !== -1) {
      bucket.splice(itemIndex, 1)
      const updatedTable = cloneTable(newTable)
      stepsSnapshot.push({
        description: `Deleted "${cleanKey}" from bucket ${index}.`,
        tableState: updatedTable,
        highlightedIndex: index,
        codeLine: 21,
      })
      setTable(updatedTable)
    } else {
      stepsSnapshot.push({
        description: `"${cleanKey}" not found in bucket ${index}.`,
        tableState: cloneTable(newTable),
        highlightedIndex: index,
        codeLine: 21,
      })
    }

    setSteps(stepsSnapshot)
    setCurrentStep(stepsSnapshot.length - 1)
    setKey("")
  }

  const stepForward = () => {
    if (currentStep < steps.length - 1) setCurrentStep(currentStep + 1)
  }
  const stepBack = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1)
  }
  const reset = () => {
    resetTable()
  }

  useEffect(() => {
    if (steps[currentStep]) {
      setCurrentCodeLine(steps[currentStep].codeLine)
    }
  }, [currentStep, steps])

  const currentStepData = steps.length > 0
    ? steps[currentStep]
    : {
      description: "Ready to perform an operation.",
      tableState: table,
      highlightedIndex: null,
      codeLine: -1,
    }

  const loadFactor = table.reduce((sum, bucket) => sum + bucket.length, 0) / tableSize

  const applications = [
    {
      title: "Membership Testing",
      description: "Check if an item exists (e.g., username in a system)",
      examples: ["Login validation", "Spam filter", "Unique visitor tracking"],
    },
    {
      title: "Deduplication",
      description: "Store only unique items efficiently",
      examples: ["Email lists", "Tag systems", "Vocabulary sets"],
    },
    {
      title: "Fast Lookups",
      description: "O(1) average time for search, insert, delete",
      examples: ["Caching", "Compiler symbol tables", "Database indexing"],
    },
  ]

  const liveHashCode = key ? hashFunction(key, tableSize) : null
  const liveCharSum = key ? getCharSum(key) : null

  return (
    <VisualizerLayout
      title="Hash Table Visualizer (Hash Set)"
      description="Visualize hash tables using chaining with Unicode-based hashing (w3schools style)"
      difficulty="Beginner"
      isPlaying={false}
      
      complexity={{
        time: "O(1) average, O(n) worst-case",
        space: "O(n + tableSize)",
      }}
      applications={applications}
    >
      <div className="w-full space-y-6">
        {/* Info Card */}
        <Card className="bg-orange-50 border-primary">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-800 tracking-wide">
              Hash Table Visualizer
            </CardTitle>

            <CardDescription className="text-sm text-black space-y-2">
              <div>
                A <strong>hash table</strong> (also called a <em>hash map</em>) is a powerful data structure
                that stores data in <strong>key–value pairs</strong> for extremely fast access and updates.
                Instead of searching through a list, a <strong>hash function</strong> converts each key into
                an index, called a <strong>bucket</strong>, where that key is stored.
              </div>

              <div className="p-3 bg-muted/40 rounded-lg border border-border">
                <p className="font-medium text-foreground mb-2">💡 Example:</p>
                <p>
                  Suppose we have 5 buckets (<code>0</code> to <code>4</code>) and we insert the keys
                  <code> "Alice" </code> and <code> "Bob" </code>.
                </p>
                <ul className="list-disc list-inside text-sm mt-2 space-y-1">
                  <li>
                    Hash(<code>"Alice"</code>) → <code>sum("Alice") % 5 = 2</code> → goes into <strong>bucket 2</strong>.
                  </li>
                  <li>
                    Hash(<code>"Bob"</code>) → <code>sum("Bob") % 5 = 0</code> → goes into <strong>bucket 0</strong>.
                  </li>
                </ul>
                <p className="mt-2">
                  If another key also maps to the same bucket, we handle that using <strong>chaining</strong> —
                  storing multiple keys in a small list inside that bucket.
                </p>
              </div>

              <div>
                Hash tables are widely used in programming — for example, in
                <strong> dictionaries (Python) </strong>, <strong>objects (JavaScript)</strong>, and
                <strong> maps (Java, C++)</strong>. Their average time complexity is
                <strong> O(1)</strong> for insertion, lookup, and deletion.
              </div>
            </CardDescription>
          </CardHeader>

          <CardContent>
            <CardDescription className="text-sm text-black space-y-2">
              <div>
                Use the controls below to <strong>insert</strong> or <strong>delete</strong> keys and watch how
                the hash table updates dynamically. Each operation is visualized step-by-step, so you can
                clearly see how hashing, collisions, and chaining work behind the scenes.
              </div>
            </CardDescription>
          </CardContent>

        </Card>

        {/* Controls */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Table Size</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                type="number"
                min="5"
                max="20"
                value={tableSize}
                onChange={(e) => setTableSize(Math.max(5, Math.min(20, Number(e.target.value))))}
                className="w-full"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Load Factor</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">{loadFactor.toFixed(2)}</div>
              <div className="text-sm text-muted-foreground">Total keys / tableSize</div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Key Input</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                placeholder="Enter a key (e.g., Bob, Lisa)"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                className="font-mono"
              />

              {key && (
                <div className="text-sm p-2 bg-muted/30 rounded flex flex-wrap items-center gap-2">
                  <span>Hash Code:</span>
                  <code className="bg-background px-2 py-1 rounded font-mono flex-1">
                    hash("{key}") = {liveHashCode} (sum: {liveCharSum})
                  </code>
                </div>
              )}

              <div className="flex gap-2 flex-wrap">
                <Button onClick={handleInsert} className="gap-1" disabled={!key.trim()}>
                  <Plus className="h-4 w-4" /> Insert
                </Button>
                <Button variant="outline" onClick={handleSearch} className="gap-1" disabled={!key.trim()}>
                  <Search className="h-4 w-4" /> Search
                </Button>
                <Button variant="destructive" onClick={handleDelete} className="gap-1" disabled={!key.trim()}>
                  <X className="h-4 w-4" /> Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Visualization */}
        <Card>
          <CardHeader>
            <CardTitle>Hash Table (Buckets)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              {currentStepData.tableState.map((bucket, idx) => {
                const isHighlighted = currentStepData.highlightedIndex === idx
                return (
                  <div
                    key={idx}
                    className={`flex items-start p-3 rounded border ${isHighlighted ? "border-primary bg-primary/10" : "border-muted bg-background"
                      }`}
                  >
                    <div className="w-8 text-right font-mono text-sm text-muted-foreground mr-4">
                      {idx}
                    </div>
                    <div className="flex-1 min-h-8">
                      {bucket.length === 0 ? (
                        <span className="text-muted-foreground text-sm">empty</span>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {bucket.map((item, i) => (
                            <Badge key={i} variant="outline" className="font-mono">
                              "{item}"
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Pseudocode */}
        <Card>
          <CardHeader>
            <CardTitle>Pseudocode (w3schools Style)</CardTitle>
          </CardHeader>
          <div className="font-mono text-sm bg-muted p-4 rounded-md max-h-60 overflow-y-auto">
            {pseudocode.map((line, index) => (
              <div
                key={index}
                className={`py-1 px-2 rounded ${currentCodeLine === index + 1
                    ? "bg-primary/20 border-l-4 border-primary text-primary-foreground"
                    : "text-muted-foreground"
                  }`}
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
                <Badge variant="outline" className="font-mono">"key"</Badge>
                <span>Stored Key</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded border-2 border-primary bg-primary/10"></div>
                <span>Highlighted Bucket</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </VisualizerLayout>
  )
}
