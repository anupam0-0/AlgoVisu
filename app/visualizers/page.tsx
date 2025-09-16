import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import { Button } from "../../components/ui/button"
import Link from "next/link"
import { ArrowLeft, Play, BarChart3, GitBranch, Layers, Network, Shuffle } from "lucide-react"

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
    },
    {
      id: "stack",
      title: "Stack Visualizer",
      description: "LIFO operations with push, pop, and peek",
      icon: <Layers className="h-6 w-6" />,
      difficulty: "Beginner",
      topics: ["Stack", "LIFO", "Expression Evaluation"],
      available: true,
    },
    {
      id: "queue",
      title: "Queue Visualizer",
      description: "FIFO operations with push, pop, and peek",
      icon: <Layers className="h-6 w-6" />,
      difficulty: "Beginner",
      topics: ["Queue", "FIFO", "Expression Evaluation"],
      available: false,
    },
    {
      id: "sorting",
      title: "Sorting Algorithms",
      description: "Compare different sorting algorithms side by side",
      icon: <Shuffle className="h-6 w-6" />,
      difficulty: "Intermediate",
      topics: ["Bubble Sort", "Selection Sort", "Insertion Sort"],
      available: true,
    },
    {
      id: "tree",
      title: "Tree Visualizer",
      description: "Binary trees, BST, and tree traversals",
      icon: <GitBranch className="h-6 w-6" />,
      difficulty: "Intermediate",
      topics: ["Binary Tree", "BST", "Traversals", "Insert/Delete"],
      available: true,
    },
    {
      id: "graph",
      title: "Graph Algorithms",
      description: "BFS, DFS, shortest path algorithms",
      icon: <Network className="h-6 w-6" />,
      difficulty: "Advanced",
      topics: ["BFS", "DFS", "Graph Traversal", "Shortest Path"],
      available: true,
    },
    {
      id: "mst",
      title: "Mininum Spanning Tree Visualizer",
      description: "Kruskal's and Prim's algorithms",
      icon: <Network className="h-6 w-6" />,
      difficulty: "Advanced",
      topics: ["Kruskal's", "Prim's"],
      available: false,
    },
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Link>
              </Button>
              <h1 className="text-xl font-bold text-foreground">DSA Visualizers</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Choose Your Learning Path</h1>
          <p className="text-muted-foreground text-lg">
            Select a visualizer to start exploring data structures and algorithms interactively
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visualizers.map((visualizer) => (
            <Card key={visualizer.id} className={`relative ${!visualizer.available ? "opacity-60" : ""}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-accent/10 rounded-lg flex items-center justify-center text-accent">
                      {visualizer.icon}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{visualizer.title}</CardTitle>
                      <Badge className={`text-xs mt-1 ${getDifficultyColor(visualizer.difficulty)}`}>
                        {visualizer.difficulty}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">{visualizer.description}</CardDescription>
                <div className="flex flex-wrap gap-1 mb-4">
                  {visualizer.topics.map((topic, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
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
                  <Badge variant="secondary">Coming Soon</Badge>
                </div>
              )}
            </Card>
          ))}
        </div>

        {/* Learning Tips */}
        <div className="mt-12 bg-muted/30 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Learning Tips</h2>
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
