"use client"

import { useState, useEffect } from "react"
import { VisualizerLayout } from "../../../components/visualizer-layout"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { Badge } from "../../../components/ui/badge"
import { Search, Plus, Trash2 } from "lucide-react"

interface ArrayElement {
  value: number
  index: number
  isHighlighted?: boolean
  isFound?: boolean
  isComparing?: boolean
}

export default function ArrayVisualizerPage() {
  const [array, setArray] = useState<ArrayElement[]>([
    { value: 64, index: 0 },
    { value: 34, index: 1 },
    { value: 25, index: 2 },
    { value: 12, index: 3 },
    { value: 22, index: 4 },
    { value: 11, index: 5 },
    { value: 90, index: 6 },
  ])
  const [searchValue, setSearchValue] = useState("")
  const [newValue, setNewValue] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [searchSteps, setSearchSteps] = useState<string[]>([])
  const [isPlaying, setIsPlaying] = useState(false)
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

  const resetArray = () => {
    setArray(array.map((el, idx) => ({ value: el.value, index: idx })))
    setCurrentStep(0)
    setSearchSteps([])
    setIsSearching(false)
    setIsPlaying(false)
  }

  const addElement = () => {
    if (newValue && !isNaN(Number(newValue))) {
      const newElement: ArrayElement = {
        value: Number(newValue),
        index: array.length,
      }
      setArray([...array, newElement])
      setNewValue("")
    }
  }

  const removeElement = (index: number) => {
    const newArray = array.filter((_, i) => i !== index)
    setArray(newArray.map((el, idx) => ({ ...el, index: idx })))
    resetArray()
  }

  const linearSearch = async (target: number) => {
    const steps = [`Starting linear search for ${target}`]
    const newArray = [...array]

    for (let i = 0; i < newArray.length; i++) {
      steps.push(`Checking index ${i}: ${newArray[i].value}`)
      if (newArray[i].value === target) {
        steps.push(`Found ${target} at index ${i}!`)
        newArray[i].isFound = true
        break
      }
      if (i === newArray.length - 1) {
        steps.push(`${target} not found in array`)
      }
    }

    setSearchSteps(steps)
    return newArray
  }

  const binarySearch = async (target: number) => {
    const steps = [`Starting binary search for ${target}`]
    const sortedArray = [...array].sort((a, b) => a.value - b.value).map((el, idx) => ({ ...el, index: idx }))
    let left = 0
    let right = sortedArray.length - 1

    steps.push("Array must be sorted for binary search")

    while (left <= right) {
      const mid = Math.floor((left + right) / 2)
      steps.push(`Checking middle element at index ${mid}: ${sortedArray[mid].value}`)

      if (sortedArray[mid].value === target) {
        steps.push(`Found ${target} at index ${mid}!`)
        sortedArray[mid].isFound = true
        break
      } else if (sortedArray[mid].value < target) {
        steps.push(`${sortedArray[mid].value} < ${target}, search right half`)
        left = mid + 1
      } else {
        steps.push(`${sortedArray[mid].value} > ${target}, search left half`)
        right = mid - 1
      }

      if (left > right) {
        steps.push(`${target} not found in array`)
      }
    }

    setSearchSteps(steps)
    return sortedArray
  }

  const startSearch = async () => {
    if (!searchValue || isNaN(Number(searchValue))) return

    setIsSearching(true)
    setCurrentStep(0)
    const target = Number(searchValue)

    const resultArray = algorithm === "linear" ? await linearSearch(target) : await binarySearch(target)

    setArray(resultArray)
  }

  const stepForward = () => {
    if (currentStep < searchSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const stepBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const play = () => {
    setIsPlaying(true)
  }

  const pause = () => {
    setIsPlaying(false)
  }

  useEffect(() => {
    if (isPlaying && currentStep < searchSteps.length - 1) {
      const timer = setTimeout(() => {
        setCurrentStep(currentStep + 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (currentStep >= searchSteps.length - 1) {
      setIsPlaying(false)
    }
  }, [isPlaying, currentStep, searchSteps.length])

  return (
    <VisualizerLayout
      title="Array Visualizer"
      description="Learn array operations and search algorithms"
      difficulty="Beginner"
      isPlaying={isPlaying}
      onPlay={play}
      onPause={pause}
      onStepBack={stepBack}
      onStepForward={stepForward}
      onReset={resetArray}
      currentStep={currentStep}
      totalSteps={searchSteps.length}
      complexity={{
        time: algorithm === "linear" ? "O(n)" : "O(log n)",
        space: "O(1)",
      }}
      applications={applications}
    >
      <div className="w-full space-y-6">
        {/* Array Visualization */}
        <div className="flex flex-wrap gap-2 justify-center min-h-[120px] items-center">
          {array.map((element, index) => (
            <div key={index} className="relative">
              <div
                className={`
                  w-16 h-16 border-2 rounded-lg flex flex-col items-center justify-center
                  transition-all duration-300 cursor-pointer group
                  ${
                    element.isFound
                      ? "bg-green-100 border-green-500 text-green-800"
                      : element.isHighlighted
                        ? "bg-accent/20 border-accent"
                        : element.isComparing
                          ? "bg-yellow-100 border-yellow-500"
                          : "bg-card border-border hover:border-accent/50"
                  }
                `}
              >
                <span className="font-mono font-bold text-sm">{element.value}</span>
                <span className="text-xs text-muted-foreground">[{element.index}]</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="absolute -top-2 -right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeElement(index)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Add Element</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Enter number"
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                />
                <Button onClick={addElement} disabled={!newValue}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Search</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2 mb-2">
                <Button
                  variant={algorithm === "linear" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setAlgorithm("linear")}
                >
                  Linear
                </Button>
                <Button
                  variant={algorithm === "binary" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setAlgorithm("binary")}
                >
                  Binary
                </Button>
              </div>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Search value"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                />
                <Button onClick={startSearch} disabled={!searchValue || isSearching}>
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Algorithm Steps */}
        {searchSteps.length > 0 && (
          <Card className="" >
            <CardHeader>
              <CardTitle className="text-lg">Algorithm Steps</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {searchSteps.map((step, index) => (
                  <div
                    key={index}
                    className={`text-sm p-2 rounded ${
                      index === currentStep
                        ? "bg-accent/20 border border-accent"
                        : index < currentStep
                          ? "bg-muted/50 text-muted-foreground"
                          : "text-muted-foreground"
                    }`}
                  >
                    <Badge variant="outline" className="mr-2 text-xs">
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
    </VisualizerLayout>
  )
}
