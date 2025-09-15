"use client"

import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { Progress } from "../components/ui/progress"
import { Separator } from "../components/ui/separator"
import Link from "next/link"
import { ArrowLeft, Play, Pause, SkipBack, SkipForward, RotateCcw, Settings, Clock, Zap } from "lucide-react"
import type { ReactNode } from "react"

interface VisualizerLayoutProps {
  title: string
  description: string
  difficulty: "Beginner" | "Intermediate" | "Advanced"
  children: ReactNode
  isPlaying?: boolean
  onPlay?: () => void
  onPause?: () => void
  onStepBack?: () => void
  onStepForward?: () => void
  onReset?: () => void
  currentStep?: number
  totalSteps?: number
  complexity?: {
    time: string
    space: string
  }
  applications?: Array<{
    title: string
    description: string
    examples: string[]
  }>
}

export function VisualizerLayout({
  title,
  description,
  difficulty,
  children,
  isPlaying = false,
  onPlay,
  onPause,
  onStepBack,
  onStepForward,
  onReset,
  currentStep = 0,
  totalSteps = 0,
  complexity,
  applications = [],
}: VisualizerLayoutProps) {
  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case "Beginner":
        return "bg-green-100 text-green-800 border-green-200"
      case "Intermediate":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "Advanced":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const progressPercentage = totalSteps > 0 ? (currentStep / totalSteps) * 100 : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Enhanced Header */}
      <header className="border-b border-border bg-white/80 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" asChild className="hover:bg-blue-50">
                <Link href="/visualizers">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Visualizers
                </Link>
              </Button>
              <div>
                <h1 className="text-xl font-bold text-foreground">{title}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className={`text-xs border ${getDifficultyColor(difficulty)}`}>{difficulty}</Badge>
                  <span className="text-sm text-muted-foreground">{description}</span>
                </div>
              </div>
            </div>
            <Button variant="outline" size="sm" className="hover:bg-blue-50 bg-transparent">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Main Visualization Area */}
          <div className="lg:col-span-3">
            {/* Enhanced Visualization Card */}
            <Card className="mb-6 shadow-lg border-0 bg-white/90 backdrop-blur-sm">
              <CardContent className="p-0">
                {/* Progress Bar */}
                {totalSteps > 0 && (
                  <div className="px-6 pt-6 pb-2">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-muted-foreground">Progress</span>
                      <span className="text-sm font-mono text-muted-foreground">
                        {currentStep}/{totalSteps}
                      </span>
                    </div>
                    <Progress value={progressPercentage} className="h-2" />
                  </div>
                )}

                {/* Visualization Canvas */}
                <div className="p-6">
                  <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl p-6 min-h-[400px] flex items-center justify-center border border-slate-200/50">
                    {children}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Controls */}
            <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Play className="h-5 w-5 text-blue-600" />
                  Algorithm Controls
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center gap-3 mb-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onStepBack}
                    disabled={currentStep === 0}
                    className="hover:bg-blue-50 disabled:opacity-50 bg-transparent"
                  >
                    <SkipBack className="h-4 w-4" />
                  </Button>
                  {isPlaying ? (
                    <Button onClick={onPause} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 shadow-md">
                      <Pause className="h-4 w-4 mr-2" />
                      Pause
                    </Button>
                  ) : (
                    <Button onClick={onPlay} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 shadow-md">
                      <Play className="h-4 w-4 mr-2" />
                      Play
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onStepForward}
                    disabled={currentStep >= totalSteps}
                    className="hover:bg-blue-50 disabled:opacity-50"
                  >
                    <SkipForward className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onReset}
                    className="hover:bg-red-50 hover:border-red-200 hover:text-red-600 bg-transparent"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </div>

                {/* Status Indicator */}
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-sm">
                    <div
                      className={`w-2 h-2 rounded-full ${isPlaying ? "bg-green-500 animate-pulse" : "bg-gray-400"}`}
                    ></div>
                    {isPlaying ? "Running" : "Paused"}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Sidebar */}
          <div className="space-y-6">
            {/* Complexity Analysis */}
            {complexity && (
              <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Zap className="h-5 w-5 text-yellow-600" />
                    Complexity Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-900">Time Complexity</span>
                    </div>
                    <Badge variant="outline" className="font-mono text-blue-700 bg-blue-50 border-blue-200">
                      {complexity.time}
                    </Badge>
                  </div>
                  <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-100">
                    <div className="flex items-center gap-2 mb-1">
                      <Zap className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-900">Space Complexity</span>
                    </div>
                    <Badge variant="outline" className="font-mono text-green-700 bg-green-50 border-green-200">
                      {complexity.space}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Algorithm Steps */}
            <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Algorithm Steps</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground p-3 bg-slate-50 rounded-lg border border-slate-200">
                  Step-by-step explanation will appear here as you progress through the algorithm.
                </div>
              </CardContent>
            </Card>

            {/* Real-world Applications */}
            {applications.length > 0 && (
              <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">Real-world Applications</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {applications.map((app, index) => (
                    <div key={index}>
                      <div className="border-l-4 border-blue-200 pl-4 py-2 bg-gradient-to-r from-blue-50/50 to-transparent rounded-r-lg">
                        <h4 className="font-semibold text-sm mb-2 text-blue-900">{app.title}</h4>
                        <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{app.description}</p>
                        <div className="space-y-1">
                          {app.examples.map((example, exIndex) => (
                            <div
                              key={exIndex}
                              className="text-xs bg-white/80 rounded-md px-3 py-1.5 border border-slate-200 text-slate-700"
                            >
                              {example}
                            </div>
                          ))}
                        </div>
                      </div>
                      {index < applications.length - 1 && <Separator className="mt-4" />}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
