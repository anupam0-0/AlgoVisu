"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { VisualizerLayout } from "../../../components/visualizer-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Badge } from "../../../components/ui/badge"
import { Plus, RefreshCcw, Search, Trash2, Zap, Users } from "lucide-react"

// -----------------------------
// Types & Keys
// -----------------------------
type PlayerID = string

interface Player {
  id: PlayerID
  name: string
  score: number
  // extra metadata could be added here (country, avatar url, etc.)
}

interface Key {
  // higher score sorts first; ties broken by name (asc) then id (asc)
  score: number
  name: string
  id: PlayerID
}

interface AVLNode {
  key: Key
  left: AVLNode | null
  right: AVLNode | null
  height: number
  size: number // subtree node count for rank queries
  id: string   // stable render id
}

const cmpKey = (a: Key, b: Key): number => {
  // We want descending by score: higher score comes "before"
  if (a.score !== b.score) return b.score - a.score
  // tie-break by name (ascending)
  if (a.name !== b.name) return a.name < b.name ? -1 : 1
  // final tie-break by id (ascending)
  if (a.id === b.id) return 0
  return a.id < b.id ? -1 : 1
}

let NODE_ID = 0
const makeNode = (key: Key): AVLNode => ({
  key,
  left: null,
  right: null,
  height: 1,
  size: 1,
  id: `node-${++NODE_ID}`,
})

const h = (n: AVLNode | null) => (n ? n.height : 0)
const sz = (n: AVLNode | null) => (n ? n.size : 0)
const update = (n: AVLNode) => {
  n.height = Math.max(h(n.left), h(n.right)) + 1
  n.size = sz(n.left) + sz(n.right) + 1
}
const balanceFactor = (n: AVLNode | null) => (n ? h(n.left) - h(n.right) : 0)

const rotateRight = (y: AVLNode): AVLNode => {
  const x = y.left!
  const T2 = x.right
  x.right = y
  y.left = T2
  update(y)
  update(x)
  return x
}
const rotateLeft = (x: AVLNode): AVLNode => {
  const y = x.right!
  const T2 = y.left
  y.left = x
  x.right = T2
  update(x)
  update(y)
  return y
}

const rebalance = (node: AVLNode): AVLNode => {
  update(node)
  const bf = balanceFactor(node)
  if (bf > 1) {
    // left heavy
    if (balanceFactor(node.left) < 0) node.left = rotateLeft(node.left!)
    return rotateRight(node)
  }
  if (bf < -1) {
    // right heavy
    if (balanceFactor(node.right) > 0) node.right = rotateRight(node.right!)
    return rotateLeft(node)
  }
  return node
}

// standard BST insert with AVL rebalancing
const insertNode = (root: AVLNode | null, key: Key): AVLNode => {
  if (!root) return makeNode(key)
  const c = cmpKey(key, root.key)
  if (c < 0) root.left = insertNode(root.left, key)
  else if (c > 0) root.right = insertNode(root.right, key)
  else {
    // equal key (same (score, name, id)): overwrite
    root.key = key
    return root
  }
  return rebalance(root)
}

// min node helper
const minNode = (n: AVLNode): AVLNode => (n.left ? minNode(n.left) : n)

// delete by key
const deleteNode = (root: AVLNode | null, key: Key): AVLNode | null => {
  if (!root) return null
  const c = cmpKey(key, root.key)
  if (c < 0) root.left = deleteNode(root.left, key)
  else if (c > 0) root.right = deleteNode(root.right, key)
  else {
    // found
    if (!root.left || !root.right) {
      return root.left || root.right
    } else {
      const succ = minNode(root.right)
      root.key = succ.key
      root.right = deleteNode(root.right, succ.key)
    }
  }
  return rebalance(root)
}

// rank (1-based): number of nodes strictly "before" + 1
// Since cmpKey sorts descending by score, "before" means: go right for lower, left for higher? Careful.
// We defined: cmpKey(a,b) negative => a goes to LEFT of b in tree.
// Therefore, in-order traversal yields ASCENDING by our comparator.
// But we want rank where "best" (highest score) has rank 1.
// We'll compute rank by counting how many keys compare LESS (i.e., c > 0 means a should be right).
const getRankOfKey = (root: AVLNode | null, key: Key): number | null => {
  let rank = 1
  let curr = root
  while (curr) {
    const c = cmpKey(key, curr.key)
    if (c < 0) {
      // key should be in LEFT subtree (key is "less" by comparator → better position)
      // no nodes skipped
      curr = curr.left
    } else if (c > 0) {
      // key is in RIGHT subtree (key "greater" by comparator → worse position)
      // we skip left subtree + current node
      rank += sz(curr.left) + 1
      curr = curr.right
    } else {
      // equal
      rank += sz(curr.left)
      return rank
    }
  }
  return null
}

// topN via reverse in-order using comparator to yield best-first
const collectTopN = (root: AVLNode | null, n: number, acc: Key[] = []): Key[] => {
  if (!root || acc.length >= n) return acc
  // best entries are in LEFT subtree (since cmpKey negative goes left)
  collectTopN(root.left, n, acc)
  if (acc.length < n) acc.push(root.key)
  if (acc.length < n) collectTopN(root.right, n, acc)
  return acc
}

// utility to generate unique IDs
const uid = () => Math.random().toString(36).slice(2, 9)

// -----------------------------
// Component
// -----------------------------
export default function LeaderboardPage() {
  const [root, setRoot] = useState<AVLNode | null>(null)
  const [players, setPlayers] = useState<Map<PlayerID, Player>>(new Map())

  // form inputs
  const [name, setName] = useState("")
  const [score, setScore] = useState<number | "">("")
  const [topCount, setTopCount] = useState<number>(10)
  const [queryName, setQueryName] = useState("")

  // diagram sizing
  const containerRef = useRef<HTMLDivElement | null>(null)

  // -----------------------------
  // Core operations
  // -----------------------------
  const keyOf = (p: Player): Key => ({ score: p.score, name: p.name, id: p.id })

  const upsertPlayer = (name: string, score: number) => {
    if (!name.trim()) return
    const byName = [...players.values()].find((p) => p.name.toLowerCase() === name.toLowerCase())
    let nextRoot = root

    if (byName) {
      // remove old key
      nextRoot = deleteNode(nextRoot, keyOf(byName))
      const updated: Player = { ...byName, score }
      nextRoot = insertNode(nextRoot, keyOf(updated))
      setPlayers((prev) => {
        const copy = new Map(prev)
        copy.set(updated.id, updated)
        return copy
      })
    } else {
      const p: Player = { id: uid(), name: name.trim(), score }
      nextRoot = insertNode(nextRoot, keyOf(p))
      setPlayers((prev) => {
        const copy = new Map(prev)
        copy.set(p.id, p)
        return copy
      })
    }
    setRoot(nextRoot)
  }

  const removeByName = (name: string) => {
    const byName = [...players.values()].find((p) => p.name.toLowerCase() === name.toLowerCase())
    if (!byName) return
    const next = deleteNode(root, keyOf(byName))
    setRoot(next)
    setPlayers((prev) => {
      const copy = new Map(prev)
      copy.delete(byName.id)
      return copy
    })
  }

  const rankOfName = (name: string): number | null => {
    const byName = [...players.values()].find((p) => p.name.toLowerCase() === name.toLowerCase())
    if (!byName) return null
    return getRankOfKey(root, keyOf(byName))
  }

  const topN = (n: number): Player[] => {
    const keys = collectTopN(root, n)
    const out: Player[] = []
    for (const k of keys) {
      const p = [...players.values()].find((x) => x.id === k.id)
      if (p) out.push(p)
    }
    return out
  }

  // -----------------------------
  // Demo / Simulator
  // -----------------------------
  const demoNames = useMemo(
    () => ["Ava", "Noah", "Liam", "Mia", "Ishan", "Zara", "Arjun", "Kiara", "Vivaan", "Anaya", "Ivy", "Leo"],
    []
  )

  const seedDemo = () => {
    let nextRoot: AVLNode | null = null
    const next = new Map<PlayerID, Player>()
    for (let i = 0; i < demoNames.length; i++) {
      const p: Player = { id: uid(), name: demoNames[i], score: Math.floor(Math.random() * 2000) }
      nextRoot = insertNode(nextRoot, keyOf(p))
      next.set(p.id, p)
    }
    setPlayers(next)
    setRoot(nextRoot)
  }

  const tickRandomUpdate = () => {
    if (players.size === 0) return
    const list = [...players.values()]
    const target = list[Math.floor(Math.random() * list.length)]
    const delta = Math.random() < 0.6 ? Math.ceil(Math.random() * 50) : -Math.ceil(Math.random() * 30)
    const newScore = Math.max(0, target.score + delta)
    // reinsert
    let nextRoot = deleteNode(root, keyOf(target))
    const updated: Player = { ...target, score: newScore }
    nextRoot = insertNode(nextRoot, keyOf(updated))
    const next = new Map(players)
    next.set(updated.id, updated)
    setPlayers(next)
    setRoot(nextRoot)
  }

  // -----------------------------
  // Render helpers
  // -----------------------------
  const renderNode = (node: AVLNode | null): JSX.Element | null => {
    if (!node) return null
    return (
      <motion.div
        key={`${node.id}-${node.key.id}-${node.key.score}`}
        layout
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="flex flex-col items-center"
      >
        <motion.div
          layout
          className="min-w-40 px-3 py-2 rounded-2xl border-2 bg-background relative shadow-sm"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="font-semibold truncate max-w-[140px]">{node.key.name}</div>
            <Badge variant="secondary" className="text-xs">{node.key.score}</Badge>
          </div>
          <div className="text-[10px] text-muted-foreground mt-1">h:{node.height} • sz:{node.size}</div>
        </motion.div>

        <div className="flex gap-8 mt-3">
          <AnimatePresence mode="popLayout">
            {node.left && <motion.div key={`L-${node.left.id}`} layout>{renderNode(node.left)}</motion.div>}
          </AnimatePresence>
          <AnimatePresence mode="popLayout">
            {node.right && <motion.div key={`R-${node.right.id}`} layout>{renderNode(node.right)}</motion.div>}
          </AnimatePresence>
        </div>
      </motion.div>
    )
  }

  const topList = topN(topCount)

  return (
    <VisualizerLayout
      title="Real-time Leaderboard (AVL-backed)"
      description="An ordered leaderboard powered by an AVL tree: always balanced, always O(log n) for inserts, updates, deletes, rank queries, and Top-N."
      difficulty="Intermediate"
      complexity={{
        time: "Insert/Update/Delete/Rank: O(log n)",
        space: "O(n)",
      }}
      
    >
      <div className="w-full space-y-8">
        {/* Intro / Explanation */}
        <Card className="bg-orange-50 border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5" />
              How this works
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-sm text-gray-700 leading-relaxed space-y-2">
              <p>
                This leaderboard keeps players ordered by <strong>score (descending)</strong> using an{" "}
                <em>AVL Tree</em>. Every add, update, or delete operation rebalances the tree so that it stays
                near-perfectly balanced.
              </p>
              <ul className="list-disc pl-5">
                <li><strong>Ordered inserts:</strong> players slot into the correct position by score in O(log n).</li>
                <li><strong>Stable tie-breakers:</strong> ties resolve by name, then by an internal ID.</li>
                <li><strong>Rank queries:</strong> subtree sizes let us compute a player’s 1-based rank in O(log n).</li>
                <li><strong>Top-N:</strong> collect the first N entries from the left-biased in-order traversal.</li>
                <li><strong>Real-time:</strong> simulate frequent updates without losing performance.</li>
              </ul>
              <p className="pt-1">
                This pattern scales well for in-memory leaderboards (game servers, hackathons, classrooms) and can be
                persisted by periodically snapshotting the tree or mirroring updates to a database.
              </p>
            </CardDescription>
          </CardContent>
        </Card>

        {/* Controls */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Add / Update Player</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Input
                placeholder="Player name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="min-w-[160px]"
              />
              <Input
                type="number"
                placeholder="Score"
                value={score}
                onChange={(e) => setScore(e.target.value === "" ? "" : Number(e.target.value))}
                className="w-32"
              />
              <Button
                onClick={() => {
                  if (name.trim() && score !== "") {
                    upsertPlayer(name, Number(score))
                    setScore("")
                    setName("")
                  }
                }}
                className="gap-1"
              >
                <Plus className="h-4 w-4" /> Save
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  if (name.trim()) {
                    removeByName(name)
                    setName("")
                  }
                }}
                className="gap-1"
              >
                <Trash2 className="h-4 w-4" /> Remove
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="flex gap-2 flex-wrap">
              <Button variant="outline" onClick={seedDemo} className="gap-1">
                <RefreshCcw className="h-4 w-4" /> Seed Demo
              </Button>
              <Button variant="outline" onClick={tickRandomUpdate} className="gap-1">
                <Zap className="h-4 w-4" /> Random Update
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Rank & Top-N */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Find Rank</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-2 flex-wrap">
              <Input
                placeholder="Player name"
                value={queryName}
                onChange={(e) => setQueryName(e.target.value)}
                className="min-w-[160px]"
              />
              <Button variant="outline" className="gap-1">
                <Search className="h-4 w-4" /> Check
              </Button>
              <div className="text-sm">
                {queryName.trim()
                  ? (() => {
                      const r = rankOfName(queryName)
                      return r ? <span><strong>{queryName}</strong> is currently <strong>#{r}</strong></span>
                              : <span className="text-muted-foreground">No such player.</span>
                    })()
                  : <span className="text-muted-foreground">Enter a name to view rank.</span>
                }
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Top-N</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-2">
              <Input
                type="number"
                className="w-28"
                value={topCount}
                onChange={(e) => setTopCount(Math.max(1, Number(e.target.value || 1)))}
              />
              <div className="text-sm text-muted-foreground">Show best N players</div>
            </CardContent>
            <CardContent className="pt-0">
              <div className="rounded-lg border">
                <div className="grid grid-cols-12 text-xs font-semibold px-3 py-2 bg-muted">
                  <div className="col-span-2">Rank</div>
                  <div className="col-span-7">Player</div>
                  <div className="col-span-3 text-right">Score</div>
                </div>
                {topList.map((p, i) => (
                  <div key={p.id} className="grid grid-cols-12 px-3 py-2 border-t items-center">
                    <div className="col-span-2">
                      <Badge variant="secondary">#{i + 1}</Badge>
                    </div>
                    <div className="col-span-7 truncate">{p.name}</div>
                    <div className="col-span-3 text-right font-medium">{p.score}</div>
                  </div>
                ))}
                {topList.length === 0 && (
                  <div className="px-3 py-6 text-sm text-muted-foreground text-center">No players yet.</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Visualization */}
        <Card>
          <CardHeader>
            <CardTitle>AVL Tree Diagram</CardTitle>
            <CardDescription>
              Players are placed so that higher scores appear toward the left side of the tree.
              The view below is scrollable and roomy for larger datasets.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              ref={containerRef}
              className="min-h-[420px] p-4 bg-muted/10 rounded border overflow-auto"
            >
              <div className="w-full flex justify-center py-4">
                <AnimatePresence mode="popLayout">
                  {root ? (
                    renderNode(root)
                  ) : (
                    <div className="text-muted-foreground italic">Leaderboard is empty</div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notes / Legend */}
        <Card>
          <CardHeader>
            <CardTitle>Notes & Legend</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <p>
              Each node shows <strong>name</strong>, <strong>score</strong>, and small metrics:
              <code className="mx-1">h</code> (height) and <code className="mx-1">sz</code> (subtree size).
              Rank is computed using subtree sizes in O(log n).
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <div className="min-w-40 px-3 py-2 rounded-2xl border-2 bg-background shadow-sm"><span className="text-xs">node</span></div>
                <span>Player entry</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">1234</Badge>
                <span>Current score</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </VisualizerLayout>
  )
}
