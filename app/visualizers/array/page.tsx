"use client"

import { useState, useCallback } from "react"
import { VisualizerLayout } from "../../../components/visualizer-layout"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { Badge } from "../../../components/ui/badge"
import { Search, Plus, Trash2, ArrowUpDown, Code } from "lucide-react"

interface ArrayElement {
  value: number
  index: number
  isHighlighted?: boolean
  isFound?: boolean
  isComparing?: boolean
}

const DEFAULT_ARRAY: ArrayElement[] = [
  { value: 64, index: 0 },
  { value: 34, index: 1 },
  { value: 25, index: 2 },
  { value: 12, index: 3 },
  { value: 22, index: 4 },
  { value: 11, index: 5 },
  { value: 90, index: 6 },
]

// Pseudocode definitions
const PSEUDOCODE = {
  linear: [
    "function linearSearch(array, target):",
    "  for i from 0 to length(array) - 1:",
    "    if array[i] == target:",
    "      return i",
    "  return -1",
  ],
  binary: [
    "function binarySearch(sortedArray, target):",
    "  left = 0",
    "  right = length(sortedArray) - 1",
    "  while left <= right:",
    "    mid = floor((left + right) / 2)",
    "    if sortedArray[mid] == target:",
    "      return mid",
    "    else if sortedArray[mid] < target:",
    "      left = mid + 1",
    "    else:",
    "      right = mid - 1",
    "  return -1",
  ],
}

export default function ArrayVisualizerPage() {
  const [array, setArray] = useState<ArrayElement[]>(DEFAULT_ARRAY)
  const [searchValue, setSearchValue] = useState("")
  const [newValue, setNewValue] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [searchSteps, setSearchSteps] = useState<string[]>([])
  const [currentStepIndex, setCurrentStepIndex] = useState(-1)
  const [algorithm, setAlgorithm] = useState<"linear" | "binary">("linear")

  const applications = [
    {
      title: "Image Processing",
      description: "Arrays store pixel data for digital images and enable efficient manipulation",
      examples: ["Photo editing software", "Computer vision systems", "Medical imaging"],
    },
    {
      title: "Database Systems",
      description: "Arrays optimize data storage and enable fast indexing for database operations",
      examples: ["SQL query optimization", "Index structures", "Data warehousing"],
    },
    {
      title: "Gaming & Graphics",
      description: "Arrays manage game states, 3D coordinates, and rendering pipelines",
      examples: ["Game world coordinates", "3D model vertices", "Animation frames"],
    },
    {
      title: "Scientific Computing",
      description: "Arrays handle large datasets and mathematical computations efficiently",
      examples: ["Weather modeling", "Financial analysis", "Machine learning datasets"],
    },
  ]

  const isSorted = useCallback((arr: ArrayElement[]) => {
    for (let i = 1; i < arr.length; i++) {
      if (arr[i - 1].value > arr[i].value) return false
    }
    return true
  }, [])

  const resetHighlights = useCallback((arr: ArrayElement[]): ArrayElement[] => {
    return arr.map(el => ({
      ...el,
      isHighlighted: false,
      isFound: false,
      isComparing: false,
    }))
  }, [])

  const resetArray = () => {
    setArray(DEFAULT_ARRAY)
    setSearchSteps([])
    setCurrentStepIndex(-1)
    setSearchValue("")
    setNewValue("")
  }

  const addElement = () => {
    const num = Number(newValue)
    if (newValue.trim() !== "" && !isNaN(num)) {
      const newElement: ArrayElement = {
        value: num,
        index: array.length,
      }
      setArray(prev => [...prev, newElement])
      setNewValue("")
    }
  }

  const removeElement = (index: number) => {
    const newArray = array.filter((_, i) => i !== index)
    setArray(newArray.map((el, idx) => ({ ...el, index: idx })))
    if (searchSteps.length > 0) resetArray()
  }

  const sortArray = () => {
    setArray(prev =>
      [...prev]
        .sort((a, b) => a.value - b.value)
        .map((el, idx) => ({ ...el, index: idx }))
    )
    if (searchSteps.length > 0) resetArray()
  }

  const linearSearch = async (target: number) => {
    const steps = [`Starting linear search for ${target}`]
    let newArray = resetHighlights(array)

    for (let i = 0; i < newArray.length; i++) {
      newArray = newArray.map((el, idx) => ({
        ...el,
        isComparing: idx === i,
      }))
      setArray([...newArray])
      steps.push(`Checking index ${i}: ${newArray[i].value}`)
      setCurrentStepIndex(steps.length - 1)
      await new Promise(resolve => setTimeout(resolve, 500))

      if (newArray[i].value === target) {
        newArray = newArray.map((el, idx) => ({
          ...el,
          isComparing: false,
          isFound: idx === i,
        }))
        setArray([...newArray])
        steps.push(`✅ Found ${target} at index ${i}!`)
        setCurrentStepIndex(steps.length - 1)
        return steps
      }
    }

    steps.push(`❌ ${target} not found in array`)
    setCurrentStepIndex(steps.length - 1)
    setArray(resetHighlights(array))
    return steps
  }

  const binarySearch = async (target: number) => {
    if (!isSorted(array)) {
      const msg = "❌ Array is not sorted! Binary search requires a sorted array."
      setSearchSteps([msg])
      setCurrentStepIndex(0)
      return [msg]
    }

    const steps = [`Starting binary search for ${target}`]
    const sortedWithOriginal = array.map((el, i) => ({ ...el, originalIndex: i }))
    sortedWithOriginal.sort((a, b) => a.value - b.value)

    let left = 0
    let right = sortedWithOriginal.length - 1
    let currentArray = resetHighlights(array)

    while (left <= right) {
      const mid = Math.floor((left + right) / 2)
      const midValue = sortedWithOriginal[mid].value
      const originalIndex = sortedWithOriginal[mid].originalIndex

      currentArray = resetHighlights(array).map((el, idx) => ({
        ...el,
        isComparing: idx === originalIndex,
      }))
      setArray([...currentArray])
      steps.push(`Checking middle element at original index ${originalIndex}: ${midValue}`)
      setCurrentStepIndex(steps.length - 1)
      await new Promise(resolve => setTimeout(resolve, 600))

      if (midValue === target) {
        currentArray = resetHighlights(array).map((el, idx) => ({
          ...el,
          isFound: idx === originalIndex,
        }))
        setArray([...currentArray])
        steps.push(`✅ Found ${target} at original index ${originalIndex}!`)
        setCurrentStepIndex(steps.length - 1)
        return steps
      } else if (midValue < target) {
        steps.push(`${midValue} < ${target} → search right half`)
        setCurrentStepIndex(steps.length - 1)
        left = mid + 1
      } else {
        steps.push(`${midValue} > ${target} → search left half`)
        setCurrentStepIndex(steps.length - 1)
        right = mid - 1
      }
    }

    steps.push(`❌ ${target} not found in array`)
    setCurrentStepIndex(steps.length - 1)
    setArray(resetHighlights(array))
    return steps
  }

  const startSearch = async () => {
    const target = Number(searchValue)
    if (searchValue.trim() === "" || isNaN(target)) return

    setIsSearching(true)
    setSearchSteps([])
    setCurrentStepIndex(-1)

    const steps = algorithm === "linear"
      ? await linearSearch(target)
      : await binarySearch(target)

    setSearchSteps(steps)
    setIsSearching(false)
  }

  return (
    <VisualizerLayout
      title="Array Visualizer"
      description="Visualize array search algorithms with pseudocode and step-by-step execution"
      difficulty="Beginner"
      complexity={{
        time: algorithm === "linear" ? "O(n)" : "O(log n)",
        space: "O(1)",
      }}
      applications={applications}
    >
      <div className="w-full space-y-8">
        {/* Introduction Section */}
        <Card className="bg-gradient-to-br from-gray-50 to-white shadow-md border border-gray-200 rounded-2xl mb-8">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-800">
              Understanding Arrays
            </CardTitle>
          </CardHeader>
          <CardContent className="text-black leading-relaxed space-y-3 text-sm md:text-base">
            <div>
              An <strong>Array</strong> is a linear data structure used to store a fixed-size sequence of
              elements of the same type. Each element is accessed by its <em>index</em>, which represents its
              position in memory. Arrays are one of the most fundamental data structures in computer science.
            </div>

            <div>
              Arrays enable efficient <strong>data storage</strong> and <strong>random access</strong>, meaning any element can
              be retrieved instantly using its index. However, inserting or deleting elements can be costly,
              since other elements may need to shift to maintain order.
            </div>

            <div className="p-4 bg-gray-50 border rounded-lg shadow-sm space-y-2">
              <h4 className="font-semibold text-gray-800">Example:</h4>
              <div className="bg-gray-900 text-gray-100 p-3 rounded-lg text-sm overflow-x-auto font-mono leading-relaxed">
                # Example of an array in Python<br />
                numbers = [11, 22, 33, 44, 55]<br />
                <br />
                # Accessing elements<br />
                print(numbers[0]) &nbsp;&nbsp;# Output: 11<br />
                print(numbers[3]) &nbsp;&nbsp;# Output: 44
              </div>
            </div>

            <div>
              In this visualizer, you can <strong>add elements</strong>, <strong>sort</strong> them, and observe
              how different search algorithms like <strong>Linear Search</strong> and <strong>Binary Search</strong>
               work step-by-step in real time. The visualization demonstrates how comparisons and highlights
              change dynamically as the algorithm progresses.
            </div>
          </CardContent>
        </Card>

        {/* Array Visualization — Enlarged */}
        <div className="flex flex-wrap justify-center gap-4 min-h-[200px] items-center p-6 bg-gradient-to-br from-muted/30 to-background rounded-2xl border border-border shadow-sm">
          {array.length === 0 ? (
            <p className="text-muted-foreground italic text-lg">Array is empty</p>
          ) : (
            array.map((element) => (
              <div key={element.index} className="relative group">
                <div
                  className={`
                    w-20 h-20 md:w-24 md:h-24 border-2 rounded-xl flex flex-col items-center justify-center
                    transition-all duration-300 shadow-md font-bold
                    ${element.isFound
                      ? "bg-green-100 border-green-600 text-green-900 shadow-lg scale-105"
                      : element.isComparing
                        ? "bg-yellow-100 border-yellow-500 text-yellow-900 animate-pulse"
                        : "bg-background border-border hover:border-primary/60"
                    }
                  `}
                >
                  <span className="text-lg md:text-xl font-mono">{element.value}</span>
                  <span className="text-xs text-muted-foreground mt-1">[{element.index}]</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute -top-2 -right-2 h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity bg-background border rounded-full"
                  onClick={() => removeElement(element.index)}
                  aria-label={`Remove element at index ${element.index}`}
                >
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </Button>
              </div>
            ))
          )}
        </div>

        {/* Controls */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Element
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Enter a number"
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addElement()}
                />
                <Button onClick={addElement} disabled={!newValue.trim()}>
                  Add
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Search className="h-4 w-4" />
                Search
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={algorithm === "linear" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setAlgorithm("linear")}
                  className="flex-1 min-w-[100px]"
                >
                  Linear
                </Button>
                <Button
                  variant={algorithm === "binary" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setAlgorithm("binary")}
                  className="flex-1 min-w-[100px]"
                  disabled={!isSorted(array)}
                >
                  Binary
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={sortArray}
                  disabled={isSorted(array) || isSearching}
                  className="flex items-center gap-1"
                >
                  <ArrowUpDown className="h-3 w-3" />
                  Sort
                </Button>
              </div>

              {algorithm === "binary" && !isSorted(array) && (
                <Badge variant="outline" className="text-yellow-600 border-yellow-400">
                  ⚠️ Sort array first for binary search
                </Badge>
              )}

              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Search value"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && startSearch()}
                />
                <Button
                  onClick={startSearch}
                  disabled={
                    !searchValue.trim() ||
                    isNaN(Number(searchValue)) ||
                    (algorithm === "binary" && !isSorted(array)) ||
                    isSearching
                  }
                >
                  <Search className="h-4 w-4 mr-1" />
                  Search
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pseudocode + Steps Side-by-Side */}
        {(searchSteps.length > 0 || true) && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Pseudocode */}
            <Card className="bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Code className="h-4 w-4" />
                  {algorithm === "linear" ? "Linear Search" : "Binary Search"} Pseudocode
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-sm p-3 bg-muted/30 rounded-lg overflow-x-auto font-mono leading-relaxed">
                  {PSEUDOCODE[algorithm].map((line, i) => (
                    <div key={i} className="text-muted-foreground">
                      {line}
                    </div>
                  ))}
                </pre>
              </CardContent>
            </Card>

            {/* Search Steps */}
            {searchSteps.length > 0 && (
              <Card className="bg-card/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Execution Steps</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-72 overflow-y-auto p-2">
                    {searchSteps.map((step, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg text-sm transition-all ${index === currentStepIndex
                            ? "bg-primary/10 border border-primary/30 font-medium text-primary"
                            : "bg-background border border-border"
                          }`}
                      >
                        <Badge variant="outline" className="mr-2">
                          {index + 1}
                        </Badge>
                        {step}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </VisualizerLayout>
  )
}