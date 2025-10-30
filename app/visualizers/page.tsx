import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import { Button } from "../../components/ui/button"
import Link from "next/link"
import Header from "@/components/header"
import { ArrowLeft, Play, BarChart3, GitBranch, Layers, Network, Music, Zap, Sigma, ImageIcon, Search, Shuffle } from "lucide-react"

export default function VisualizersPage() {
  const visualizers = [
    {
      id: "array",
      title: "Array Visualizer",
      description: "Interactive array operations and basic algorithms",
      icon: <BarChart3 className="h-6 w-6" />,
      difficulty: "Beginner",
      topics: ["Arrays", "Linear Search", "Binary Search"],
      available: true,
      type: "visualizer"
    },
    {
      id: "stack",
      title: "Stack Visualizer",
      description: "LIFO operations with push, pop, and peek",
      icon: <Layers className="h-6 w-6" />,
      difficulty: "Beginner",
      topics: ["Stack", "LIFO", "Expression Evaluation"],
      available: true,
      type: "visualizer"
    },
    {
      id: "queue",
      title: "Queue Visualizer",
      description: "FIFO operations with push, pop, and peek",
      icon: <Layers className="h-6 w-6" />,
      difficulty: "Beginner",
      topics: ["Queue", "FIFO", "Expression Evaluation"],
      available: true,
      type: "visualizer"
    },
    {
      id: "sorting",
      title: "Sorting Algorithms",
      description: "Compare different sorting algorithms side by side",
      icon: <Shuffle className="h-6 w-6" />,
      difficulty: "Intermediate",
      topics: ["Bubble Sort", "Selection Sort", "Insertion Sort"],
      available: true,
      type: "visualizer"
    },
    {
      id: "tree",
      title: "Tree Visualizer",
      description: "Binary trees, BST, and tree traversals",
      icon: <GitBranch className="h-6 w-6" />,
      difficulty: "Intermediate",
      topics: ["Binary Tree", "BST", "Traversals", "Insert/Delete"],
      available: true,
      type: "visualizer"
    },
    {
      id: "graph",
      title: "Graph Algorithms",
      description: "BFS, DFS, shortest path algorithms",
      icon: <Network className="h-6 w-6" />,
      difficulty: "Advanced",
      topics: ["BFS", "DFS", "Graph Traversal", "Shortest Path"],
      available: true,
      type: "visualizer"
    },
    {
      id: "linked-list",
      title: "Linked List Visualizer",
      description: "Single, doubly, and circular linked lists",
      icon: <Network className="h-6 w-6" />,
      difficulty: "Advanced",
      topics: ["Single", "Double", "Circular"],
      available: true,
      type: "visualizer"
    },
    {
      id: "mst",
      title: "Minimum Spanning Tree Visualizer",
      description: "Kruskal's and Prim's algorithms",
      icon: <Network className="h-6 w-6" />,
      difficulty: "Advanced",
      topics: ["Kruskal's", "Prim's"],
      available: true,
      type: "visualizer"
    },
    {
      id: "sna",
      title: "Social Network Analyzer",
      description: "Real-world applications and case studies",
      icon: <Network className="h-6 w-6" />,
      difficulty: "Advanced",
      topics: ["Real-World", "Case Studies"],
      available: true,
      type: "application"
    },
    {
      id: "navigation-system",
      title: "Navigation System Analyzer",
      description: "Real-world applications and case studies",
      icon: <Network className="h-6 w-6" />,
      difficulty: "Advanced",
      topics: ["Real-World", "Case Studies"],
      available: true,
      type: "application"
    },
    {
      id: "music-playlist",
      title: "Music Playlist Manager",
      description: "How linked lists enable dynamic song insertion, deletion, and seamless looping in music apps",
      icon: <Music className="h-6 w-6" />,
      difficulty: "Intermediate",
      topics: ["Real-World", "Media Apps", "User Experience"],
      available: true,
      type: "application"
    },
    {
      id: "lru-cache",
      title: "LRU Cache Simulator",
      description: "How doubly linked lists + hash maps enable O(1) caching in systems like Redis and browsers",
      icon: <Zap className="h-6 w-6" />,
      difficulty: "Advanced",
      topics: ["Systems Design", "Caching", "Performance"],
      available: true,
      type: "application"
    },
    {
      id: "mst-clustering",
      title: "MST Clustering Visualizer",
      description: "How Minimum Spanning Trees enable single-linkage hierarchical clustering and outlier detection in data",
      icon: <GitBranch className="h-6 w-6" />,
      difficulty: "Intermediate",
      topics: ["Clustering", "Graph Algorithms", "Data Analysis"],
      available: true,
      type: "application"
    },
    {
      id: "prefix-search-visualizer",
      title: "Prefix Search Visualizer",
      description: "How linear search over arrays powers real-time autocomplete systems in search engines, IDEs, and command-line tools",
      icon: <Search className="h-6 w-6" />,
      difficulty: "Beginner",
      topics: ["String Algorithms", "User Experience", "Data Structures"],
      available: true,
      type: "application"
    }
  ]

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner":
        return "bg-green-100 text-green-800"
      case "Intermediate":
        return "bg-yellow-100 text-yellow-800"
      case "Advanced":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-orange-200">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="my-8 mb-16">
          <h1 className="text-5xl font-bold mb-4">Choose Your Learning Path</h1>
          <p className="text-primary text-lg">
            Select a visualizer to start exploring data structures and algorithms interactively
          </p>
        </div>

        <div className="space-y-12">
          {/* Visualizers Section */}
          <div>
            <h2 className="text-3xl font-bold mb-6 text-primary flex items-center">
              <BarChart3 className="h-8 w-8 mr-2" />
              Data Structure Visualizers
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {visualizers
                .filter(v => v.type === 'visualizer')
                .map((visualizer) => (
                  <Card key={visualizer.id} className={`relative bg-orange-100 rounded border-4 border-primary ${!visualizer.available ? "opacity-60" : "hover:shadow-lg transition-shadow"}`}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-accent/10 rounded-lg flex items-center justify-center text-accent">
                            {visualizer.icon}
                          </div>
                          <div>
                            <CardTitle className="text-lg text-primary">{visualizer.title}</CardTitle>
                            <Badge className={`text-xs mt-1 border border-primary pointer-events-none ${getDifficultyColor(visualizer.difficulty)}`}>
                              {visualizer.difficulty}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="mb-4 font-medium text-primary">{visualizer.description}</CardDescription>
                      <div className="flex flex-wrap gap-1 mb-4">
                        {visualizer.topics.map((topic, index) => (
                          <Badge key={index} variant="outline" className="text-xs border-2 border-primary rounded bg-orange-50">
                            {topic}
                          </Badge>
                        ))}
                      </div>
                      {visualizer.available ? (
                        <Button asChild className="w-full">
                          <Link href={`/visualizers/${visualizer.id}`}>
                            <Play className="h-4 w-4 mr-2" />
                            Start Learning
                          </Link>
                        </Button>
                      ) : (
                        <Button disabled className="w-full">
                          Coming Soon
                        </Button>
                      )}
                    </CardContent>
                    {!visualizer.available && (
                      <div className="absolute inset-0 bg-background/50 rounded-lg flex items-center justify-center">
                        <h1 className="-rotate-45 font-extrabold text-muted-foreground text-4xl">Coming Soon</h1>
                      </div>
                    )}
                  </Card>
                ))}
            </div>
          </div>

          {/* Applications Section */}
          <div>
            <h2 className="text-3xl font-bold mb-6 text-primary flex items-center">
              <Layers className="h-8 w-8 mr-2" />
              Applications
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {visualizers
                .filter(v => v.type === 'application')
                .map((visualizer) => (
                  <Card key={visualizer.id} className={`relative bg-orange-100 rounded border-4 border-primary ${!visualizer.available ? "opacity-60" : "hover:shadow-lg transition-shadow"}`}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-accent/10 rounded-lg flex items-center justify-center text-accent">
                            {visualizer.icon}
                          </div>
                          <div>
                            <CardTitle className="text-lg text-primary">{visualizer.title}</CardTitle>
                            <Badge className={`text-xs mt-1 border border-primary pointer-events-none ${getDifficultyColor(visualizer.difficulty)}`}>
                              {visualizer.difficulty}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="mb-4 font-medium text-primary">{visualizer.description}</CardDescription>
                      <div className="flex flex-wrap gap-1 mb-4">
                        {visualizer.topics.map((topic, index) => (
                          <Badge key={index} variant="outline" className="text-xs border-2 border-primary rounded bg-orange-50">
                            {topic}
                          </Badge>
                        ))}
                      </div>
                      {visualizer.available ? (
                        <Button asChild className="w-full">
                          <Link href={`/visualizers/${visualizer.id}`}>
                            <Play className="h-4 w-4 mr-2" />
                            Start Learning
                          </Link>
                        </Button>
                      ) : (
                        <Button disabled className="w-full">
                          Coming Soon
                        </Button>
                      )}
                    </CardContent>
                    {!visualizer.available && (
                      <div className="absolute inset-0 bg-background/50 rounded-lg flex items-center justify-center">
                        <h1 className="-rotate-45 font-extrabold text-muted-foreground text-4xl">Coming Soon</h1>
                      </div>
                    )}
                  </Card>
                ))}
            </div>
          </div>
        </div>

        {/* Learning Tips */}
        <div className="mt-16 bg-orange-100 rounded-lg p-6 ">
          <h2 className="text-xl font-semibold mb-4 ">Learning Tips</h2>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div>
              <h3 className="font-medium mb-2">Start Simple</h3>
              <p className="text-muted-foreground">Begin with arrays and stacks before moving to complex structures</p>
            </div>
            <div>
              <h3 className="font-medium mb-2">Use Controls</h3>
              <p className="text-muted-foreground">Step through algorithms slowly to understand each operation</p>
            </div>
            <div>
              <h3 className="font-medium mb-2">Practice</h3>
              <p className="text-muted-foreground">Try different inputs and observe how algorithms behave</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
