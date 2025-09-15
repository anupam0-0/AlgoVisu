export interface AlgorithmStep {
  id: string
  description: string
  currentIndex?: number
  comparedIndices?: number[]
  swappedIndices?: number[]
  highlightedIndices?: number[]
}

export interface SortingResult {
  steps: AlgorithmStep[]
  comparisons: number
  swaps: number
  timeComplexity: string
  spaceComplexity: string
}

// Bubble Sort Algorithm
export function bubbleSort(arr: number[]): SortingResult {
  const steps: AlgorithmStep[] = []
  const sortedArray = [...arr]
  let comparisons = 0
  let swaps = 0

  steps.push({
    id: "start",
    description: "Starting Bubble Sort",
    highlightedIndices: [],
  })

  for (let i = 0; i < sortedArray.length - 1; i++) {
    for (let j = 0; j < sortedArray.length - i - 1; j++) {
      comparisons++
      steps.push({
        id: `compare-${i}-${j}`,
        description: `Comparing elements at positions ${j} and ${j + 1}`,
        comparedIndices: [j, j + 1],
      })

      if (sortedArray[j] > sortedArray[j + 1]) {
        // Swap elements
        ;[sortedArray[j], sortedArray[j + 1]] = [sortedArray[j + 1], sortedArray[j]]
        swaps++
        steps.push({
          id: `swap-${i}-${j}`,
          description: `Swapping elements at positions ${j} and ${j + 1}`,
          swappedIndices: [j, j + 1],
        })
      }
    }
  }

  steps.push({
    id: "complete",
    description: "Bubble Sort completed!",
    highlightedIndices: [],
  })

  return {
    steps,
    comparisons,
    swaps,
    timeComplexity: "O(n²)",
    spaceComplexity: "O(1)",
  }
}

// Quick Sort Algorithm
export function quickSort(arr: number[]): SortingResult {
  const steps: AlgorithmStep[] = []
  const sortedArray = [...arr]
  let comparisons = 0
  let swaps = 0

  function partition(low: number, high: number): number {
    const pivot = sortedArray[high]
    let i = low - 1

    steps.push({
      id: `pivot-${low}-${high}`,
      description: `Choosing pivot: ${pivot} at position ${high}`,
      highlightedIndices: [high],
    })

    for (let j = low; j < high; j++) {
      comparisons++
      steps.push({
        id: `compare-${j}-pivot`,
        description: `Comparing ${sortedArray[j]} with pivot ${pivot}`,
        comparedIndices: [j, high],
      })

      if (sortedArray[j] < pivot) {
        i++
        if (i !== j) {
          ;[sortedArray[i], sortedArray[j]] = [sortedArray[j], sortedArray[i]]
          swaps++
          steps.push({
            id: `swap-${i}-${j}`,
            description: `Swapping elements at positions ${i} and ${j}`,
            swappedIndices: [i, j],
          })
        }
      }
    }
    ;[sortedArray[i + 1], sortedArray[high]] = [sortedArray[high], sortedArray[i + 1]]
    swaps++
    steps.push({
      id: `place-pivot-${i + 1}`,
      description: `Placing pivot at correct position ${i + 1}`,
      swappedIndices: [i + 1, high],
    })

    return i + 1
  }

  function quickSortHelper(low: number, high: number) {
    if (low < high) {
      const pi = partition(low, high)
      quickSortHelper(low, pi - 1)
      quickSortHelper(pi + 1, high)
    }
  }

  steps.push({
    id: "start",
    description: "Starting Quick Sort",
    highlightedIndices: [],
  })

  quickSortHelper(0, sortedArray.length - 1)

  steps.push({
    id: "complete",
    description: "Quick Sort completed!",
    highlightedIndices: [],
  })

  return {
    steps,
    comparisons,
    swaps,
    timeComplexity: "O(n log n) average, O(n²) worst",
    spaceComplexity: "O(log n)",
  }
}
