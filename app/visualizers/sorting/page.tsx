"use client"

import { useState, useEffect, useCallback } from "react"
import { VisualizerLayout } from "../../../components/visualizer-layout"
import { Button } from "../../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { Badge } from "../../../components/ui/badge"
import { Slider } from "../../../components/ui/slider"
import { Shuffle, BarChart3, TrendingUp, Clock, Code, Layers } from "lucide-react"

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

const algorithmColors = {
  bubble: { unsorted: "bg-blue-400", comparing: "bg-yellow-400", swapping: "bg-red-400", sorted: "bg-green-500", pivot: "bg-purple-500", selected: "bg-indigo-400" },
  selection: { unsorted: "bg-amber-400", comparing: "bg-cyan-400", swapping: "bg-red-500", sorted: "bg-emerald-500", pivot: "bg-purple-500", selected: "bg-violet-400" },
  insertion: { unsorted: "bg-rose-400", comparing: "bg-lime-400", swapping: "bg-orange-500", sorted: "bg-teal-500", pivot: "bg-purple-500", selected: "bg-fuchsia-400" },
  merge: { unsorted: "bg-accent", comparing: "bg-yellow-500", swapping: "bg-red-500", sorted: "bg-green-500", pivot: "bg-purple-500", selected: "bg-blue-500" },
  quick: { unsorted: "bg-accent", comparing: "bg-yellow-500", swapping: "bg-red-500", sorted: "bg-green-500", pivot: "bg-purple-500", selected: "bg-blue-500" },
  heap: { unsorted: "bg-accent", comparing: "bg-yellow-500", swapping: "bg-red-500", sorted: "bg-green-500", pivot: "bg-purple-500", selected: "bg-blue-500" },
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

  // ---------- Sorting Implementations (same as your last version) ----------
  const bubbleSort = (arr: SortElement[]): SortStep[] => {
    const steps: SortStep[] = []
    const array = [...arr]
    let comparisons = 0, swaps = 0
    for (let i = 0; i < array.length - 1; i++) {
      for (let j = 0; j < array.length - i - 1; j++) {
        comparisons++
        steps.push({ array: [...array], description: `Comparing elements at positions ${j} and ${j + 1}`, comparisons, swaps, comparing: [j, j + 1], codeLine: 2 })
        if (array[j].value > array[j + 1].value) {
          ;[array[j], array[j + 1]] = [array[j + 1], array[j]]
          swaps++
          steps.push({ array: [...array], description: `Swapped elements at positions ${j} and ${j + 1}`, comparisons, swaps, swapping: [j, j + 1], codeLine: 3 })
        }
      }
      array[array.length - 1 - i].isSorted = true
      steps.push({ array: [...array], description: `Element at position ${array.length - 1 - i} is now in its final position`, comparisons, swaps, codeLine: 4 })
    }
    array[0].isSorted = true
    steps.push({ array: [...array], description: "Sorting complete!", comparisons, swaps, codeLine: -1 })
    return steps
  }

  const selectionSort = (arr: SortElement[]): SortStep[] => {
    const steps: SortStep[] = []
    const array = [...arr]
    let comparisons = 0, swaps = 0
    for (let i = 0; i < array.length - 1; i++) {
      let minIndex = i
      steps.push({ array: [...array], description: `Finding minimum element from position ${i} onwards`, comparisons, swaps, codeLine: 1 })
      for (let j = i + 1; j < array.length; j++) {
        comparisons++
        steps.push({ array: [...array], description: `Comparing element at position ${j} with current minimum`, comparisons, swaps, comparing: [minIndex, j], codeLine: 3 })
        if (array[j].value < array[minIndex].value) {
          minIndex = j
          steps.push({ array: [...array], description: `New minimum found at position ${j}`, comparisons, swaps, comparing: [minIndex], codeLine: 4 })
        }
      }
      if (minIndex !== i) {
        ;[array[i], array[minIndex]] = [array[minIndex], array[i]]
        swaps++
        steps.push({ array: [...array], description: `Swapped minimum element to position ${i}`, comparisons, swaps, swapping: [i, minIndex], codeLine: 6 })
      }
      array[i].isSorted = true
      steps.push({ array: [...array], description: `Element at position ${i} is now in its final position`, comparisons, swaps, codeLine: 7 })
    }
    array[array.length - 1].isSorted = true
    steps.push({ array: [...array], description: "Sorting complete!", comparisons, swaps, codeLine: -1 })
    return steps
  }

  const insertionSort = (arr: SortElement[]): SortStep[] => {
    const steps: SortStep[] = []
    const array = [...arr]
    let comparisons = 0, swaps = 0
    array[0].isSorted = true
    steps.push({ array: [...array], description: "First element is considered sorted", comparisons, swaps, codeLine: -1 })
    for (let i = 1; i < array.length; i++) {
      const key = array[i]
      let j = i - 1
      steps.push({ array: [...array], description: `Inserting element ${key.value} into sorted portion`, comparisons, swaps, codeLine: 1 })
      while (j >= 0 && array[j].value > key.value) {
        comparisons++
        steps.push({ array: [...array], description: `Comparing ${key.value} with ${array[j].value}`, comparisons, swaps, comparing: [j, i], codeLine: 3 })
        array[j + 1] = array[j]; swaps++; j--
        steps.push({ array: [...array], description: `Shifted element to the right`, comparisons, swaps, codeLine: 4 })
      }
      array[j + 1] = key
      steps.push({ array: [...array], description: `Inserted ${key.value} at position ${j + 1}`, comparisons, swaps, codeLine: 6 })
      for (let k = 0; k <= i; k++) array[k].isSorted = true
      steps.push({ array: [...array], description: `Marked positions 0 to ${i} as sorted`, comparisons, swaps, codeLine: 7 })
    }
    steps.push({ array: [...array], description: "Sorting complete!", comparisons, swaps, codeLine: -1 })
    return steps
  }

  const mergeSort = (arr: SortElement[]): SortStep[] => {
    const steps: SortStep[] = []
    const array = [...arr]
    let comparisons = 0, swaps = 0
    const copy = (a: SortElement[]) => a.map(el => ({ ...el }))
    const helper = (arrRef: SortElement[], start: number, end: number, idxs: number[], depth = 0): SortElement[] => {
      if (start >= end) return [arrRef[start]]
      const mid = Math.floor((start + end) / 2)
      const highlight = copy(array); highlight.forEach((el, i) => { if (i >= start && i <= end) el.isSelected = true })
      steps.push({ array: highlight, description: `Dividing subarray from index ${start} to ${end}`, comparisons, swaps, codeLine: depth === 0 ? 2 : 3 })
      const leftIdx = idxs.slice(0, mid - start + 1), rightIdx = idxs.slice(mid - start + 1)
      const left = helper(arrRef, start, mid, leftIdx, depth + 1)
      const right = helper(arrRef, mid + 1, end, rightIdx, depth + 1)
      const merged: SortElement[] = []; let i = 0, j = 0
      const toMerge = copy(array); for (let k = start; k <= end; k++) toMerge[k].isSelected = true
      steps.push({ array: toMerge, description: `Merging subarrays [${start}-${mid}] and [${mid + 1}-${end}]`, comparisons, swaps, codeLine: 5 })
      while (i < left.length && j < right.length) {
        comparisons++
        const cmpArr = copy(array); const li = idxs[i]; const rj = idxs[left.length + j]
        cmpArr[li].isComparing = true; cmpArr[rj].isComparing = true
        steps.push({ array: cmpArr, description: `Comparing ${left[i].value} and ${right[j].value}`, comparisons, swaps, comparing: [li, rj], codeLine: 10 })
        if (left[i].value <= right[j].value) { merged.push(left[i]); i++; steps.push({ array: copy(array), description: `Taking ${left[i - 1].value} from left array`, comparisons, swaps, codeLine: 11 }) }
        else { merged.push(right[j]); j++; steps.push({ array: copy(array), description: `Taking ${right[j - 1].value} from right array`, comparisons, swaps, codeLine: 14 }) }
      }
      while (i < left.length) { merged.push(left[i++]) }
      while (j < right.length) { merged.push(right[j++]) }
      for (let k = 0; k < merged.length; k++) { const oi = idxs[k]; array[oi] = { ...merged[k], id: oi } }
      const mergedArr = copy(array); for (let k = start; k <= end; k++) mergedArr[k].isSorted = true
      steps.push({ array: mergedArr, description: `Merged subarray from index ${start} to ${end}`, comparisons, swaps, codeLine: 16 })
      return merged
    }
    const idxs = arr.map((_, i) => i)
    helper(arr, 0, arr.length - 1, idxs)
    const final = copy(array); final.forEach(e => (e.isSorted = true))
    steps.push({ array: final, description: "Sorting complete!", comparisons, swaps, codeLine: -1 })
    return steps
  }

  const quickSort = (arr: SortElement[]): SortStep[] => {
    const steps: SortStep[] = []
    const array = [...arr]
    let comparisons = 0, swaps = 0
    const qs = (l: number, h: number, d = 0) => {
      if (l < h) {
        const p = part(l, h)
        array[p].isSorted = true
        steps.push({ array: [...array], description: `Pivot ${array[p].value} is now in its final position`, comparisons, swaps, pivot: p, codeLine: 2 })
        qs(l, p - 1, d + 1); qs(p + 1, h, d + 1)
      }
    }
    const part = (l: number, h: number) => {
      const pivot = array[h]; let i = l - 1
      const pv = [...array]; pv[h].isPivot = true
      steps.push({ array: pv, description: `Selecting pivot: ${pivot.value} at index ${h}`, comparisons, swaps, pivot: h, codeLine: 7 })
      for (let j = l; j < h; j++) {
        comparisons++
        const cmp = [...array]; cmp[j].isComparing = true; cmp[h].isPivot = true
        steps.push({ array: cmp, description: `Comparing ${array[j].value} with pivot ${pivot.value}`, comparisons, swaps, comparing: [j], pivot: h, codeLine: 9 })
        if (array[j].value <= pivot.value) {
          i++; if (i !== j) {
            [array[i], array[j]] = [array[j], array[i]]; swaps++
            const sw = [...array]; sw[i].isSwapping = true; sw[j].isSwapping = true; sw[h].isPivot = true
            steps.push({ array: sw, description: `Swapped ${array[i].value} and ${array[j].value}`, comparisons, swaps, swapping: [i, j], pivot: h, codeLine: 12 })
          }
        }
      }
      ;[array[i + 1], array[h]] = [array[h], array[i + 1]]; swaps++
      const fs = [...array]; fs[i + 1].isSwapping = true; fs[h].isSwapping = true
      steps.push({ array: fs, description: `Placed pivot ${pivot.value} at its final position ${i + 1}`, comparisons, swaps, swapping: [i + 1, h], codeLine: 13 })
      return i + 1
    }
    qs(0, array.length - 1)
    array.forEach(e => (e.isSorted = true))
    steps.push({ array: [...array], description: "Sorting complete!", comparisons, swaps, codeLine: -1 })
    return steps
  }

  const heapSort = (arr: SortElement[]): SortStep[] => {
    const steps: SortStep[] = []
    const array = [...arr]
    let comparisons = 0, swaps = 0
    const heapify = (n: number, i: number) => {
      let largest = i, l = 2 * i + 1, r = 2 * i + 2
      if (l < n) {
        comparisons++
        const cmp = [...array]; cmp[i].isComparing = true; cmp[l].isComparing = true
        steps.push({ array: cmp, description: `Comparing parent ${array[i].value} with left child ${array[l].value}`, comparisons, swaps, comparing: [i, l], codeLine: 12 })
        if (array[l].value > array[largest].value) { largest = l; steps.push({ array: [...array], description: `Left child is larger`, comparisons, swaps, codeLine: 13 }) }
      }
      if (r < n) {
        comparisons++
        const cmp2 = [...array]; cmp2[largest].isComparing = true; cmp2[r].isComparing = true
        steps.push({ array: cmp2, description: `Comparing ${array[largest].value} with right child ${array[r].value}`, comparisons, swaps, comparing: [largest, r], codeLine: 14 })
        if (array[r].value > array[largest].value) { largest = r; steps.push({ array: [...array], description: `Right child is larger`, comparisons, swaps, codeLine: 15 }) }
      }
      if (largest !== i) {
        ;[array[i], array[largest]] = [array[largest], array[i]]; swaps++
        const sw = [...array]; sw[i].isSwapping = true; sw[largest].isSwapping = true
        steps.push({ array: sw, description: `Swapped ${array[i].value} and ${array[largest].value} to maintain heap property`, comparisons, swaps, swapping: [i, largest], codeLine: 17 })
        heapify(n, largest)
      }
    }
    const n = array.length
    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
      const step = [...array]; step[i].isSelected = true
      steps.push({ array: step, description: `Building heap: processing node ${array[i].value} at index ${i}`, comparisons, swaps, codeLine: 3 })
      heapify(n, i)
    }
    for (let i = n - 1; i > 0; i--) {
      ;[array[0], array[i]] = [array[i], array[0]]; swaps++
      const ex = [...array]; ex[0].isSwapping = true; ex[i].isSwapping = true; ex[i].isSorted = true
      steps.push({ array: ex, description: `Extracted max element ${array[i].value} to position ${i}`, comparisons, swaps, swapping: [0, i], codeLine: 5 })
      heapify(i, 0)
    }
    array[0].isSorted = true
    steps.push({ array: [...array], description: "Sorting complete!", comparisons, swaps, codeLine: -1 })
    return steps
  }
  // -------------------------------------------------------------------------

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
  const colors = algorithmColors[algorithm]

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
          <CardContent className="text-sm text-black space-y-2">
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
          <CardContent className="text-sm text-black space-y-2">
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

                // Make bars a bit wider by increasing the base width divisor
                const barWidth = Math.max(1200 / array.length - 2, 10)

                return (
                  <div
                    key={element.id}
                    className={`
            relative rounded-t-sm
            ${element.isSorted ? colors.sorted
                        : isPivot ? colors.pivot
                          : isSwapping ? colors.swapping
                            : isComparing ? colors.comparing
                              : isSelected ? colors.selected
                                : colors.unsorted}
          `}
                    style={{
                      height: `${element.value}px`,
                      width: `${barWidth}px`,
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
