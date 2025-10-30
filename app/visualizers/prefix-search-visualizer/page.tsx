"use client"

import { useState, useEffect, useCallback } from "react"
import { VisualizerLayout } from "../../../components/visualizer-layout"
import { Input } from "../../../components/ui/input"
import { Button } from "../../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { Badge } from "../../../components/ui/badge"
import { Search, Plus, Trash2, List, Eye } from "lucide-react"
import { Label } from "../../../components/ui/label"
import { Switch } from "../../../components/ui/switch"

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
  const [bulkInput, setBulkInput] = useState("")
  const [isCaseSensitive, setIsCaseSensitive] = useState(false)

  const resetHighlights = useCallback((wordList: WordElement[]): WordElement[] => {
    return wordList.map(w => ({ ...w, isMatch: false }))
  }, [])

  const performSearch = useCallback(() => {
    const prefix = query.trim()
    if (prefix === "") {
      setWords(prev => resetHighlights(prev))
      setSteps(["Enter a prefix to begin search..."])
      setMatchCount(0)
      return
    }

    let newSteps: string[] = []
    let matches = 0

    newSteps.push(
      isCaseSensitive
        ? `🔍 Case-sensitive search for words starting with "${prefix}"...`
        : `🔍 Searching for words starting with "${prefix}" (case-insensitive)...`
    )

    const updatedWords = words.map(wordObj => {
      let isMatch = false
      if (isCaseSensitive) {
        isMatch = wordObj.word.startsWith(prefix)
      } else {
        isMatch = wordObj.word.toLowerCase().startsWith(prefix.toLowerCase())
      }

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
  }, [query, words, isCaseSensitive, resetHighlights])

  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch()
    }, 300)
    return () => clearTimeout(timer)
  }, [query, isCaseSensitive, performSearch])

  const addWord = () => {
    const cleanWord = newWord.trim()
    if (cleanWord === "") return

    const newElement: WordElement = {
      word: cleanWord,
      index: words.length,
    }

    setWords(prev => [...prev, newElement])
    setNewWord("")
    if (query) setTimeout(() => performSearch(), 100)
  }

  const removeWord = (indexToRemove: number) => {
    const filtered = words.filter((_, i) => i !== indexToRemove)
    const reindexed = filtered.map((w, idx) => ({ ...w, index: idx }))
    setWords(reindexed)
    if (query) setTimeout(() => performSearch(), 100)
  }

  const resetToDefault = () => {
    setWords(DEFAULT_WORDS)
    setQuery("")
    setSteps(["Enter a prefix to begin search..."])
    setMatchCount(0)
    setBulkInput("")
  }

  const importBulkWords = () => {
    if (!bulkInput.trim()) return

    // Split by comma, newline, or space (robust parsing)
    const separators = /[,;\n\t ]+/
    const rawWords = bulkInput
      .split(separators)
      .map(w => w.trim())
      .filter(w => w !== "")

    if (rawWords.length === 0) return

    const newWords = rawWords.map((word, idx) => ({
      word,
      index: words.length + idx,
    }))

    setWords(prev => [...prev, ...newWords])
    setBulkInput("")
    if (query) setTimeout(() => performSearch(), 100)
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
    >
      <div className="w-full space-y-8">
        {/* Top Controls: Add, Bulk Import, Search */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Add Single Word */}
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
                  placeholder="e.g., react"
                  value={newWord}
                  onChange={(e) => setNewWord(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addWord()}
                />
                <Button onClick={addWord} disabled={!newWord.trim()}>
                  Add
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Bulk Import */}
          <Card className="bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <List className="h-4 w-4" />
                Bulk Import
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                type="text"
                placeholder="apple, banana, cherry"
                value={bulkInput}
                onChange={(e) => setBulkInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && importBulkWords()}
              />
              <Button onClick={importBulkWords} disabled={!bulkInput.trim()} className="w-full">
                Import Words
              </Button>
              <p className="text-xs text-muted-foreground">
                Separate words by commas, spaces, or new lines.
              </p>
            </CardContent>
          </Card>

          {/* Search + Case Toggle */}
          <Card className="bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Search className="h-4 w-4" />
                Search Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                type="text"
                placeholder="e.g., 'App'"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="text-lg py-5 px-4"
                aria-label="Type a prefix to search"
              />
              <div className="flex items-center justify-between">
                <Label htmlFor="case-sensitive" className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Case-Sensitive
                </Label>
                <Switch
                  id="case-sensitive"
                  checked={isCaseSensitive}
                  onCheckedChange={setIsCaseSensitive}
                />
              </div>
              <Button variant="outline" size="sm" onClick={resetToDefault} className="w-full mt-2">
                Reset to Default
              </Button>
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