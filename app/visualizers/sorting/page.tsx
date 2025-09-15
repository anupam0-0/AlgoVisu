"use client"

import { useState, useEffect, useCallback } from "react"
import { VisualizerLayout } from "../../../components/visualizer-layout"
import { Button } from "../../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { Badge } from "../../../components/ui/badge"
import { Slider } from "../../../components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select"
import { Shuffle, BarChart3, TrendingUp, Clock } from "lucide-react"

interface SortElement {
  value: number
  id: number
  isComparing?: boolean
  isSwapping?: boolean
  isSorted?: boolean
  isPivot?: boolean
  isSelected?: boolean
}

interface SortStep {
  array: SortElement[]
  description: string
  comparisons: number
  swaps: number
  comparing?: number[]
  swapping?: number[]
  pivot?: number
}

type SortingAlgorithm = "bubble" | "selection" | "insertion" | "merge" | "quick" | "heap"

const algorithmInfo = {
  bubble: {
    name: "Bubble Sort",
    timeComplexity: "O(n²)",
    spaceComplexity: "O(1)",
    description:
      "Repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order.",
  },
  selection: {
    name: "Selection Sort",
    timeComplexity: "O(n²)",
    spaceComplexity: "O(1)",
    description: "Finds the minimum element and places it at the beginning, then repeats for the remaining elements.",
  },
  insertion: {
    name: "Insertion Sort",
    timeComplexity: "O(n²)",
    spaceComplexity: "O(1)",
    description:
      "Builds the final sorted array one item at a time by inserting each element into its correct position.",
  },
  merge: {
    name: "Merge Sort",
    timeComplexity: "O(n log n)",
    spaceComplexity: "O(n)",
    description: "Divides the array into halves, sorts them separately, then merges them back together.",
  },
  quick: {
    name: "Quick Sort",
    timeComplexity: "O(n log n)",
    spaceComplexity: "O(log n)",
    description: "Picks a pivot element and partitions the array around it, then recursively sorts the partitions.",
  },
  heap: {
    name: "Heap Sort",
    timeComplexity: "O(n log n)",
    spaceComplexity: "O(1)",
    description: "Builds a max heap from the array, then repeatedly extracts the maximum element.",
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

  const applications = [
    {
      title: "Database Query Optimization",
      description: "Sorting algorithms optimize database queries and indexing for faster data retrieval",
      examples: ["SQL ORDER BY clauses", "Index creation", "Query plan optimization"],
    },
    {
      title: "Search Engine Ranking",
      description: "Search engines use sorting to rank web pages and search results by relevance",
      examples: ["Google PageRank", "Search result ordering", "Content recommendation"],
    },
    {
      title: "Data Analysis & Visualization",
      description: "Sorting enables efficient data analysis and meaningful visualizations",
      examples: ["Statistical analysis", "Chart generation", "Report creation"],
    },
    {
      title: "Operating System Scheduling",
      description: "OS uses sorting for process scheduling and resource allocation",
      examples: ["CPU scheduling algorithms", "Memory management", "File system organization"],
    },
  ]

  const generateRandomArray = useCallback(() => {
    const size = arraySize[0]
    const newArray: SortElement[] = []
    for (let i = 0; i < size; i++) {
      newArray.push({
        value: Math.floor(Math.random() * 300) + 10,
        id: i,
      })
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

  useEffect(() => {
    generateRandomArray()
  }, [generateRandomArray])

  const bubbleSort = (arr: SortElement[]): SortStep[] => {
    const steps: SortStep[] = []
    const array = [...arr]
    let comparisons = 0
    let swaps = 0

    for (let i = 0; i < array.length - 1; i++) {
      for (let j = 0; j < array.length - i - 1; j++) {
        comparisons++
        steps.push({
          array: [...array],
          description: `Comparing elements at positions ${j} and ${j + 1}`,
          comparisons,
          swaps,
          comparing: [j, j + 1],
        })

        if (array[j].value > array[j + 1].value) {
          ;[array[j], array[j + 1]] = [array[j + 1], array[j]]
          swaps++
          steps.push({
            array: [...array],
            description: `Swapped elements at positions ${j} and ${j + 1}`,
            comparisons,
            swaps,
            swapping: [j, j + 1],
          })
        }
      }
      array[array.length - 1 - i].isSorted = true
      steps.push({
        array: [...array],
        description: `Element at position ${array.length - 1 - i} is now in its final position`,
        comparisons,
        swaps,
      })
    }
    array[0].isSorted = true
    steps.push({
      array: [...array],
      description: "Sorting complete!",
      comparisons,
      swaps,
    })

    return steps
  }

  const selectionSort = (arr: SortElement[]): SortStep[] => {
    const steps: SortStep[] = []
    const array = [...arr]
    let comparisons = 0
    let swaps = 0

    for (let i = 0; i < array.length - 1; i++) {
      let minIndex = i
      steps.push({
        array: [...array],
        description: `Finding minimum element from position ${i} onwards`,
        comparisons,
        swaps,
        isSelected: true,
      })

      for (let j = i + 1; j < array.length; j++) {
        comparisons++
        steps.push({
          array: [...array],
          description: `Comparing element at position ${j} with current minimum`,
          comparisons,
          swaps,
          comparing: [minIndex, j],
        })

        if (array[j].value < array[minIndex].value) {
          minIndex = j
        }
      }

      if (minIndex !== i) {
        ;[array[i], array[minIndex]] = [array[minIndex], array[i]]
        swaps++
        steps.push({
          array: [...array],
          description: `Swapped minimum element to position ${i}`,
          comparisons,
          swaps,
          swapping: [i, minIndex],
        })
      }

      array[i].isSorted = true
      steps.push({
        array: [...array],
        description: `Element at position ${i} is now in its final position`,
        comparisons,
        swaps,
      })
    }

    array[array.length - 1].isSorted = true
    steps.push({
      array: [...array],
      description: "Sorting complete!",
      comparisons,
      swaps,
    })

    return steps
  }

  const insertionSort = (arr: SortElement[]): SortStep[] => {
    const steps: SortStep[] = []
    const array = [...arr]
    let comparisons = 0
    let swaps = 0

    array[0].isSorted = true
    steps.push({
      array: [...array],
      description: "First element is considered sorted",
      comparisons,
      swaps,
    })

    for (let i = 1; i < array.length; i++) {
      const key = array[i]
      let j = i - 1

      steps.push({
        array: [...array],
        description: `Inserting element ${key.value} into sorted portion`,
        comparisons,
        swaps,
        isSelected: true,
      })

      while (j >= 0 && array[j].value > key.value) {
        comparisons++
        steps.push({
          array: [...array],
          description: `Comparing ${key.value} with ${array[j].value}`,
          comparisons,
          swaps,
          comparing: [j, i],
        })

        array[j + 1] = array[j]
        swaps++
        j--

        steps.push({
          array: [...array],
          description: `Shifted element to the right`,
          comparisons,
          swaps,
        })
      }

      array[j + 1] = key
      steps.push({
        array: [...array],
        description: `Inserted ${key.value} at position ${j + 1}`,
        comparisons,
        swaps,
      })

      // Mark sorted portion
      for (let k = 0; k <= i; k++) {
        array[k].isSorted = true
      }
    }

    steps.push({
      array: [...array],
      description: "Sorting complete!",
      comparisons,
      swaps,
    })

    return steps
  }

  const startSorting = async () => {
    setIsSorting(true)
    setCurrentStep(0)
    let steps: SortStep[] = []

    switch (algorithm) {
      case "bubble":
        steps = bubbleSort(originalArray)
        break
      case "selection":
        steps = selectionSort(originalArray)
        break
      case "insertion":
        steps = insertionSort(originalArray)
        break
      default:
        steps = bubbleSort(originalArray)
    }

    setSortSteps(steps)
    setComparisons(steps[steps.length - 1]?.comparisons || 0)
    setSwaps(steps[steps.length - 1]?.swaps || 0)
  }

  const stepForward = () => {
    if (currentStep < sortSteps.length - 1) {
      const nextStep = currentStep + 1
      setCurrentStep(nextStep)
      setArray(sortSteps[nextStep].array)
    }
  }

  const stepBack = () => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1
      setCurrentStep(prevStep)
      setArray(sortSteps[prevStep].array)
    }
  }

  const play = () => {
    if (sortSteps.length === 0) {
      startSorting()
    }
    setIsPlaying(true)
  }

  const pause = () => {
    setIsPlaying(false)
  }

  const reset = () => {
    setArray([...originalArray])
    setSortSteps([])
    setCurrentStep(0)
    setComparisons(0)
    setSwaps(0)
    setIsSorting(false)
    setIsPlaying(false)
  }

  useEffect(() => {
    if (isPlaying && currentStep < sortSteps.length - 1) {
      const timer = setTimeout(() => {
        stepForward()
      }, 1100 - speed[0])
      return () => clearTimeout(timer)
    } else if (currentStep >= sortSteps.length - 1) {
      setIsPlaying(false)
    }
  }, [isPlaying, currentStep, sortSteps.length, speed])

  const currentAlgorithm = algorithmInfo[algorithm]

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
      complexity={{
        time: currentAlgorithm.timeComplexity,
        space: currentAlgorithm.spaceComplexity,
      }}
      applications={applications}
    >
      <div className="w-full space-y-6">
        {/* Array Visualization */}
        <div className="flex items-end justify-center gap-1 min-h-[300px] p-4 bg-muted/10 rounded-lg">
          {array.map((element, index) => {
            const currentStepData = sortSteps[currentStep]
            const isComparing = currentStepData?.comparing?.includes(index)
            const isSwapping = currentStepData?.swapping?.includes(index)
            const isPivot = currentStepData?.pivot === index

            return (
              <div
                key={element.id}
                className={`
                  relative transition-all duration-300 rounded-t-sm
                  ${
                    element.isSorted
                      ? "bg-green-500"
                      : isPivot
                        ? "bg-purple-500"
                        : isSwapping
                          ? "bg-red-500"
                          : isComparing
                            ? "bg-yellow-500"
                            : "bg-accent"
                  }
                `}
                style={{
                  height: `${element.value}px`,
                  width: `${Math.max(800 / array.length - 2, 8)}px`,
                }}
              >
                <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-muted-foreground">
                  {element.value}
                </div>
              </div>
            )
          })}
        </div>

        {/* Controls */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Algorithm</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={algorithm} onValueChange={(value: SortingAlgorithm) => setAlgorithm(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bubble">Bubble Sort</SelectItem>
                  <SelectItem value="selection">Selection Sort</SelectItem>
                  <SelectItem value="insertion">Insertion Sort</SelectItem>
                  <SelectItem value="merge" disabled>
                    Merge Sort (Soon)
                  </SelectItem>
                  <SelectItem value="quick" disabled>
                    Quick Sort (Soon)
                  </SelectItem>
                  <SelectItem value="heap" disabled>
                    Heap Sort (Soon)
                  </SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Array Size</CardTitle>
            </CardHeader>
            <CardContent>
              <Slider
                value={arraySize}
                onValueChange={setArraySize}
                max={50}
                min={5}
                step={1}
                className="mb-2"
                disabled={isSorting}
              />
              <div className="text-sm text-muted-foreground text-center">{arraySize[0]} elements</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Speed</CardTitle>
            </CardHeader>
            <CardContent>
              <Slider value={speed} onValueChange={setSpeed} max={1000} min={100} step={100} className="mb-2" />
              <div className="text-sm text-muted-foreground text-center">
                {speed[0] < 300 ? "Fast" : speed[0] < 700 ? "Medium" : "Slow"}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Generate</CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={generateRandomArray} disabled={isSorting} className="w-full">
                <Shuffle className="h-4 w-4 mr-2" />
                New Array
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Algorithm Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{currentAlgorithm.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">{currentAlgorithm.description}</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Clock className="h-4 w-4 text-accent" />
                  <span className="text-sm font-medium">Time</span>
                </div>
                <Badge variant="outline" className="font-mono">
                  {currentAlgorithm.timeComplexity}
                </Badge>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <BarChart3 className="h-4 w-4 text-accent" />
                  <span className="text-sm font-medium">Space</span>
                </div>
                <Badge variant="outline" className="font-mono">
                  {currentAlgorithm.spaceComplexity}
                </Badge>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <TrendingUp className="h-4 w-4 text-accent" />
                  <span className="text-sm font-medium">Comparisons</span>
                </div>
                <div className="text-lg font-bold text-accent">
                  {sortSteps[currentStep]?.comparisons || comparisons}
                </div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Shuffle className="h-4 w-4 text-accent" />
                  <span className="text-sm font-medium">Swaps</span>
                </div>
                <div className="text-lg font-bold text-accent">{sortSteps[currentStep]?.swaps || swaps}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Step Description */}
        {sortSteps.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Current Step</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm p-3 bg-accent/10 rounded-lg border border-accent/20">
                {sortSteps[currentStep]?.description || "Ready to start sorting"}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Legend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Legend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-accent rounded"></div>
                <span>Unsorted</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                <span>Comparing</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span>Swapping</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span>Sorted</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-purple-500 rounded"></div>
                <span>Pivot</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </VisualizerLayout>
  )
}
