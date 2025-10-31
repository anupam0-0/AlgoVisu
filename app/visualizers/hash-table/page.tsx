"use client"

import { useState, useEffect, useCallback } from "react"
import { VisualizerLayout } from "../../../components/visualizer-layout"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../components/ui/card"
import { Badge } from "../../../components/ui/badge"
import { Plus, X, Hash, Zap, RotateCcw } from "lucide-react"

// Types
type HashEntry = {
  key: string
  value: string
  status?: "deleted" // for open addressing
}

type HashSlot = HashEntry[] // for chaining
type TableState = (HashSlot | HashEntry | null)[]

type CollisionStrategy = "chaining" | "linear-probing"

interface Step {
  description: string
  tableState: TableState
  highlightedIndex: number | null
  codeLine: number
  isRehash?: boolean
}

const pseudocodeDefinitions = {
  chaining: [
    "function insert(key, value):",
    "  index = hash(key) % tableSize",
    "  for each entry in table[index]:",
    "    if entry.key == key:",
    "      entry.value = value",
    "      return",
    "  table[index].push({ key, value })",
    "",
    "function search(key):",
    "  index = hash(key) % tableSize",
    "  for each entry in table[index]:",
    "    if entry.key == key: return entry.value",
    "  return null",
  ],
  "linear-probing": [
    "function insert(key, value):",
    "  index = hash(key) % tableSize",
    "  while table[index] is not null and table[index].key != key and table[index].status != 'deleted':",
    "    index = (index + 1) % tableSize",
    "  table[index] = { key, value }",
    "",
    "function search(key):",
    "  index = hash(key) % tableSize",
    "  while table[index] is not null:",
    "    if table[index].key == key and table[index].status != 'deleted':",
    "      return table[index].value",
    "    index = (index + 1) % tableSize",
    "  return null",
  ],
}

// Default hash function
const defaultHashFunction = "key.split('').reduce((sum, c) => sum + c.charCodeAt(0), 0)"

export default function HashTableVisualizer() {
  // Config
  const [tableSize, setTableSize] = useState<number>(7)
  const [strategy, setStrategy] = useState<CollisionStrategy>("chaining")
  const [customHash, setCustomHash] = useState<string>(defaultHashFunction)

  // Input
  const [key, setKey] = useState("")
  const [value, setValue] = useState("")

  // State
  const [table, setTable] = useState<TableState>([])
  const [steps, setSteps] = useState<Step[]>([])
  const [currentStep, setCurrentStep] = useState(0)

  // Pseudocode
  const [currentPseudocode, setCurrentPseudocode] = useState<string[]>(
    pseudocodeDefinitions.chaining
  )
  const [currentCodeLine, setCurrentCodeLine] = useState<number>(-1)

  // Initialize table
  useEffect(() => {
    resetTable()
  }, [tableSize, strategy])

  useEffect(() => {
    setCurrentPseudocode(pseudocodeDefinitions[strategy])
    setCurrentCodeLine(-1)
  }, [strategy])

  const resetTable = () => {
    if (strategy === "chaining") {
      setTable(Array(tableSize).fill(null).map(() => [] as HashSlot))
    } else {
      setTable(Array(tableSize).fill(null))
    }
    setSteps([])
    setCurrentStep(0)
  }

  // Safe hash function evaluator
  const evaluateHash = useCallback(
    (key: string, size: number): number => {
      try {
        // eslint-disable-next-line no-new-func
        const hashFn = new Function("key", `return (${customHash})`)
        const rawHash = hashFn(key)
        if (typeof rawHash !== "number" || isNaN(rawHash)) {
          throw new Error("Hash must return a number")
        }
        return ((rawHash % size) + size) % size // Ensure non-negative
      } catch (e) {
        console.warn("Hash eval error, using default:", e)
        let hash = 0
        for (let i = 0; i < key.length; i++) {
          hash += key.charCodeAt(i)
        }
        return hash % size
      }
    },
    [customHash]
  )

  const addStep = (
    description: string,
    highlightedIndex: number | null,
    codeLine: number,
    isRehash = false
  ) => {
    setSteps((prev) => [
      ...prev,
      {
        description,
        tableState: JSON.parse(JSON.stringify(table)),
        highlightedIndex,
        codeLine,
        isRehash,
      },
    ])
  }

  const getLoadFactor = (tbl: TableState): number => {
    if (strategy === "chaining") {
      return tbl.reduce((sum, slot) => sum + (slot as HashSlot).length, 0) / tableSize
    } else {
      return (
        tbl.filter(
          (slot) => slot !== null && (slot as HashEntry).status !== "deleted"
        ).length / tableSize
      )
    }
  }

  const getAllEntries = (tbl: TableState): HashEntry[] => {
    const entries: HashEntry[] = []
    if (strategy === "chaining") {
      for (const slot of tbl as HashSlot[]) {
        for (const entry of slot) {
          entries.push(entry)
        }
      }
    } else {
      for (const slot of tbl as (HashEntry | null)[]) {
        if (slot && slot.status !== "deleted") {
          entries.push(slot)
        }
      }
    }
    return entries
  }

  const performRehash = () => {
    const newTableSize = tableSize * 2 + 1 // ensure odd for probing
    const newTable = strategy === "chaining"
      ? Array(newTableSize).fill(null).map(() => [] as HashSlot)
      : Array(newTableSize).fill(null)

    const entries = getAllEntries(table)
    addStep(
      `🔁 Rehashing: Load factor = ${getLoadFactor(table).toFixed(2)} > 0.75. Resizing to ${newTableSize}.`,
      null,
      -1,
      true
    )

    // Reinsert all entries
    for (const entry of entries) {
      const newIndex = evaluateHash(entry.key, newTableSize)
      if (strategy === "chaining") {
        (newTable[newIndex] as HashSlot).push(entry)
      } else {
        let index = newIndex
        let probe = 0
        while (
          probe < newTableSize &&
          newTable[index] !== null &&
          (newTable[index] as HashEntry).key !== entry.key &&
          (newTable[index] as HashEntry).status !== "deleted"
        ) {
          index = (index + 1) % newTableSize
          probe++
        }
        if (probe < newTableSize) {
          newTable[index] = entry
        }
      }
    }

    setTable(newTable)
    setTableSize(newTableSize)
    addStep(
      `✅ Rehash complete. New table size: ${newTableSize}`,
      null,
      -1,
      true
    )
  }

  const handleInsert = () => {
    if (!key.trim()) return
    const val = value || "1"
    let newTable = [...table]
    const stepsSnapshot: Step[] = []
    let index = evaluateHash(key, tableSize)

    if (strategy === "chaining") {
      const slot = newTable[index] as HashSlot
      const existing = slot.find((entry) => entry.key === key)
      if (existing) {
        existing.value = val
        stepsSnapshot.push({
          description: `Key "${key}" exists. Updated value to "${val}".`,
          tableState: JSON.parse(JSON.stringify(newTable)),
          highlightedIndex: index,
          codeLine: 5,
        })
      } else {
        slot.push({ key, value: val })
        stepsSnapshot.push({
          description: `Inserted "${key}" → "${val}" at index ${index} (chaining).`,
          tableState: JSON.parse(JSON.stringify(newTable)),
          highlightedIndex: index,
          codeLine: 6,
        })
      }
    } else {
      let probeCount = 0
      let originalIndex = index
      while (
        probeCount < tableSize &&
        newTable[index] !== null &&
        (newTable[index] as HashEntry).key !== key &&
        (newTable[index] as HashEntry).status !== "deleted"
      ) {
        stepsSnapshot.push({
          description: `Index ${index} occupied. Probing next...`,
          tableState: JSON.parse(JSON.stringify(newTable)),
          highlightedIndex: index,
          codeLine: 3,
        })
        index = (index + 1) % tableSize
        probeCount++
      }

      if (probeCount >= tableSize) {
        alert("Hash table is full!")
        return
      }

      const existing = newTable[index] as HashEntry | null
      if (existing && existing.key === key) {
        ;(newTable[index] as HashEntry).value = val
        stepsSnapshot.push({
          description: `Key "${key}" found at index ${index}. Updated value.`,
          tableState: JSON.parse(JSON.stringify(newTable)),
          highlightedIndex: index,
          codeLine: 4,
        })
      } else {
        newTable[index] = { key, value: val }
        stepsSnapshot.push({
          description: `Inserted "${key}" → "${val}" at index ${index} (linear probing).`,
          tableState: JSON.parse(JSON.stringify(newTable)),
          highlightedIndex: index,
          codeLine: 4,
        })
      }
    }

    setTable(newTable)
    setSteps(stepsSnapshot)
    setCurrentStep(0)

    // Check if rehash needed
    const newLoadFactor = getLoadFactor(newTable)
    if (newLoadFactor > 0.75) {
      setTimeout(() => {
        performRehash()
      }, 600)
    }

    setKey("")
    setValue("")
  }

  const handleSearch = () => {
    if (!key.trim()) return
    const newTable = [...table]
    const stepsSnapshot: Step[] = []
    let index = evaluateHash(key, tableSize)

    if (strategy === "chaining") {
      const slot = newTable[index] as HashSlot
      const found = slot.find((entry) => entry.key === key)
      if (found) {
        stepsSnapshot.push({
          description: `Found "${key}" → "${found.value}" at index ${index}.`,
          tableState: JSON.parse(JSON.stringify(newTable)),
          highlightedIndex: index,
          codeLine: 11,
        })
      } else {
        stepsSnapshot.push({
          description: `Key "${key}" not found in index ${index}.`,
          tableState: JSON.parse(JSON.stringify(newTable)),
          highlightedIndex: index,
          codeLine: 12,
        })
      }
    } else {
      let probeCount = 0
      while (probeCount < tableSize && newTable[index] !== null) {
        const entry = newTable[index] as HashEntry
        if (entry.key === key && entry.status !== "deleted") {
          stepsSnapshot.push({
            description: `Found "${key}" → "${entry.value}" at index ${index}.`,
            tableState: JSON.parse(JSON.stringify(newTable)),
            highlightedIndex: index,
            codeLine: 10,
          })
          setTable(newTable)
          setSteps(stepsSnapshot)
          setCurrentStep(0)
          setKey("")
          return
        }
        stepsSnapshot.push({
          description: `Checked index ${index}, not a match.`,
          tableState: JSON.parse(JSON.stringify(newTable)),
          highlightedIndex: index,
          codeLine: 9,
        })
        index = (index + 1) % tableSize
        probeCount++
      }
      stepsSnapshot.push({
        description: `Key "${key}" not found after full probe.`,
        tableState: JSON.parse(JSON.stringify(newTable)),
        highlightedIndex: null,
        codeLine: 12,
      })
    }

    setTable(newTable)
    setSteps(stepsSnapshot)
    setCurrentStep(0)
    setKey("")
  }

  const handleDelete = () => {
    if (!key.trim()) return
    const newTable = [...table]
    let index = evaluateHash(key, tableSize)

    if (strategy === "chaining") {
      const slot = newTable[index] as HashSlot
      const idx = slot.findIndex((entry) => entry.key === key)
      if (idx !== -1) {
        slot.splice(idx, 1)
        const stepsSnapshot = [
          {
            description: `Deleted key "${key}" from index ${index}.`,
            tableState: JSON.parse(JSON.stringify(newTable)),
            highlightedIndex: index,
            codeLine: -1,
          },
        ]
        setTable(newTable)
        setSteps(stepsSnapshot)
        setCurrentStep(0)
      } else {
        alert("Key not found.")
      }
    } else {
      let probeCount = 0
      while (probeCount < tableSize && newTable[index] !== null) {
        const entry = newTable[index] as HashEntry
        if (entry.key === key && entry.status !== "deleted") {
          ;(newTable[index] as HashEntry).status = "deleted"
          const stepsSnapshot = [
            {
              description: `Marked key "${key}" as deleted (lazy deletion).`,
              tableState: JSON.parse(JSON.stringify(newTable)),
              highlightedIndex: index,
              codeLine: -1,
            },
          ]
          setTable(newTable)
          setSteps(stepsSnapshot)
          setCurrentStep(0)
          setKey("")
          return
        }
        index = (index + 1) % tableSize
        probeCount++
      }
      alert("Key not found.")
    }
    setKey("")
  }

  // Navigation
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

  const currentStepData = steps[currentStep] || {
    description: "Ready to perform an operation.",
    tableState: table,
    highlightedIndex: null,
    codeLine: -1,
  }

  const loadFactor = getLoadFactor(table)

  const applications = [
    {
      title: "Database Indexing",
      description: "Hash tables enable O(1) lookups in database systems",
      examples: ["Primary keys", "Unique constraints", "Caching query results"],
    },
    {
      title: "Caching Systems",
      description: "Used in Redis, Memcached, and browser caches",
      examples: ["Session storage", "API response caching", "Page rendering"],
    },
    {
      title: "Language Implementations",
      description: "JavaScript objects, Python dicts, and Java HashMaps rely on hashing",
      examples: ["Object property access", "Symbol tables", "Compiler optimizations"],
    },
  ]

  return (
    <VisualizerLayout
      title="Hash Table Visualizer"
      description="Explore key-value storage, custom hash functions, and automatic rehashing"
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
        time: strategy === "chaining" ? "O(1) avg, O(n) worst" : "O(1) avg, O(n) worst",
        space: "O(n)",
      }}
      applications={applications}
    >
      <style jsx global>{`
        @keyframes fadeSlideIn {
          from {
            opacity: 0;
            transform: translateY(8px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-hash-row {
          animation: fadeSlideIn 0.4s cubic-bezier(0.22, 0.61, 0.36, 1) forwards;
          opacity: 0;
        }
      `}</style>

      <div className="w-full space-y-6">
        {/* Info Card */}
        <Card className="bg-orange-50 border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Hash className="h-5 w-5" />
              What is a Hash Table?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div>
                A <strong>hash table</strong> maps <em>keys</em> to <em>values</em> using a <strong>hash function</strong>.
                Average <strong>O(1)</strong> operations!
              </div>
              <div>
                <strong>Collisions</strong> are resolved via <em>chaining</em> or <em>linear probing</em>.
                This visualizer supports <strong>custom hash functions</strong> and <strong>automatic rehashing</strong> when load factor exceeds 0.75.
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Controls */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Strategy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-col gap-2">
                <Button
                  variant={strategy === "chaining" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStrategy("chaining")}
                  className="justify-start"
                >
                  Chaining
                </Button>
                <Button
                  variant={strategy === "linear-probing" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStrategy("linear-probing")}
                  className="justify-start"
                >
                  Linear Probing
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Table Size</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                type="number"
                min="3"
                max="31"
                value={tableSize}
                onChange={(e) =>
                  setTableSize(Math.max(3, Math.min(31, Number(e.target.value))))
                }
                className="w-full"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Load Factor</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${loadFactor > 0.75 ? "text-red-500" : "text-accent"}`}>
                {loadFactor.toFixed(2)}
              </div>
              <div className="text-sm text-muted-foreground">n / tableSize</div>
              {loadFactor > 0.75 && (
                <div className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <RotateCcw className="h-3 w-3" /> Will rehash on next insert
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Reset</CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={reset} className="w-full" variant="outline">
                Clear Table
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Hash Function Input */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Custom Hash Function</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Input
                placeholder="Enter JS expression (e.g., key.length, key.charCodeAt(0))"
                value={customHash}
                onChange={(e) => setCustomHash(e.target.value)}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Receives <code className="bg-muted px-1 rounded">key</code> (string). Must return a number.
                Default: sum of character codes.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Operation Inputs */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Operations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2 flex-wrap">
              <Input
                placeholder="Key"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                className="flex-1 min-w-[120px]"
              />
              <Input
                placeholder="Value"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="flex-1 min-w-[120px]"
              />
              <Button onClick={handleInsert} className="gap-1">
                <Plus className="h-4 w-4" /> Insert
              </Button>
              <Button variant="outline" onClick={handleSearch} className="gap-1">
                <Zap className="h-4 w-4" /> Search
              </Button>
              <Button variant="destructive" onClick={handleDelete} className="gap-1">
                <X className="h-4 w-4" /> Delete
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Visualization */}
        <Card>
          <CardHeader>
            <CardTitle>Hash Table ({strategy})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              {currentStepData.tableState.map((slot, idx) => {
                const isHighlighted = currentStepData.highlightedIndex === idx
                return (
                  <div
                    key={idx}
                    className={`animate-hash-row flex items-center p-3 rounded border ${
                      isHighlighted ? "border-primary bg-primary/10" : "border-muted bg-background"
                    }`}
                    style={{ animationDelay: `${idx * 20}ms` }}
                  >
                    <div className="w-8 text-right font-mono text-sm text-muted-foreground mr-4">
                      {idx}
                    </div>
                    <div className="flex-1 min-h-8">
                      {strategy === "chaining" ? (
                        (slot as HashSlot).length === 0 ? (
                          <span className="text-muted-foreground text-sm">empty</span>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {(slot as HashSlot).map((entry, i) => (
                              <Badge key={i} variant="outline" className="font-mono">
                                "{entry.key}" → "{entry.value}"
                              </Badge>
                            ))}
                          </div>
                        )
                      ) : (
                        slot === null ? (
                          <span className="text-muted-foreground text-sm">empty</span>
                        ) : (slot as HashEntry).status === "deleted" ? (
                          <Badge variant="destructive" className="font-mono">DELETED</Badge>
                        ) : (
                          <Badge variant="outline" className="font-mono">
                            "{(slot as HashEntry).key}" → "{(slot as HashEntry).value}"
                          </Badge>
                        )
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
            <CardTitle>Pseudocode ({strategy})</CardTitle>
          </CardHeader>
          <div className="font-mono text-sm bg-muted p-4 rounded-md max-h-60 overflow-y-auto">
            {currentPseudocode.map((line, index) => (
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
                <Badge variant="outline" className="font-mono">"key" → "val"</Badge>
                <span>Active Entry</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="destructive">DELETED</Badge>
                <span>Deleted (Linear Probing)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded border-2 border-primary bg-primary/10"></div>
                <span>Highlighted Index</span>
              </div>
              {steps.some((s) => s.isRehash) && (
                <div className="flex items-center gap-2">
                  <RotateCcw className="h-4 w-4 text-blue-500" />
                  <span>Rehashing Step</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </VisualizerLayout>
  )
}