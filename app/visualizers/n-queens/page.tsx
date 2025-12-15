"use client"

import React, { useState, useEffect, useRef } from "react"
import { VisualizerLayout } from "../../../components/visualizer-layout"
import { Button } from "../../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { Slider } from "../../../components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select"
import { Play, RotateCcw, Crown } from "lucide-react"

// Types
type BoardState = number[][] // 0 = empty, 1 = queen
type Step = {
    board: BoardState
    currentRow: number
    pCol: number
    status: "placing" | "safe" | "unsafe" | "backtracking" | "solution"
    description: string
}

export default function NQueensVisualizer() {
    const [n, setN] = useState(4)
    const [board, setBoard] = useState<BoardState>([])
    const [steps, setSteps] = useState<Step[]>([])
    const [currentStep, setCurrentStep] = useState(0)
    const [isPlaying, setIsPlaying] = useState(false)
    const [speed, setSpeed] = useState([500])
    const [solutionsFound, setSolutionsFound] = useState(0)

    // Initialize Board
    useEffect(() => {
        resetBoard()
    }, [n])

    const resetBoard = () => {
        const newBoard = Array(n).fill(0).map(() => Array(n).fill(0))
        setBoard(newBoard)
        setSteps([])
        setCurrentStep(0)
        setIsPlaying(false)
        setSolutionsFound(0)
    }

    // --- N-Queens Algorithm with Step Tracking ---
    const solveNQueens = () => {
        const newSteps: Step[] = []
        const tempBoard = Array(n).fill(0).map(() => Array(n).fill(0))
        let solCount = 0

        const isSafe = (row: number, col: number) => {
            // Check column
            for (let i = 0; i < row; i++) {
                if (tempBoard[i][col] === 1) return false
            }
            // Check upper left diagonal
            for (let i = row, j = col; i >= 0 && j >= 0; i--, j--) {
                if (tempBoard[i][j] === 1) return false
            }
            // Check upper right diagonal
            for (let i = row, j = col; i >= 0 && j < n; i--, j++) {
                if (tempBoard[i][j] === 1) return false
            }
            return true
        }

        const backtrack = (row: number) => {
            if (row === n) {
                solCount++
                newSteps.push({
                    board: tempBoard.map(r => [...r]),
                    currentRow: row,
                    pCol: -1,
                    status: "solution",
                    description: `Solution ${solCount} found!`
                })
                return
            }

            for (let col = 0; col < n; col++) {
                // 1. Placing
                tempBoard[row][col] = 1
                newSteps.push({
                    board: tempBoard.map(r => [...r]),
                    currentRow: row,
                    pCol: col,
                    status: "placing",
                    description: `Trying Queen at (${row}, ${col})...`
                })

                if (isSafe(row, col)) {
                    // 2. Safe
                    newSteps.push({
                        board: tempBoard.map(r => [...r]),
                        currentRow: row,
                        pCol: col,
                        status: "safe",
                        description: `Position (${row}, ${col}) is safe.`
                    })

                    backtrack(row + 1)

                    // Backtracked
                    if (row < n) { // If we returned from a deeper level
                        // This is technically expected after exploring subs
                    }

                } else {
                    // 3. Unsafe
                    newSteps.push({
                        board: tempBoard.map(r => [...r]),
                        currentRow: row,
                        pCol: col,
                        status: "unsafe",
                        description: `Position (${row}, ${col}) is under attack!`
                    })
                }

                // 4. Backtrack (Remove)
                tempBoard[row][col] = 0
                newSteps.push({
                    board: tempBoard.map(r => [...r]),
                    currentRow: row,
                    pCol: col,
                    status: "backtracking",
                    description: `Backtracking from (${row}, ${col}).`
                })
            }
        }

        backtrack(0)
        setSteps(newSteps)
        setSolutionsFound(solCount)

        // Auto-start
        setCurrentStep(0)
        setIsPlaying(true)
    }

    // Playback Control
    useEffect(() => {
        let timer: NodeJS.Timeout
        if (isPlaying && currentStep < steps.length - 1) {
            timer = setTimeout(() => {
                setCurrentStep(prev => prev + 1)
            }, 1050 - speed[0] * 10) // Speed mapping
        } else if (currentStep >= steps.length - 1) {
            setIsPlaying(false)
        }
        return () => clearTimeout(timer)
    }, [isPlaying, currentStep, steps, speed])

    // Current Step Data
    const activeStep = steps[currentStep]
    const displayBoard = activeStep ? activeStep.board : board

    // Safe checks for rendering highlights (stateless from algo to avoiding storing it all)
    const isAttacked = (r: number, c: number) => {
        if (!activeStep) return false
        if (activeStep.status !== "unsafe") return false
        const { currentRow, pCol } = activeStep
        if (r === currentRow && c === pCol) return true // The piece itself
        // Highlight the attack source? Simplified: Just highlight the unsafe cell red.
        return (r === currentRow && c === pCol)
    }

    const getCellStatusColor = (r: number, c: number) => {
        if (!activeStep) return ""
        const { currentRow, pCol, status } = activeStep

        // The cell being processed
        if (r === currentRow && c === pCol) {
            if (status === "placing") return "bg-blue-300 ring-4 ring-blue-500"
            if (status === "safe") return "bg-green-300 ring-4 ring-green-500"
            if (status === "unsafe") return "bg-red-300 ring-4 ring-red-500"
            if (status === "backtracking") return "bg-orange-200 ring-4 ring-orange-400"
        }

        // Solution Mode
        if (status === "solution" && displayBoard[r][c] === 1) {
            return "bg-emerald-400 ring-2 ring-emerald-600"
        }

        return ""
    }

    return (
        <VisualizerLayout
            title="N-Queens Visualizer"
            description="Visualize the Backtracking algorithm to solve the N-Queens problem"
            difficulty="Advanced"
            onReset={resetBoard}
            applications={[
                { title: "Constraint Satisfaction", description: "Scheduling and timetable problems", examples: ["Exam Scheduling", "Sudoku"] },
                { title: "VLSI Testing", description: "Testing chip designs", examples: ["Circuit Layouts"] },
                { title: "AI Gaming", description: "Solving puzzles and pathing", examples: ["Game Solvers"] }
            ]}
        >
            <div className="flex flex-col items-center space-y-8">

                {/* Controls */}
                <div className="w-full max-w-4xl grid md:grid-cols-2 gap-4">
                    <Card>
                        <CardHeader className="pb-2"><CardTitle className="text-sm">Board Size (N={n})</CardTitle></CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-4">
                                <Slider
                                    value={[n]} onValueChange={(v) => { if (!isPlaying) setN(v[0]) }}
                                    min={4} max={8} step={1} className="flex-1"
                                    disabled={isPlaying}
                                />
                                <span className="font-mono text-xl font-bold">{n}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2"><CardTitle className="text-sm">Controls</CardTitle></CardHeader>
                        <CardContent className="flex items-center gap-4">
                            <Button onClick={solveNQueens} disabled={isPlaying || steps.length > 0} className="flex-1">
                                <Play className="mr-2 h-4 w-4" /> Start
                            </Button>
                            <Button variant="outline" onClick={resetBoard} className="flex-1">
                                <RotateCcw className="mr-2 h-4 w-4" /> Reset
                            </Button>
                            <div className="w-24">
                                <Slider value={speed} onValueChange={setSpeed} min={10} max={100} />
                                <div className="text-xs text-center text-muted-foreground mt-1">Speed</div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Status */}
                <div className="text-center h-8">
                    {activeStep ? (
                        <span className={`text-lg font-medium px-4 py-1 rounded-full ${activeStep.status === 'solution' ? 'bg-green-100 text-green-800' :
                                activeStep.status === 'unsafe' ? 'bg-red-100 text-red-800' :
                                    'bg-slate-100'
                            }`}>
                            {activeStep.description}
                        </span>
                    ) : (
                        <span className="text-muted-foreground">Select size and press Start</span>
                    )}
                </div>

                {/* Board */}
                <div
                    className="relative border-4 border-slate-800 rounded-lg shadow-2xl bg-white p-1"
                    style={{
                        display: 'grid',
                        gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))`,
                        width: 'min(80vw, 500px)',
                        aspectRatio: '1/1'
                    }}
                >
                    {displayBoard.map((row, r) => (
                        row.map((cell, c) => {
                            const isBlack = (r + c) % 2 === 1
                            return (
                                <div
                                    key={`${r}-${c}`}
                                    className={`
                        relative flex items-center justify-center text-3xl md:text-5xl transition-all duration-200
                        ${isBlack ? "bg-slate-700" : "bg-slate-300"}
                        ${getCellStatusColor(r, c)}
                      `}
                                >
                                    {cell === 1 && (
                                        <Crown
                                            className="w-3/5 h-3/5 text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] fill-current animate-in zoom-in duration-300"
                                            strokeWidth={1.5}
                                        />
                                    )}
                                </div>
                            )
                        })
                    ))}
                </div>

                {/* Legend */}
                <div className="flex gap-4 text-xs md:text-sm text-muted-foreground">
                    <div className="flex items-center gap-1"><div className="w-3 h-3 bg-blue-400 rounded"></div> Trying</div>
                    <div className="flex items-center gap-1"><div className="w-3 h-3 bg-green-400 rounded"></div> Safe</div>
                    <div className="flex items-center gap-1"><div className="w-3 h-3 bg-red-400 rounded"></div> Unsafe</div>
                    <div className="flex items-center gap-1"><div className="w-3 h-3 bg-orange-300 rounded"></div> Backtracking</div>
                </div>

            </div>
        </VisualizerLayout>
    )
}
