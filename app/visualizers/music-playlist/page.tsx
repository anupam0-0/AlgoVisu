"use client"

import { useState, useEffect } from "react"
import { VisualizerLayout } from "../../../components/visualizer-layout"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "../../../components/ui/badge"
import { Plus, Trash2, Repeat, ChevronRight, ArrowLeft } from "lucide-react"

interface SongNode {
  id: number
  title: string
  isHighlighted?: boolean
  isRemoved?: boolean
  isPlaying?: boolean
}

export default function MusicPlaylistApplication() {
  const [songs, setSongs] = useState<SongNode[]>([
    { id: 1, title: "Bohemian Rhapsody" },
    { id: 2, title: "Blinding Lights" },
    { id: 3, title: "Levitating" },
  ])
  const [newSongTitle, setNewSongTitle] = useState("")
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentSongIndex, setCurrentSongIndex] = useState<number | null>(null)
  const [isCircular, setIsCircular] = useState(true)
  const [history, setHistory] = useState<string[]>([])

  const nextSongIndex = (index: number): number | null => {
    if (songs.length === 0) return null
    if (index === songs.length - 1) {
      return isCircular ? 0 : null
    }
    return index + 1
  }

  const prevSongIndex = (index: number): number | null => {
    if (songs.length === 0) return null
    if (index === 0) {
      return isCircular ? songs.length - 1 : null
    }
    return index - 1
  }

  const addSong = () => {
    if (!newSongTitle.trim()) return
    const newSong: SongNode = {
      id: Date.now(),
      title: newSongTitle.trim(),
      isHighlighted: true,
    }
    setSongs(prev => [...prev, newSong])
    setHistory(prev => [...prev, `Added "${newSongTitle}"`])
    setNewSongTitle("")
    setTimeout(() => {
      setSongs(prev => prev.map(s => ({ ...s, isHighlighted: false })))
    }, 800)
  }

  const removeSong = (index: number) => {
    const song = songs[index]
    if (!song) return // safety guard

    setSongs(prev => prev.map((s, i) => i === index ? { ...s, isRemoved: true } : s))
    setHistory(prev => [...prev, `Removed "${song.title}"`])

    setTimeout(() => {
      setSongs(prev => prev.filter((_, i) => i !== index))

      if (currentSongIndex === index) {
        setCurrentSongIndex(null)
        setIsPlaying(false)
      } else if (currentSongIndex !== null && currentSongIndex > index) {
        // ✅ FIXED: Use direct value instead of functional update
        setCurrentSongIndex(currentSongIndex - 1)
      }
    }, 600)
  }

  const playFrom = (index: number) => {
    setCurrentSongIndex(index)
    setIsPlaying(true)
    setSongs(prev => prev.map((s, i) => ({ ...s, isPlaying: i === index })))
    setHistory(prev => [...prev, `Now playing: "${songs[index].title}"`])
  }

  const playNext = () => {
    if (currentSongIndex === null) return
    const next = nextSongIndex(currentSongIndex)
    if (next !== null) {
      setCurrentSongIndex(next)
      setSongs(prev => prev.map((s, i) => ({ ...s, isPlaying: i === next })))
    } else {
      setIsPlaying(false)
    }
  }

  const playPrevious = () => {
    if (currentSongIndex === null) return
    const prev = prevSongIndex(currentSongIndex)
    if (prev !== null) {
      setCurrentSongIndex(prev)
      
    }
  }

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (isPlaying && currentSongIndex !== null) {
      timer = setTimeout(() => {
        const next = nextSongIndex(currentSongIndex)
        if (next !== null) {
          setCurrentSongIndex(next)
          setSongs(prev => prev.map((s, i) => ({ ...s, isPlaying: i === next })))
        } else {
          setIsPlaying(false)
        }
      }, 3000)
    }
    return () => clearTimeout(timer)
  }, [isPlaying, currentSongIndex, songs.length, isCircular])

  return (
    // ✅ PASS ONLY ESSENTIAL PROPS — NO ALGORITHM CONTROLS
    // If your VisualizerLayout still shows controls, it's a layout issue — not this page's fault.
    // But this is the cleanest possible usage.
    <VisualizerLayout
      title="Music Playlist Management"
      description="How linked lists power dynamic, efficient music playlists in apps like Spotify, Apple Music, and YouTube"
      difficulty="Intermediate"
      complexity={{
        time: "O(1) insert/delete, O(n) access",
        space: "O(n)",
      }}
      applications={[]}
      // ⚠️ DO NOT pass: isPlaying, onPlay, onPause, onStep*, onReset, currentStep, totalSteps
    >
      <div className="w-full space-y-6">
        {/* Explanation Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ChevronRight className="h-5 w-5 text-primary" />
              Why Linked Lists for Playlists?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              Music playlists require frequent additions, deletions, and reordering — all while maintaining playback order.
              Linked lists excel here because:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Appending a song</strong> is O(1) — no need to shift existing tracks.</li>
              <li><strong>Removing a song</strong> is O(1) if you have a reference (e.g., user clicks "Remove").</li>
              <li><strong>Circular linking</strong> enables seamless looped playback without extra logic.</li>
              <li><strong>Memory efficiency</strong>: No pre-allocated array space wasted.</li>
            </ul>
            <p>
              Real apps like Spotify use doubly linked lists to support "Shuffle", "Repeat", and instant skip —
              exactly what you’re simulating below!
            </p>
          </CardContent>
        </Card>

        {/* Interactive Implementation Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Repeat className="h-5 w-5 text-accent" />
              Playlist Simulator
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                placeholder="Song title (e.g., 'Dance Monkey')"
                value={newSongTitle}
                onChange={(e) => setNewSongTitle(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addSong()}
                className="flex-1"
              />
              <Button onClick={addSong} disabled={!newSongTitle.trim()}>
                <Plus className="h-4 w-4 mr-2" /> Add Song
              </Button>
              <Button
                variant={isCircular ? "secondary" : "outline"}
                onClick={() => setIsCircular(!isCircular)}
                className="flex items-center gap-1"
              >
                <Repeat className="h-4 w-4" />
                {isCircular ? "Loop On" : "Loop Off"}
              </Button>
            </div>

            <div className="min-h-[160px] flex items-center justify-center overflow-x-auto py-4">
              {songs.length === 0 ? (
                <p className="text-muted-foreground">Your playlist is empty. Add some songs!</p>
              ) : (
                <div className="flex items-center gap-6 relative">
                  {songs.map((song, idx) => (
                    <div
                      key={song.id}
                      className={`
                        w-40 p-3 rounded-lg border-2 flex flex-col items-center justify-center text-center
                        transition-all duration-300 relative
                        ${
                          song.isRemoved
                            ? "opacity-40 line-through bg-red-50"
                            : song.isPlaying
                            ? "bg-blue-100 border-blue-500 scale-105 shadow-md"
                            : song.isHighlighted
                            ? "bg-accent/20 border-accent"
                            : "bg-card border-border"
                        }
                      `}
                    >
                      <div className="font-medium text-sm truncate w-full">{song.title}</div>
                      <div className="text-xs text-muted-foreground mt-1">Track {idx + 1}</div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="absolute -top-2 -right-2 h-6 w-6 p-0"
                        onClick={() => removeSong(idx)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}

                  {songs.length > 1 && (
                    <div className="absolute top-1/2 left-0 right-0 flex justify-between px-20 -z-10">
                      {songs.slice(0, -1).map((_, i) => (
                        <ChevronRight key={i} className="h-6 w-6 text-accent" />
                      ))}
                    </div>
                  )}

                  {isCircular && songs.length > 1 && (
                    <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-accent/30 -z-10">
                      <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2">
                        <Repeat className="h-5 w-5 text-accent rotate-90" />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={playPrevious}
                disabled={songs.length === 0 || currentSongIndex === null}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant={isPlaying ? "destructive" : "default"}
                onClick={() => {
                  if (isPlaying) {
                    setIsPlaying(false)
                  } else if (songs.length > 0) {
                    playFrom(currentSongIndex ?? 0)
                  }
                }}
                disabled={songs.length === 0}
              >
                {isPlaying ? "Pause" : "Play"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={playNext}
                disabled={songs.length === 0 || currentSongIndex === null}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {currentSongIndex !== null && (
              <div className="text-center text-sm text-muted-foreground">
                Now Playing:{" "}
                <span className="font-medium text-foreground">
                  {songs[currentSongIndex]?.title}
                </span>
              </div>
            )}

            {history.length > 0 && (
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground mb-2">Activity Log</p>
                <div className="flex flex-wrap gap-2">
                  {history.slice(-3).map((msg, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {msg}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </VisualizerLayout>
  )
}