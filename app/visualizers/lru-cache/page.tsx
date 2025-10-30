"use client"

import { useState, useEffect } from "react"
import { VisualizerLayout } from "../../../components/visualizer-layout"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "../../../components/ui/badge"
import { Plus, Trash2, Zap, ArrowLeft, ArrowRight } from "lucide-react"

interface CacheNode {
    key: string
    value: string
    isHighlighted?: boolean
    isEvicted?: boolean
    isAccessed?: boolean
}

export default function LRUCacheApplication() {
    const [capacity, setCapacity] = useState<number>(3)
    const [keyInput, setKeyInput] = useState("")
    const [valueInput, setValueInput] = useState("")
    const [cache, setCache] = useState<CacheNode[]>([
        { key: "A", value: "1" },
        { key: "B", value: "2" },
        { key: "C", value: "3" },
    ])
    const [history, setHistory] = useState<string[]>([
        "Initialized cache with capacity 3",
        'put("A", "1")',
        'put("B", "2")',
        'put("C", "3")',
    ])
    const [isPlaying, setIsPlaying] = useState(false)

    // Reset to initial state
    const resetCache = () => {
        setCache([
            { key: "A", value: "1" },
            { key: "B", value: "2" },
            { key: "C", value: "3" },
        ])
        setHistory([
            "Initialized cache with capacity 3",
            'put("A", "1")',
            'put("B", "2")',
            'put("C", "3")',
        ])
        setKeyInput("")
        setValueInput("")
    }

    // Move node to front (most recently used)
    const moveToHead = (node: CacheNode) => {
        setCache(prev => {
            const filtered = prev.filter(n => n.key !== node.key)
            return [{ ...node, isAccessed: true }, ...filtered]
        })
        setTimeout(() => {
            setCache(prev => prev.map(n => ({ ...n, isAccessed: false })))
        }, 800)
    }

    // Evict tail (LRU)
    const evictTail = () => {
        if (cache.length === 0) return null
        const evicted = cache[cache.length - 1]
        setCache(prev => prev.map((n, i) => i === prev.length - 1 ? { ...n, isEvicted: true } : n))
        setHistory(prev => [...prev, `Evicted LRU: ${evicted.key} → ${evicted.value}`])
        setTimeout(() => {
            setCache(prev => prev.slice(0, -1))
        }, 600)
        return evicted
    }

    const handleGet = () => {
        if (!keyInput.trim()) return
        const key = keyInput.trim()
        const node = cache.find(n => n.key === key)

        if (node) {
            setHistory(prev => [...prev, `get("${key}") → ${node.value}`])
            moveToHead(node)
        } else {
            setHistory(prev => [...prev, `get("${key}") → MISS`])
        }
        setKeyInput("")
    }

    const handlePut = () => {
        if (!keyInput.trim() || !valueInput.trim()) return
        const key = keyInput.trim()
        const value = valueInput.trim()

        const existingIndex = cache.findIndex(n => n.key === key)

        if (existingIndex !== -1) {
            // Update existing: move to head
            const updatedNode = { key, value, isHighlighted: true }
            setCache(prev => {
                const filtered = prev.filter(n => n.key !== key)
                return [updatedNode, ...filtered]
            })
            setHistory(prev => [...prev, `put("${key}", "${value}") → UPDATED`])
            setTimeout(() => {
                setCache(prev => prev.map(n => ({ ...n, isHighlighted: false })))
            }, 800)
        } else {
            // New key
            if (cache.length >= capacity) {
                evictTail()
            }
            const newNode: CacheNode = { key, value, isHighlighted: true }
            setCache(prev => [newNode, ...prev])
            setHistory(prev => [...prev, `put("${key}", "${value}")`])
            setTimeout(() => {
                setCache(prev => prev.map(n => ({ ...n, isHighlighted: false })))
            }, 800)
        }

        setKeyInput("")
        setValueInput("")
    }

    return (
        <VisualizerLayout
            title="LRU Cache Simulator"
            description="See how doubly linked lists + hash maps enable O(1) caching in Redis, browsers, and databases"
            difficulty="Advanced"
            complexity={{
                time: "O(1) get/put",
                space: "O(capacity)",
            }}
            applications={[]}
        >
            
            <div className="w-full space-y-6">
                {/* Explanation Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Zap className="h-5 w-5 text-yellow-600" />
                            How LRU Caching Works
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-muted-foreground">
                        <p>
                            An LRU (Least Recently Used) cache stores frequently accessed data for fast retrieval.
                            When full, it removes the <strong>least recently used</strong> item.
                        </p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>
                                <strong>Doubly linked list</strong> maintains access order: head = most recent, tail = least recent.
                            </li>
                            <li>
                                <strong>Hash map</strong> (not shown) provides O(1) key lookup — points to nodes in the list.
                            </li>
                            <li>
                                On <code>get(key)</code> or <code>put(key)</code>, the node moves to the <strong>head</strong>.
                            </li>
                            <li>
                                On <code>put()</code> when full, the <strong>tail</strong> is evicted instantly (O(1)).
                            </li>
                        </ul>
                        <p>
                            Used in Redis, CPU caches, web browsers, and database buffer pools for high-speed data access.
                        </p>
                    </CardContent>
                </Card>

                {/* Interactive Implementation */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Zap className="h-5 w-5 text-accent" />
                            Cache Simulator (Capacity: {capacity})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Controls */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Key</label>
                                <Input
                                    placeholder="e.g., user:123"
                                    value={keyInput}
                                    onChange={(e) => setKeyInput(e.target.value)}
                                    onKeyPress={(e) => e.key === "Enter" && handleGet()}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Value</label>
                                <Input
                                    placeholder="e.g., John Doe"
                                    value={valueInput}
                                    onChange={(e) => setValueInput(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <Button onClick={handleGet} disabled={!keyInput.trim()}>
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Get
                            </Button>
                            <Button onClick={handlePut} disabled={!keyInput.trim() || !valueInput.trim()}>
                                <ArrowRight className="h-4 w-4 mr-2" />
                                Put
                            </Button>
                            <Button variant="outline" onClick={resetCache}>
                                <Trash2 className="h-4 w-4 mr-2" />
                                Reset
                            </Button>
                        </div>

                        {/* Cache Visualization */}
                        <div className="min-h-[160px] flex items-center justify-center overflow-x-auto py-4">
                            {cache.length === 0 ? (
                                <p className="text-muted-foreground">Cache is empty</p>
                            ) : (
                                <div className="flex items-center gap-6 relative">
                                    {/* HEAD indicator */}
                                    <div className="flex flex-col items-center mr-4">
                                        <div className="text-xs text-muted-foreground mb-1">HEAD<br />(Most Recent)</div>
                                        <div className="w-8 h-0.5 bg-primary"></div>
                                    </div>

                                    {cache.map((node, idx) => (
                                        <div
                                            key={node.key}
                                            className={`
                        w-32 p-3 rounded-lg border-2 flex flex-col items-center justify-center text-center
                        transition-all duration-300 relative
                        ${node.isEvicted
                                                    ? "opacity-40 line-through bg-red-50"
                                                    : node.isAccessed
                                                        ? "bg-green-100 border-green-500 scale-105 shadow-md"
                                                        : node.isHighlighted
                                                            ? "bg-accent/20 border-accent scale-105"
                                                            : "bg-card border-border"
                                                }
                      `}
                                        >
                                            <div className="font-mono text-sm font-bold">{node.key}</div>
                                            <div className="text-xs text-muted-foreground mt-1">{node.value}</div>
                                            {idx === cache.length - 1 && (
                                                <div className="absolute -bottom-6 text-xs text-muted-foreground whitespace-nowrap">
                                                    TAIL (LRU)
                                                </div>
                                            )}
                                        </div>
                                    ))}

                                    {/* TAIL indicator */}
                                    <div className="flex flex-col items-center ml-4">
                                        <div className="w-8 h-0.5 bg-primary"></div>
                                        <div className="text-xs text-muted-foreground mt-1 hidden">TAIL</div>
                                    </div>

                                    {/* Arrows */}
                                    {cache.length > 1 && (
                                        <div className="absolute top-1/2 left-0 right-0 flex justify-between px-24 -z-10">
                                            {cache.slice(0, -1).map((_, i) => (
                                                <ArrowRight key={i} className="h-5 w-5 text-accent" />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* History Log */}
                        {history.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-border">
                                <p className="text-xs text-muted-foreground mb-2">Activity Log</p>
                                <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                                    {history.slice(-5).map((msg, i) => (
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