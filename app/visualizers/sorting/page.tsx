"use client"

import { useState, useEffect, useCallback } from "react"
import { VisualizerLayout } from "../../../components/visualizer-layout"
import { Button } from "../../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { Badge } from "../../../components/ui/badge"
import { Slider } from "../../../components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select"
import { Shuffle, BarChart3, TrendingUp, Clock, Code } from "lucide-react"

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
  codeLine?: number
}

type SortingAlgorithm = "bubble" | "selection" | "insertion" | "merge" | "quick" | "heap"

// Algorithm-specific color schemes
const algorithmColors = {
  bubble: {
    unsorted: "bg-blue-400",
    comparing: "bg-yellow-400",
    swapping: "bg-red-400",
    sorted: "bg-green-500",
    pivot: "bg-purple-500",
    selected: "bg-indigo-400"
  },
  selection: {
    unsorted: "bg-amber-400",
    comparing: "bg-cyan-400",
    swapping: "bg-red-500",
    sorted: "bg-emerald-500",
    pivot: "bg-purple-500",
    selected: "bg-violet-400"
  },
  insertion: {
    unsorted: "bg-rose-400",
    comparing: "bg-lime-400",
    swapping: "bg-orange-500",
    sorted: "bg-teal-500",
    pivot: "bg-purple-500",
    selected: "bg-fuchsia-400"
  },
  merge: {
    unsorted: "bg-accent",
    comparing: "bg-yellow-500",
    swapping: "bg-red-500",
    sorted: "bg-green-500",
    pivot: "bg-purple-500",
    selected: "bg-blue-500"
  },
  quick: {
    unsorted: "bg-accent",
    comparing: "bg-yellow-500",
    swapping: "bg-red-500",
    sorted: "bg-green-500",
    pivot: "bg-purple-500",
    selected: "bg-blue-500"
  },
  heap: {
    unsorted: "bg-accent",
    comparing: "bg-yellow-500",
    swapping: "bg-red-500",
    sorted: "bg-green-500",
    pivot: "bg-purple-500",
    selected: "bg-blue-500"
  }
}

const pseudocodeDefinitions = {
  bubble: [
    "for i = 0 to n-2",
    "  for j = 0 to n-i-2",
    "    if array[j] > array[j+1]",
    "      swap array[j] and array[j+1]",
    "  mark array[n-i-1] as sorted"
  ],
  selection: [
    "for i = 0 to n-2",
    "  minIndex = i",
    "  for j = i+1 to n-1",
    "    if array[j] < array[minIndex]",
    "      minIndex = j",
    "  if minIndex != i",
    "    swap array[i] and array[minIndex]",
    "  mark array[i] as sorted"
  ],
  insertion: [
    "for i = 1 to n-1",
    "  key = array[i]",
    "  j = i - 1",
    "  while j >= 0 and array[j] > key",
    "    array[j+1] = array[j]",
    "    j = j - 1",
    "  array[j+1] = key",
    "  mark array[0..i] as sorted"
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
    "  copy remaining elements"
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
    "  return i+1"
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
    "    heapify(array, n, largest)"
  ]
}

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
          codeLine: 2
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
            codeLine: 3
          })
        }
      }
      array[array.length - 1 - i].isSorted = true
      steps.push({
        array: [...array],
        description: `Element at position ${array.length - 1 - i} is now in its final position`,
        comparisons,
        swaps,
        codeLine: 4
      })
    }
    array[0].isSorted = true
    steps.push({
      array: [...array],
      description: "Sorting complete!",
      comparisons,
      swaps,
      codeLine: -1
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
        codeLine: 1
      })

      for (let j = i + 1; j < array.length; j++) {
        comparisons++
        steps.push({
          array: [...array],
          description: `Comparing element at position ${j} with current minimum`,
          comparisons,
          swaps,
          comparing: [minIndex, j],
          codeLine: 3
        })

        if (array[j].value < array[minIndex].value) {
          minIndex = j
          steps.push({
            array: [...array],
            description: `New minimum found at position ${j}`,
            comparisons,
            swaps,
            comparing: [minIndex],
            codeLine: 4
          })
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
          codeLine: 6
        })
      }

      array[i].isSorted = true
      steps.push({
        array: [...array],
        description: `Element at position ${i} is now in its final position`,
        comparisons,
        swaps,
        codeLine: 7
      })
    }

    array[array.length - 1].isSorted = true
    steps.push({
      array: [...array],
      description: "Sorting complete!",
      comparisons,
      swaps,
      codeLine: -1
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
      codeLine: -1
    })

    for (let i = 1; i < array.length; i++) {
      const key = array[i]
      let j = i - 1

      steps.push({
        array: [...array],
        description: `Inserting element ${key.value} into sorted portion`,
        comparisons,
        swaps,
        codeLine: 1
      })

      while (j >= 0 && array[j].value > key.value) {
        comparisons++
        steps.push({
          array: [...array],
          description: `Comparing ${key.value} with ${array[j].value}`,
          comparisons,
          swaps,
          comparing: [j, i],
          codeLine: 3
        })

        array[j + 1] = array[j]
        swaps++
        j--

        steps.push({
          array: [...array],
          description: `Shifted element to the right`,
          comparisons,
          swaps,
          codeLine: 4
        })
      }

      array[j + 1] = key
      steps.push({
        array: [...array],
        description: `Inserted ${key.value} at position ${j + 1}`,
        comparisons,
        swaps,
        codeLine: 6
      })

      // Mark sorted portion
      for (let k = 0; k <= i; k++) {
        array[k].isSorted = true
      }
      steps.push({
        array: [...array],
        description: `Marked positions 0 to ${i} as sorted`,
        comparisons,
        swaps,
        codeLine: 7
      })
    }

    steps.push({
      array: [...array],
      description: "Sorting complete!",
      comparisons,
      swaps,
      codeLine: -1
    })

    return steps
  }

  const mergeSort = (arr: SortElement[]): SortStep[] => {
    const steps: SortStep[] = []
    const array = [...arr]
    let comparisons = 0
    let swaps = 0
    
    const createCopy = (arr: SortElement[]): SortElement[] => {
      return arr.map(el => ({...el}))
    }
    
    const mergeSortHelper = (
      arr: SortElement[], 
      start: number, 
      end: number,
      originalIndices: number[],
      depth: number = 0
    ): SortElement[] => {
      if (start >= end) return [arr[start]]
      
      const mid = Math.floor((start + end) / 2)
      
      const currentArray = createCopy(array)
      currentArray.forEach((el, idx) => {
        if (idx >= start && idx <= end) {
          el.isSelected = true
        }
      })
      steps.push({
        array: currentArray,
        description: `Dividing subarray from index ${start} to ${end}`,
        comparisons,
        swaps,
        codeLine: depth === 0 ? 2 : 3
      })
      
      const leftIndices = originalIndices.slice(0, mid - start + 1)
      const rightIndices = originalIndices.slice(mid - start + 1)
      
      const left = mergeSortHelper(arr, start, mid, leftIndices, depth + 1)
      const right = mergeSortHelper(arr, mid + 1, end, rightIndices, depth + 1)
      
      const merged: SortElement[] = []
      let i = 0, j = 0
      
      const tempArray = createCopy(array)
      for (let k = start; k <= end; k++) {
        tempArray[k].isSelected = true
      }
      steps.push({
        array: tempArray,
        description: `Merging subarrays [${start}-${mid}] and [${mid + 1}-${end}]`,
        comparisons,
        swaps,
        codeLine: 5
      })
      
      while (i < left.length && j < right.length) {
        comparisons++
        const currentStepArray = createCopy(array)
        const leftIndex = originalIndices[i]
        const rightIndex = originalIndices[left.length + j]
        currentStepArray[leftIndex].isComparing = true
        currentStepArray[rightIndex].isComparing = true
        
        steps.push({
          array: currentStepArray,
          description: `Comparing ${left[i].value} and ${right[j].value}`,
          comparisons,
          swaps,
          comparing: [leftIndex, rightIndex],
          codeLine: 10
        })
        
        if (left[i].value <= right[j].value) {
          merged.push(left[i])
          i++
          steps.push({
            array: createCopy(array),
            description: `Taking ${left[i-1].value} from left array`,
            comparisons,
            swaps,
            codeLine: 11
          })
        } else {
          merged.push(right[j])
          j++
          steps.push({
            array: createCopy(array),
            description: `Taking ${right[j-1].value} from right array`,
            comparisons,
            swaps,
            codeLine: 14
          })
        }
      }
      
      while (i < left.length) {
        merged.push(left[i])
        i++
      }
      
      while (j < right.length) {
        merged.push(right[j])
        j++
      }
      
      for (let k = 0; k < merged.length; k++) {
        const originalIndex = originalIndices[k]
        array[originalIndex] = {...merged[k], id: originalIndex}
      }
      
      const mergedArray = createCopy(array)
      for (let k = start; k <= end; k++) {
        mergedArray[k].isSorted = true
      }
      steps.push({
        array: mergedArray,
        description: `Merged subarray from index ${start} to ${end}`,
        comparisons,
        swaps,
        codeLine: 16
      })
      
      return merged
    }
    
    const indices = arr.map((_, i) => i)
    mergeSortHelper(arr, 0, arr.length - 1, indices)
    
    const finalArray = createCopy(array)
    finalArray.forEach(el => el.isSorted = true)
    steps.push({
      array: finalArray,
      description: "Sorting complete!",
      comparisons,
      swaps,
      codeLine: -1
    })
    
    return steps
  }

  const quickSort = (arr: SortElement[]): SortStep[] => {
    const steps: SortStep[] = []
    const array = [...arr]
    let comparisons = 0
    let swaps = 0
    
    const quickSortHelper = (low: number, high: number, depth: number = 0) => {
      if (low < high) {
        const pivotIndex = partition(low, high)
        
        array[pivotIndex].isSorted = true
        steps.push({
          array: [...array],
          description: `Pivot ${array[pivotIndex].value} is now in its final position`,
          comparisons,
          swaps,
          pivot: pivotIndex,
          codeLine: depth === 0 ? 2 : 2
        })
        
        quickSortHelper(low, pivotIndex - 1, depth + 1)
        quickSortHelper(pivotIndex + 1, high, depth + 1)
      }
    }
    
    const partition = (low: number, high: number): number => {
      const pivot = array[high]
      let i = low - 1
      
      const pivotStep = [...array]
      pivotStep[high].isPivot = true
      steps.push({
        array: pivotStep,
        description: `Selecting pivot: ${pivot.value} at index ${high}`,
        comparisons,
        swaps,
        pivot: high,
        codeLine: 7
      })
      
      for (let j = low; j < high; j++) {
        comparisons++
        const compareStep = [...array]
        compareStep[j].isComparing = true
        compareStep[high].isPivot = true
        
        steps.push({
          array: compareStep,
          description: `Comparing ${array[j].value} with pivot ${pivot.value}`,
          comparisons,
          swaps,
          comparing: [j],
          pivot: high,
          codeLine: 9
        })
        
        if (array[j].value <= pivot.value) {
          i++
          if (i !== j) {
            [array[i], array[j]] = [array[j], array[i]]
            swaps++
            const swapStep = [...array]
            swapStep[i].isSwapping = true
            swapStep[j].isSwapping = true
            swapStep[high].isPivot = true
            
            steps.push({
              array: swapStep,
              description: `Swapped ${array[i].value} and ${array[j].value}`,
              comparisons,
              swaps,
              swapping: [i, j],
              pivot: high,
              codeLine: 12
            })
          }
        }
      }
      
      [array[i + 1], array[high]] = [array[high], array[i + 1]]
      swaps++
      const finalSwapStep = [...array]
      finalSwapStep[i + 1].isSwapping = true
      finalSwapStep[high].isSwapping = true
      
      steps.push({
        array: finalSwapStep,
        description: `Placed pivot ${pivot.value} at its final position ${i + 1}`,
        comparisons,
        swaps,
        swapping: [i + 1, high],
        codeLine: 13
      })
      
      return i + 1
    }
    
    quickSortHelper(0, array.length - 1)
    
    array.forEach(el => el.isSorted = true)
    steps.push({
      array: [...array],
      description: "Sorting complete!",
      comparisons,
      swaps,
      codeLine: -1
    })
    
    return steps
  }

  const heapSort = (arr: SortElement[]): SortStep[] => {
    const steps: SortStep[] = []
    const array = [...arr]
    let comparisons = 0
    let swaps = 0
    
    const heapify = (n: number, i: number) => {
      let largest = i
      const left = 2 * i + 1
      const right = 2 * i + 2
      
      if (left < n) {
        comparisons++
        const compareStep = [...array]
        compareStep[i].isComparing = true
        compareStep[left].isComparing = true
        
        steps.push({
          array: compareStep,
          description: `Comparing parent ${array[i].value} with left child ${array[left].value}`,
          comparisons,
          swaps,
          comparing: [i, left],
          codeLine: 12
        })
        
        if (array[left].value > array[largest].value) {
          largest = left
          steps.push({
            array: [...array],
            description: `Left child is larger`,
            comparisons,
            swaps,
            codeLine: 13
          })
        }
      }
      
      if (right < n) {
        comparisons++
        const compareStep = [...array]
        compareStep[largest].isComparing = true
        compareStep[right].isComparing = true
        
        steps.push({
          array: compareStep,
          description: `Comparing ${array[largest].value} with right child ${array[right].value}`,
          comparisons,
          swaps,
          comparing: [largest, right],
          codeLine: 14
        })
        
        if (array[right].value > array[largest].value) {
          largest = right
          steps.push({
            array: [...array],
            description: `Right child is larger`,
            comparisons,
            swaps,
            codeLine: 15
          })
        }
      }
      
      if (largest !== i) {
        [array[i], array[largest]] = [array[largest], array[i]]
        swaps++
        const swapStep = [...array]
        swapStep[i].isSwapping = true
        swapStep[largest].isSwapping = true
        
        steps.push({
          array: swapStep,
          description: `Swapped ${array[i].value} and ${array[largest].value} to maintain heap property`,
          comparisons,
          swaps,
          swapping: [i, largest],
          codeLine: 17
        })
        
        heapify(n, largest)
      }
    }
    
    const n = array.length
    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
      const heapStep = [...array]
      heapStep[i].isSelected = true
      steps.push({
        array: heapStep,
        description: `Building heap: processing node ${array[i].value} at index ${i}`,
        comparisons,
        swaps,
        codeLine: 3
      })
      
      heapify(n, i)
    }
    
    for (let i = n - 1; i > 0; i--) {
      [array[0], array[i]] = [array[i], array[0]]
      swaps++
      const extractStep = [...array]
      extractStep[0].isSwapping = true
      extractStep[i].isSwapping = true
      extractStep[i].isSorted = true
      
      steps.push({
        array: extractStep,
        description: `Extracted max element ${array[i].value} to position ${i}`,
        comparisons,
        swaps,
        swapping: [0, i],
        codeLine: 5
      })
      
      heapify(i, 0)
    }
    
    array[0].isSorted = true
    steps.push({
      array: [...array],
      description: "Sorting complete!",
      comparisons,
      swaps,
      codeLine: -1
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
      case "merge":
        steps = mergeSort(originalArray)
        break
      case "quick":
        steps = quickSort(originalArray)
        break
      case "heap":
        steps = heapSort(originalArray)
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
  const currentPseudocode = pseudocodeDefinitions[algorithm]
  const currentCodeLine = sortSteps[currentStep]?.codeLine ?? -1
  const colors = algorithmColors[algorithm]

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
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Array Visualization */}
          <div>
            <div className="flex items-end justify-center gap-1 min-h-[300px] p-4 bg-muted/10 rounded-lg">
              {array.map((element, index) => {
                const currentStepData = sortSteps[currentStep]
                const isComparing = currentStepData?.comparing?.includes(index)
                const isSwapping = currentStepData?.swapping?.includes(index)
                const isPivot = currentStepData?.pivot === index
                const isSelected = element.isSelected

                return (
                  <div
                    key={element.id}
                    className={`
                      relative transition-all duration-300 rounded-t-sm
                      ${
                        element.isSorted
                          ? colors.sorted
                          : isPivot
                            ? colors.pivot
                            : isSwapping
                              ? colors.swapping
                              : isComparing
                                ? colors.comparing
                                : isSelected
                                  ? colors.selected
                                  : colors.unsorted
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
                {currentPseudocode.map((line, index) => (
                  <div
                    key={index}
                    className={`
                      py-1 px-2 rounded
                      ${currentCodeLine === index 
                        ? "bg-primary/20 border-l-4 border-primary text-primary-foreground" 
                        : "text-muted-foreground"
                      }
                    `}
                  >
                    <span className="text-xs text-muted-foreground/70 mr-3">
                      {index + 1}
                    </span>
                    {line || "\u00A0"}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
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
                  <SelectItem value="merge">Merge Sort</SelectItem>
                  <SelectItem value="quick">Quick Sort</SelectItem>
                  <SelectItem value="heap">Heap Sort</SelectItem>
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
                {speed[0] < 300 ? "Slow" : speed[0] < 700 ? "Medium" : "Fast"}
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
                <div className={`w-4 h-4 ${colors.unsorted} rounded`}></div>
                <span>Unsorted</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-4 h-4 ${colors.comparing} rounded`}></div>
                <span>Comparing</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-4 h-4 ${colors.swapping} rounded`}></div>
                <span>Swapping</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-4 h-4 ${colors.sorted} rounded`}></div>
                <span>Sorted</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-4 h-4 ${colors.pivot} rounded`}></div>
                <span>Pivot</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-4 h-4 ${colors.selected} rounded`}></div>
                <span>Selected</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </VisualizerLayout>
  )
}