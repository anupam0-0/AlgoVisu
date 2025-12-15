"use client"

import React, { useState, useEffect, useRef } from "react"
import { VisualizerLayout } from "../../../components/visualizer-layout"
import { Button } from "../../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select"
import { Play, RotateCcw, Trophy } from "lucide-react"
import { bubbleSort, selectionSort, insertionSort, mergeSort, quickSort, heapSort } from "@/lib/algorithms/sorting"
import type { SortElement, SortStep } from "@/lib/algorithms/sorting"

// Types
type AlgoName = "bubble" | "selection" | "insertion" | "merge" | "quick" | "heap"

export default function SortingRaceVisualizer() {
    const [arraySize, setArraySize] = useState(30)
    const [algo1, setAlgo1] = useState<AlgoName>("bubble")
    const [algo2, setAlgo2] = useState<AlgoName>("quick")

    const [array1, setArray1] = useState<SortElement[]>([])
    const [array2, setArray2] = useState<SortElement[]>([])

    // States for independent playback
    const [steps1, setSteps1] = useState<SortStep[]>([])
    const [steps2, setSteps2] = useState<SortStep[]>([])
    const [currentStep1, setCurrentStep1] = useState(0)
    const [currentStep2, setCurrentStep2] = useState(0)
    const [finished1, setFinished1] = useState(false)
    const [finished2, setFinished2] = useState(false)
    const [isPlaying, setIsPlaying] = useState(false)
    const [startTime, setStartTime] = useState(0)
    const [elapsed1, setElapsed1] = useState(0) // Visual steps count as proxy for 'time'
    const [elapsed2, setElapsed2] = useState(0)

    // Initialize
    useEffect(() => {
        reset()
    }, [arraySize])

    const generateArray = () => {
        const arr: SortElement[] = []
        for (let i = 0; i < arraySize; i++) {
            arr.push({ value: Math.floor(Math.random() * 200) + 10, id: i })
        }
        return arr
    }

    const reset = () => {
        const baseArray = generateArray()
        setArray1(JSON.parse(JSON.stringify(baseArray)))
        setArray2(JSON.parse(JSON.stringify(baseArray)))
        setSteps1([])
        setSteps2([])
        setCurrentStep1(0)
        setCurrentStep2(0)
        setFinished1(false)
        setFinished2(false)
        setIsPlaying(false)
    }

    const runAlgorithms = () => {
        // Generate Steps
        let s1: SortStep[] = []
        let s2: SortStep[] = []

        const getSteps = (name: AlgoName, arr: SortElement[]) => {
            switch (name) {
                case "bubble": return bubbleSort(arr)
                case "selection": return selectionSort(arr)
                case "insertion": return insertionSort(arr)
                case "merge": return mergeSort(arr)
                case "quick": return quickSort(arr)
                case "heap": return heapSort(arr)
            }
        }

        // Must clone arrays for generation because algorithms sort in-place or modify
        s1 = getSteps(algo1, JSON.parse(JSON.stringify(array1)))
        s2 = getSteps(algo2, JSON.parse(JSON.stringify(array2)))

        setSteps1(s1)
        setSteps2(s2)
        setIsPlaying(true)
    }

    // Animation Loop
    // We want them to run "concurrently" at the same tick rate.
    // Fast algorithms will finish in fewer steps.
    // However, visually, O(N^2) algorithms have WAY more steps than O(N log N).
    // So one will finish way faster in real time if we step 1:1. That is exactly the point!

    useEffect(() => {
        if (!isPlaying) return

        const interval = setInterval(() => {
            let active = false

            // Advance Algo 1
            if (currentStep1 < steps1.length - 1) {
                setCurrentStep1(prev => prev + 1)
                active = true
            } else if (!finished1 && steps1.length > 0) {
                setFinished1(true)
            }

            // Advance Algo 2
            if (currentStep2 < steps2.length - 1) {
                setCurrentStep2(prev => prev + 1)
                active = true
            } else if (!finished2 && steps2.length > 0) {
                setFinished2(true)
            }

            if (!active) setIsPlaying(false)

        }, 20) // Fast 20ms ticks

        return () => clearInterval(interval)
    }, [isPlaying, currentStep1, currentStep2, steps1, steps2, finished1, finished2])

    // Sync Array State to Steps
    const renderArray1 = steps1[currentStep1]?.array || array1
    const renderArray2 = steps2[currentStep2]?.array || array2

    // Render Bar
    const renderBar = (el: SortElement, heightScale: number = 1) => (
        <div
            key={el.id}
            className={`flex-1 rounded-t-sm transition-colors ${el.isSorted ? "bg-green-500" :
                el.isSelected ? "bg-red-500" : "bg-blue-500"
                }`}
            style={{ height: `${el.value}px` }}
        />
    )

    const algoOptions = ["bubble", "selection", "insertion", "merge", "quick", "heap"]

    return (
        <VisualizerLayout
            title="Sorting Race Mode"
            description="Visualize the speed difference between O(N²) and O(N log N) algorithms"
            difficulty="Intermediate"
            onReset={reset}
            applications={[]}
        >
            <div className="space-y-8">
                {/* Controls */}
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm">Race Configuration</CardTitle></CardHeader>
                    <CardContent className="flex flex-wrap gap-4 items-center">
                        <div className="flex gap-2 items-center">
                            <span className="text-sm font-bold text-blue-600">Left:</span>
                            <Select value={algo1} onValueChange={(v: AlgoName) => setAlgo1(v)}>
                                <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {algoOptions.map(a => <SelectItem key={a} value={a}>{a.charAt(0).toUpperCase() + a.slice(1)}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="font-bold text-muted-foreground">VS</div>
                        <div className="flex gap-2 items-center">
                            <span className="text-sm font-bold text-purple-600">Right:</span>
                            <Select value={algo2} onValueChange={(v: AlgoName) => setAlgo2(v)}>
                                <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {algoOptions.map(a => <SelectItem key={a} value={a}>{a.charAt(0).toUpperCase() + a.slice(1)}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>

                        <Button onClick={runAlgorithms} disabled={isPlaying} className="ml-auto bg-primary">
                            <Play className="mr-2 h-4 w-4" /> Start Race
                        </Button>
                        <Button variant="outline" onClick={reset} disabled={isPlaying}>
                            Reset
                        </Button>
                    </CardContent>
                </Card>

                <div className="grid md:grid-cols-2 gap-6">
                    {/* Left Arena */}
                    <Card className={`transition-all duration-300 ${finished1 ? "ring-4 ring-green-400 bg-green-50" : ""}`}>
                        <CardHeader className="pb-2 flex flex-row items-center justify-between">
                            <CardTitle className="text-blue-700 capitalize">{algo1} Sort</CardTitle>
                            {finished1 && <Trophy className="text-yellow-500 w-6 h-6 animate-bounce" />}
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px] flex items-end p-4 bg-muted/10 rounded border gap-px">
                                {renderArray1.map(el => renderBar(el))}
                            </div>
                            <div className="mt-4 text-center text-sm font-mono text-muted-foreground">
                                Steps: {currentStep1} / {steps1.length}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Right Arena */}
                    <Card className={`transition-all duration-300 ${finished2 ? "ring-4 ring-green-400 bg-green-50" : ""}`}>
                        <CardHeader className="pb-2 flex flex-row items-center justify-between">
                            <CardTitle className="text-purple-700 capitalize">{algo2} Sort</CardTitle>
                            {finished2 && <Trophy className="text-yellow-500 w-6 h-6 animate-bounce" />}
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px] flex items-end p-4 bg-muted/10 rounded border gap-px">
                                {renderArray2.map(el => renderBar(el))}
                            </div>
                            <div className="mt-4 text-center text-sm font-mono text-muted-foreground">
                                Steps: {currentStep2} / {steps2.length}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="text-center text-muted-foreground text-sm">
                    Note: The visualization runs at a constant "operations per second".
                    Algorithms with fewer steps finish faster.
                </div>
            </div>
        </VisualizerLayout>
    )
}
