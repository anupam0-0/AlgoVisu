"use client"

import { useState, useEffect, useCallback } from "react"
import { VisualizerLayout } from "../../../components/visualizer-layout"
import { Button } from "../../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { Badge } from "../../../components/ui/badge"
import { Slider } from "../../../components/ui/slider"
import { Shuffle, BarChart3, TrendingUp, Clock, Code, Layers, Eye } from "lucide-react"
import {
  bubbleSort,
  selectionSort,
  insertionSort,
  mergeSort,
  quickSort,
  heapSort,
  type SortElement,
  type SortStep
} from "../../../lib/algorithms/sorting"
import { Switch } from "../../../components/ui/switch"
import { Label } from "../../../components/ui/label"

// SortElement and SortStep moved to lib/algorithms/sorting.ts

type SortingAlgorithm = "bubble" | "selection" | "insertion" | "merge" | "quick" | "heap"

const normalColors = {
  bubble: { unsorted: "bg-blue-400", comparing: "bg-yellow-400", swapping: "bg-red-400", sorted: "bg-green-500", pivot: "bg-purple-500", selected: "bg-indigo-400" },
  selection: { unsorted: "bg-amber-400", comparing: "bg-cyan-400", swapping: "bg-red-500", sorted: "bg-emerald-500", pivot: "bg-purple-500", selected: "bg-violet-400" },
  insertion: { unsorted: "bg-rose-400", comparing: "bg-lime-400", swapping: "bg-orange-500", sorted: "bg-teal-500", pivot: "bg-purple-500", selected: "bg-fuchsia-400" },
  merge: { unsorted: "bg-accent", comparing: "bg-yellow-500", swapping: "bg-red-500", sorted: "bg-green-500", pivot: "bg-purple-500", selected: "bg-blue-500" },
  quick: { unsorted: "bg-accent", comparing: "bg-yellow-500", swapping: "bg-red-500", sorted: "bg-green-500", pivot: "bg-purple-500", selected: "bg-blue-500" },
  heap: { unsorted: "bg-accent", comparing: "bg-yellow-500", swapping: "bg-red-500", sorted: "bg-green-500", pivot: "bg-purple-500", selected: "bg-blue-500" },
}

const accessibleColors = {
  // varied patterns could be better but sticking to high contrast colors for now
  bubble: { unsorted: "bg-slate-400", comparing: "bg-yellow-600 border-4 border-yellow-900", swapping: "bg-red-700 border-4 border-red-900", sorted: "bg-black text-white border-2 border-white", pivot: "bg-purple-800", selected: "bg-blue-800" },
  selection: { unsorted: "bg-slate-400", comparing: "bg-yellow-600 border-4 border-yellow-900", swapping: "bg-red-700 border-4 border-red-900", sorted: "bg-black text-white border-2 border-white", pivot: "bg-purple-800", selected: "bg-blue-800" },
  insertion: { unsorted: "bg-slate-400", comparing: "bg-yellow-600 border-4 border-yellow-900", swapping: "bg-red-700 border-4 border-red-900", sorted: "bg-black text-white border-2 border-white", pivot: "bg-purple-800", selected: "bg-blue-800" },
  merge: { unsorted: "bg-slate-400", comparing: "bg-yellow-600 border-4 border-yellow-900", swapping: "bg-red-700 border-4 border-red-900", sorted: "bg-black text-white border-2 border-white", pivot: "bg-purple-800", selected: "bg-blue-800" },
  quick: { unsorted: "bg-slate-400", comparing: "bg-yellow-600 border-4 border-yellow-900", swapping: "bg-red-700 border-4 border-red-900", sorted: "bg-black text-white border-2 border-white", pivot: "bg-purple-800", selected: "bg-blue-800" },
  heap: { unsorted: "bg-slate-400", comparing: "bg-yellow-600 border-4 border-yellow-900", swapping: "bg-red-700 border-4 border-red-900", sorted: "bg-black text-white border-2 border-white", pivot: "bg-purple-800", selected: "bg-blue-800" },
}

const pseudocodeDefinitions: Record<SortingAlgorithm, string[]> = {
  bubble: [
    "for i = 0 to n-2",
    "  for j = 0 to n-i-2",
    "    if array[j] > array[j+1]",
    "      swap array[j] and array[j+1]",
    "  mark array[n-i-1] as sorted",
  ],
  selection: [
    "for i = 0 to n-2",
    "  minIndex = i",
    "  for j = i+1 to n-1",
    "    if array[j] < array[minIndex]",
    "      minIndex = j",
    "  if minIndex != i",
    "    swap array[i] and array[minIndex]",
    "  mark array[i] as sorted",
  ],
  insertion: [
    "for i = 1 to n-1",
    "  key = array[i]",
    "  j = i - 1",
    "  while j >= 0 and array[j] > key",
    "    array[j+1] = array[j]",
    "    j = j - 1",
    "  array[j+1] = key",
    "  mark array[0..i] as sorted",
  ],
  merge: [
    "function mergeSort(array, left, right)",
    "  if left < right",
    "    mid = (left + right) / 2",
    "    mergeSort(array, left, mid)",
    "    mergeSort(array, mid+1, right)",
    "    merge(array, left, mid, right)",
    "",
    "function merge(array, left, mid, right)",
    "  create leftArray and rightArray",
    "  i = 0, j = 0, k = left",
    "  while i < leftArray.length and j < rightArray.length",
    "    if leftArray[i] <= rightArray[j]",
    "      array[k] = leftArray[i]; i++",
    "    else",
    "      array[k] = rightArray[j]; j++",
    "    k++",
    "  copy remaining elements",
  ],
  quick: [
    "function quickSort(array, low, high)",
    "  if low < high",
    "    pivotIndex = partition(array, low, high)",
    "    quickSort(array, low, pivotIndex-1",
    "    quickSort(array, pivotIndex+1, high)",
    "",
    "function partition(array, low, high)",
    "  pivot = array[high]",
    "  i = low - 1",
    "  for j = low to high-1",
    "    if array[j] <= pivot",
    "      i++",
    "      swap array[i] and array[j]",
    "  swap array[i+1] and array[high]",
    "  return i+1",
  ],
  heap: [
    "function heapSort(array)",
    "  n = array.length",
    "  for i = n/2-1 down to 0",
    "    heapify(array, n, i)",
    "  for i = n-1 down to 1",
    "    swap array[0] and array[i]",
    "    heapify(array, i, 0)",
    "",
    "function heapify(array, n, i)",
    "  largest = i",
    "  left = 2*i + 1",
    "  right = 2*i + 2",
    "  if left < n and array[left] > array[largest]",
    "    largest = left",
    "  if right < n and array[right] > array[largest]",
    "    largest = right",
    "  if largest != i",
    "    swap array[i] and array[largest]",
    "    heapify(array, n, largest)",
  ],
}

const algorithmInfo = {
  bubble: {
    name: "Bubble Sort",
    timeComplexity: "O(n²)",
    spaceComplexity: "O(1)",
    stable: "Yes",
    inPlace: "Yes",
    bestFor: "Teaching basics; nearly-sorted small arrays",
    description:
      "Repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order.",
    howItWorks: ["Scan adjacent pairs and swap if out of order.", "Largest elements bubble to the end each pass.", "Early-stop optimization if no swaps in a pass."],
  },
  selection: {
    name: "Selection Sort",
    timeComplexity: "O(n²)",
    spaceComplexity: "O(1)",
    stable: "No (standard form)",
    inPlace: "Yes",
    bestFor: "Very small arrays; when swaps are expensive but comparisons are cheap",
    description: "Finds the minimum element and places it at the beginning, then repeats for the remaining elements.",
    howItWorks: ["Select the minimum from the unsorted portion.", "Swap it with the first unsorted position.", "Repeat shrinking the unsorted boundary."],
  },
  insertion: {
    name: "Insertion Sort",
    timeComplexity: "O(n²)",
    spaceComplexity: "O(1)",
    stable: "Yes",
    inPlace: "Yes",
    bestFor: "Small arrays; nearly-sorted data; as a subroutine in hybrid sorts",
    description: "Builds the final sorted array one item at a time by inserting each element into its correct position.",
    howItWorks: ["Take next key and shift larger items to the right.", "Insert key into the correct spot in the sorted prefix.", "Runs fast on nearly-sorted arrays."],
  },
  merge: {
    name: "Merge Sort",
    timeComplexity: "O(n log n)",
    spaceComplexity: "O(n)",
    stable: "Yes",
    inPlace: "No (standard form)",
    bestFor: "Linked lists; external sorting; guaranteed O(n log n)",
    description: "Divides the array into halves, sorts them separately, then merges them back together.",
    howItWorks: ["Divide the array into halves until size 1.", "Conquer by merging two sorted halves.", "Extra arrays used to merge back stably."],
  },
  quick: {
    name: "Quick Sort",
    timeComplexity: "O(n log n) average, O(n²) worst",
    spaceComplexity: "O(log n) average recursion stack",
    stable: "No (standard in-place partition)",
    inPlace: "Yes",
    bestFor: "General purpose in-memory sorting; very fast on average",
    description: "Picks a pivot element and partitions the array around it, then recursively sorts the partitions.",
    howItWorks: ["Choose a pivot (e.g., last element).", "Partition so smaller elements go left, larger go right.", "Recursively sort partitions."],
  },
  heap: {
    name: "Heap Sort",
    timeComplexity: "O(n log n)",
    spaceComplexity: "O(1)",
    stable: "No",
    inPlace: "Yes",
    bestFor: "When O(1) extra space is required; predictable O(n log n)",
    description: "Builds a max heap from the array, then repeatedly extracts the maximum element.",
    howItWorks: ["Heapify the array into a max-heap.", "Swap the root with the last element (max to end).", "Reduce heap size and heapify again."],
  },
}

export default function SortingVisualizerPage() {
  const [array, setArray] = useState<SortElement[]>([])
  const [originalArray, setOriginalArray] = useState<SortElement[]>([])
  const [sortSteps, setSortSteps] = useState<SortStep[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isSorting, setIsSorting] = useState(false)
  const [algorithm, setAlgorithm] = useState<SortingAlgorithm>("bubble")
  const [arraySize, setArraySize] = useState([10])
  const [speed, setSpeed] = useState([500])
  const [comparisons, setComparisons] = useState(0)
  const [swaps, setSwaps] = useState(0)
  const [highContrast, setHighContrast] = useState(false)

  const applications = [
    { title: "Database Query Optimization", description: "Sorting algorithms optimize database queries and indexing for faster data retrieval", examples: ["ORDER BY", "Index creation", "Query plans"] },
    { title: "Search Engine Ranking", description: "Sorting ranks results by relevance", examples: ["Result ordering", "Feeds", "Ranking pipelines"] },
    { title: "Data Analysis & Visualization", description: "Sorting enables efficient analysis and clear charts", examples: ["Stats", "Charts", "Reports"] },
    { title: "Operating System Scheduling", description: "Schedulers often sort/priority order tasks", examples: ["CPU scheduling", "Memory mgmt", "FS org"] },
  ]

  const generateRandomArray = useCallback(() => {
    const size = arraySize[0]
    const newArray: SortElement[] = []
    for (let i = 0; i < size; i++) {
      newArray.push({ value: Math.floor(Math.random() * 300) + 10, id: i })
    }
    setArray(newArray)
    setOriginalArray([...newArray])
    setSortSteps([])
    setCurrentStep(0)
    setComparisons(0)
    setSwaps(0)
    setIsSorting(false)
    setIsPlaying(false)
  }, [arraySize])

  useEffect(() => { generateRandomArray() }, [generateRandomArray])

  // Sorting Implementations moved to lib/algorithms/sorting.ts

  const startSorting = async () => {
    setIsSorting(true)
    setCurrentStep(0)
    let steps: SortStep[] = []
    switch (algorithm) {
      case "bubble": steps = bubbleSort(originalArray); break
      case "selection": steps = selectionSort(originalArray); break
      case "insertion": steps = insertionSort(originalArray); break
      case "merge": steps = mergeSort(originalArray); break
      case "quick": steps = quickSort(originalArray); break
      case "heap": steps = heapSort(originalArray); break
    }
    setSortSteps(steps)
    setComparisons(steps[steps.length - 1]?.comparisons || 0)
    setSwaps(steps[steps.length - 1]?.swaps || 0)
  }

  const stepForward = () => {
    if (currentStep < sortSteps.length - 1) {
      const next = currentStep + 1
      setCurrentStep(next)
      setArray(sortSteps[next].array)
    }
  }

  const stepBack = () => {
    if (currentStep > 0) {
      const prev = currentStep - 1
      setCurrentStep(prev)
      setArray(sortSteps[prev].array)
    }
  }

  const play = () => { if (sortSteps.length === 0) startSorting(); setIsPlaying(true) }
  const pause = () => setIsPlaying(false)
  const reset = () => {
    setArray([...originalArray]); setSortSteps([]); setCurrentStep(0)
    setComparisons(0); setSwaps(0); setIsSorting(false); setIsPlaying(false)
  }

  // Auto-advance while playing
  useEffect(() => {
    if (isPlaying && currentStep < sortSteps.length - 1) {
      const t = setTimeout(() => stepForward(), 1100 - speed[0])
      return () => clearTimeout(t)
    } else if (currentStep >= sortSteps.length - 1) setIsPlaying(false)
  }, [isPlaying, currentStep, sortSteps.length, speed])

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase()
      if (key === " " || key === "arrowleft" || key === "arrowright" || ["p", "r", "g", "s"].includes(key)) {
        e.preventDefault()
      }
      if (key === "p") { // play/start
        if (sortSteps.length === 0) startSorting()
        setIsPlaying(true)
      } else if (key === " ") { // pause/resume
        setIsPlaying(prev => !prev)
      } else if (key === "arrowright") {
        stepForward()
      } else if (key === "arrowleft") {
        stepBack()
      } else if (key === "r") {
        reset()
      } else if (key === "g") {
        generateRandomArray()
      } else if (key === "s") {
        startSorting()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [sortSteps.length, currentStep, originalArray, speed])

  const currentAlgorithm = algorithmInfo[algorithm]
  const currentPseudocode = pseudocodeDefinitions[algorithm]
  const currentCodeLine = sortSteps[currentStep]?.codeLine ?? -1
  const colors = highContrast ? accessibleColors[algorithm] : normalColors[algorithm]

  const onChooseAlgorithm = (alg: SortingAlgorithm) => {
    setAlgorithm(alg)
    setSortSteps([]); setCurrentStep(0); setComparisons(0); setSwaps(0)
    setIsSorting(false); setIsPlaying(false); setArray([...originalArray])
  }

  return (
    <VisualizerLayout
      title="Sorting Algorithm Visualizer"
      description="Compare and learn different sorting algorithms"
      difficulty="Intermediate"
      isPlaying={isPlaying}
      onPlay={play}
      onPause={pause}
      onStepBack={stepBack}
      onStepForward={stepForward}
      onReset={reset}
      currentStep={currentStep}
      totalSteps={sortSteps.length}
      complexity={{ time: currentAlgorithm.timeComplexity, space: currentAlgorithm.spaceComplexity }}
      applications={applications}
    >
      <div className="w-full space-y-6">
        {/* Understanding Sorting */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">📚 Understanding Sorting</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <div><strong>Sorting</strong> reorders data to a defined order. It’s key for fast lookup, grouping, and analytics. Algorithms trade off speed, space, stability, and in-place behavior.</div>
            <div className="rounded-md border bg-muted/30 p-3 font-mono text-xs text-foreground">
              Input: [7, 3, 8, 2] → Sorted: [2, 3, 7, 8]<br />
              Stable sort keeps equal keys in original order.
            </div>
          </CardContent>
        </Card>

        {/* Algorithm Selector (button group) */}
        <div className="flex justify-center">
          <div className="inline-flex rounded-md border p-1 bg-muted w-full max-w-2xl">
            {(["bubble", "selection", "insertion", "merge", "quick", "heap"] as const).map((alg) => (
              <button
                key={alg}
                onClick={() => onChooseAlgorithm(alg)}
                className={`flex-1 py-2 text-sm font-medium rounded-sm transition-colors ${algorithm === alg ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                {algorithmInfo[alg].name}
              </button>
            ))}
          </div>
        </div>

        {/* Algorithm Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{currentAlgorithm.name} — Details</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <div className="font-medium text-foreground">{currentAlgorithm.description}</div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1"><Clock className="h-4 w-4 text-accent" /><span className="text-sm font-medium">Time</span></div>
                <Badge variant="outline" className="font-mono">{currentAlgorithm.timeComplexity}</Badge>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1"><BarChart3 className="h-4 w-4 text-accent" /><span className="text-sm font-medium">Space</span></div>
                <Badge variant="outline" className="font-mono">{currentAlgorithm.spaceComplexity}</Badge>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1"><Layers className="h-4 w-4 text-accent" /><span className="text-sm font-medium">Stable</span></div>
                <Badge variant="outline">{currentAlgorithm.stable}</Badge>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1"><Layers className="h-4 w-4 text-accent" /><span className="text-sm font-medium">In-Place</span></div>
                <Badge variant="outline">{currentAlgorithm.inPlace}</Badge>
              </div>
            </div>
            <div>
              <div className="font-semibold text-foreground mb-1">How It Works</div>
              <ul className="list-disc list-inside space-y-1 text-xs">{algorithmInfo[algorithm].howItWorks.map((it, i) => <li key={i}>{it}</li>)}</ul>
            </div>
            <div className="text-xs"><strong>Best For:</strong> {currentAlgorithm.bestFor}</div>
          </CardContent>
        </Card>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Array Visualization */}
          <div>
            <div
              className="
      flex items-end justify-center gap-1
      min-h-[440px] md:min-h-[520px]
      p-6 md:p-8 bg-muted/10 rounded-lg
    "
            >
              {array.map((element, index) => {
                const step = sortSteps[currentStep]
                const isComparing = step?.comparing?.includes(index)
                const isSwapping = step?.swapping?.includes(index)
                const isPivot = step?.pivot === index
                const isSelected = element.isSelected

                // Smooth height + transform animation
                const transform =
                  isSwapping ? "translateY(-8px)"
                    : isComparing ? "translateY(-3px)"
                      : "translateY(0)"

                return (
                  <div
                    key={element.id}
                    className={`
            relative rounded-t-sm flex-1
            ${element.isSorted ? colors.sorted
                        : isPivot ? colors.pivot
                          : isSwapping ? colors.swapping
                            : isComparing ? colors.comparing
                              : isSelected ? colors.selected
                                : colors.unsorted}
          `}
                    style={{
                      height: `${element.value}px`,
                      transition: "height 250ms ease, transform 250ms ease, background-color 150ms linear",
                      transform,
                      willChange: "height, transform",
                    }}
                  >
                    <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-[12px] md:text-[13px] text-muted-foreground">
                      {element.value}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>


          {/* Pseudocode Panel */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Code className="h-4 w-4" />
                {currentAlgorithm.name} Pseudocode
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="font-mono text-sm bg-muted p-4 rounded-md max-h-96 overflow-y-auto">
                {pseudocodeDefinitions[algorithm].map((line, idx) => (
                  <div
                    key={idx}
                    className={`py-1 px-2 rounded ${currentCodeLine === idx ? "bg-primary/20 border-l-4 border-primary text-primary-foreground" : "text-muted-foreground"}`}
                  >
                    <span className="text-xs text-muted-foreground/70 mr-3">{idx + 1}</span>
                    {line || "\u00A0"}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader><CardTitle className="text-lg">Array Size</CardTitle></CardHeader>
            <CardContent>
              <Slider
                value={arraySize}
                onValueChange={(v) => { setArraySize(v); setTimeout(() => generateRandomArray(), 0) }}
                max={50} min={5} step={1} className="mb-2" disabled={isSorting}
              />
              <div className="text-sm text-muted-foreground text-center">{arraySize[0]} elements</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-lg">Speed</CardTitle></CardHeader>
            <CardContent>
              <Slider value={speed} onValueChange={setSpeed} max={1000} min={100} step={100} className="mb-2" />
              <div className="text-sm text-muted-foreground text-center">
                {speed[0] < 300 ? "Slow" : speed[0] < 700 ? "Medium" : "Fast"}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-lg">Generate</CardTitle></CardHeader>
            <CardContent>
              <Button onClick={generateRandomArray} disabled={isSorting} className="w-full">
                <Shuffle className="h-4 w-4 mr-2" /> New Array
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-lg">Algorithm (Selected)</CardTitle></CardHeader>
            <CardContent>
              <div className="text-sm text-center font-medium">{algorithmInfo[algorithm].name}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-lg">Appearance</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Switch id="high-contrast" checked={highContrast} onCheckedChange={setHighContrast} />
                <Label htmlFor="high-contrast" className="flex items-center gap-2 cursor-pointer">
                  <Eye className="h-4 w-4" /> High Contrast
                </Label>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats */}
        <Card>
          <CardHeader><CardTitle className="text-lg">{algorithmInfo[algorithm].name}</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">{algorithmInfo[algorithm].description}</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1"><Clock className="h-4 w-4 text-accent" /><span className="text-sm font-medium">Time</span></div>
                <Badge variant="outline" className="font-mono">{algorithmInfo[algorithm].timeComplexity}</Badge>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1"><BarChart3 className="h-4 w-4 text-accent" /><span className="text-sm font-medium">Space</span></div>
                <Badge variant="outline" className="font-mono">{algorithmInfo[algorithm].spaceComplexity}</Badge>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1"><TrendingUp className="h-4 w-4 text-accent" /><span className="text-sm font-medium">Comparisons</span></div>
                <div className="text-lg font-bold text-accent">{sortSteps[currentStep]?.comparisons || comparisons}</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1"><Shuffle className="h-4 w-4 text-accent" /><span className="text-sm font-medium">Swaps</span></div>
                <div className="text-lg font-bold text-accent">{sortSteps[currentStep]?.swaps || swaps}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Step */}
        {sortSteps.length > 0 && (
          <Card>
            <CardHeader><CardTitle className="text-lg">Current Step</CardTitle></CardHeader>
            <CardContent>
              <div className="text-sm p-3 bg-accent/10 rounded-lg border border-accent/20">
                {sortSteps[currentStep]?.description || "Ready to start sorting"}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Legend */}
        <Card>
          <CardHeader><CardTitle className="text-lg">Legend</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2"><div className={`w-4 h-4 ${colors.unsorted} rounded`} /><span>Unsorted</span></div>
              <div className="flex items-center gap-2"><div className={`w-4 h-4 ${colors.comparing} rounded`} /><span>Comparing</span></div>
              <div className="flex items-center gap-2"><div className={`w-4 h-4 ${colors.swapping} rounded`} /><span>Swapping</span></div>
              <div className="flex items-center gap-2"><div className={`w-4 h-4 ${colors.sorted} rounded`} /><span>Sorted</span></div>
              <div className="flex items-center gap-2"><div className={`w-4 h-4 ${colors.pivot} rounded`} /><span>Pivot</span></div>
              <div className="flex items-center gap-2"><div className={`w-4 h-4 ${colors.selected} rounded`} /><span>Selected</span></div>
            </div>
          </CardContent>
        </Card>
      </div>
    </VisualizerLayout>
  )
}
