export type AlgorithmType = "sorting" | "searching" | "tree" | "graph"

export type SortingAlgorithm = "bubble-sort" | "quick-sort" | "merge-sort" | "insertion-sort" | "selection-sort"

export type DataStructure = "array" | "stack" | "queue" | "binary-tree" | "linked-list"

export type AnimationSpeed = "slow" | "medium" | "fast" | "very-fast"

export interface VisualizationState {
  isPlaying: boolean
  isPaused: boolean
  currentStep: number
  totalSteps: number
  speed: AnimationSpeed
}

export interface ArrayElement {
  value: number
  index: number
  state: "default" | "comparing" | "swapping" | "sorted" | "highlighted"
}

export interface AlgorithmInfo {
  name: string
  description: string
  timeComplexity: string
  spaceComplexity: string
  type: AlgorithmType
}
