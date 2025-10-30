"use client"

import { useState, useEffect, useCallback } from "react"
import { VisualizerLayout } from "../../../components/visualizer-layout"
import { Input } from "../../../components/ui/input"
import { Button } from "../../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { Badge } from "../../../components/ui/badge"
import { Search, Plus, Trash2 } from "lucide-react"

interface WordElement {
  word: string
  index: number
  isMatch?: boolean
}

const DEFAULT_WORDS: WordElement[] = [
  { word: "apple", index: 0 },
  { word: "application", index: 1 },
  { word: "banana", index: 2 },
  { word: "apply", index: 3 },
  { word: "appreciate", index: 4 },
  { word: "orange", index: 5 },
  { word: "apricot", index: 6 },
  { word: "grape", index: 7 },
]

export default function PrefixSearchVisualizerPage() {
  const [words, setWords] = useState<WordElement[]>(DEFAULT_WORDS)
  const [query, setQuery] = useState("")
  const [steps, setSteps] = useState<string[]>([])
  const [matchCount, setMatchCount] = useState(0)
  const [newWord, setNewWord] = useState("")

  const resetHighlights = useCallback((wordList: WordElement[]): WordElement[] => {
    return wordList.map(w => ({ ...w, isMatch: false }))
  }, [])

  const performSearch = useCallback(() => {
    const prefix = query.trim().toLowerCase()
    let newSteps: string[] = []
    let matches = 0

    if (prefix === "") {
      setWords(prev => resetHighlights(prev))
      setSteps(["Enter a prefix to begin search..."])
      setMatchCount(0)
      return
    }

    newSteps.push(`🔍 Searching for words starting with "${prefix}"...`)

    const updatedWords = words.map(wordObj => {
      const isMatch = wordObj.word.toLowerCase().startsWith(prefix)
      if (isMatch) {
        matches++
        newSteps.push(`✅ Match: "${wordObj.word}"`)
      }
      return { ...wordObj, isMatch }
    })

    newSteps.push(`📊 Found ${matches} matching word(s).`)
    setWords(updatedWords)
    setSteps(newSteps)
    setMatchCount(matches)
  }, [query, words, resetHighlights])

  // Run search on every keystroke (with debounce)
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch()
    }, 300)
    return () => clearTimeout(timer)
  }, [query, performSearch])

  const addWord = () => {
    const cleanWord = newWord.trim()
    if (cleanWord === "") return

    const newElement: WordElement = {
      word: cleanWord,
      index: words.length,
    }

    setWords(prev => [...prev, newElement])
    setNewWord("")
    // Trigger re-search if query exists
    if (query) {
      setTimeout(() => performSearch(), 100)
    }
  }

  const removeWord = (indexToRemove: number) => {
    const filtered = words.filter((_, i) => i !== indexToRemove)
    // Re-index
    const reindexed = filtered.map((w, idx) => ({ ...w, index: idx }))
    setWords(reindexed)
    if (query) {
      setTimeout(() => performSearch(), 100)
    }
  }

  const resetToDefault = () => {
    setWords(DEFAULT_WORDS)
    setQuery("")
    setSteps(["Enter a prefix to begin search..."])
    setMatchCount(0)
  }

  return (
    <VisualizerLayout
      title="Prefix Search Visualizer"
      description="See how autocomplete systems suggest words in real-time as you type"
      difficulty="Beginner"
      complexity={{
        time: "O(n × m)",
        space: "O(k)",
      }}
      // Note: applications prop is omitted from UI per your request
    >
      <div className="w-full space-y-8">
        {/* Controls: Add Word + Search */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Add Word */}
          <Card className="bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Word
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="e.g., javascript, react"
                  value={newWord}
                  onChange={(e) => setNewWord(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addWord()}
                />
                <Button onClick={addWord} disabled={!newWord.trim()}>
                  Add
                </Button>
              </div>
              <Button variant="outline" size="sm" onClick={resetToDefault} className="w-full">
                Reset to Default Words
              </Button>
            </CardContent>
          </Card>

          {/* Search Input */}
          <Card className="bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Search className="h-4 w-4" />
                Type to Search (Prefix Match)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                type="text"
                placeholder="e.g., 'app', 'ban', 'gr'"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="text-lg py-5 px-4"
                aria-label="Type a prefix to search"
              />
              <p className="text-sm text-muted-foreground mt-2">
                Matches words that <strong>start with</strong> your input (case-insensitive).
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Word Visualization */}
        <div className="flex flex-wrap justify-center gap-4 min-h-[180px] items-center p-6 bg-gradient-to-br from-muted/30 to-background rounded-2xl border border-border">
          {words.length === 0 ? (
            <p className="text-muted-foreground italic text-lg">No words in the list</p>
          ) : (
            words.map((wordObj) => (
              <div key={wordObj.index} className="relative group">
                <div
                  className={`
                    w-32 h-28 md:w-36 md:h-32 border-2 rounded-xl flex items-center justify-center
                    transition-all duration-300 shadow-sm text-center p-3
                    ${
                      wordObj.isMatch
                        ? "bg-blue-100 border-blue-500 text-blue-900 font-bold shadow-md scale-[1.03]"
                        : "bg-background border-border text-foreground hover:border-primary/50"
                    }
                  `}
                >
                  <span className="font-medium break-words">{wordObj.word}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute -top-2 -right-2 h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity bg-background border rounded-full"
                  onClick={() => removeWord(wordObj.index)}
                  aria-label={`Remove word "${wordObj.word}"`}
                >
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </Button>
              </div>
            ))
          )}
        </div>

        {/* Execution Steps */}
        <Card className="bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Search Results
              {matchCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {matchCount} match{matchCount !== 1 ? "es" : ""}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-60 overflow-y-auto p-2">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className="p-3 rounded-lg text-sm bg-background border border-border"
                >
                  <Badge variant="outline" className="mr-2">
                    {index + 1}
                  </Badge>
                  {step}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </VisualizerLayout>
  )
}