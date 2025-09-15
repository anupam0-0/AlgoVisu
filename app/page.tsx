import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import Link from "next/link"
import { ArrowRight, BookOpen, Code, Zap, Users } from "lucide-react"

export default function HomePage() {
  const features = [
    {
      icon: <Code className="h-6 w-6" />,
      title: "Interactive Visualizations",
      description: "Step-by-step animations for arrays, linked lists, trees, graphs, and sorting algorithms",
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Real-time Controls",
      description: "Play, pause, step forward/backward through algorithm execution with adjustable speed",
    },
    {
      icon: <BookOpen className="h-6 w-6" />,
      title: "Educational Content",
      description: "Comprehensive explanations of time/space complexity and real-world applications",
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Student-Friendly",
      description: "Designed for computer science students, bootcamp participants, and educators",
    },
  ]

  const dataStructures = ["Arrays", "Linked Lists", "Stacks", "Queues", "Binary Trees", "Graphs"]

  const algorithms = ["Bubble Sort", "Merge Sort", "Quick Sort", "BFS", "DFS", "Dijkstra's Algorithm"]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-accent rounded-lg flex items-center justify-center">
                <Code className="h-5 w-5 text-accent-foreground" />
              </div>
              <h1 className="text-xl font-bold text-foreground">DSA Visualizer</h1>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/visualizers" className="text-muted-foreground hover:text-foreground transition-colors">
                Visualizers
              </Link>
              <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">
                About
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <Badge variant="secondary" className="mb-4">
            Interactive Learning Tool
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-balance mb-6">
            Master Data Structures & Algorithms Through <span className="text-accent">Visualization</span>
          </h1>
          <p className="text-xl text-muted-foreground text-balance mb-8 max-w-2xl mx-auto">
            Transform complex computer science concepts into clear, interactive animations. Perfect for students,
            educators, and anyone learning DSA fundamentals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-accent hover:bg-accent/90">
              <Link href="/visualizers">
                Start Visualizing <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/about">Learn More</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose DSA Visualizer?</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Our interactive approach makes complex algorithms easy to understand and remember
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="text-center">
                <CardHeader>
                  <div className="mx-auto mb-4 h-12 w-12 bg-accent/10 rounded-lg flex items-center justify-center text-accent">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* What You'll Learn Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">What You'll Learn</h2>
            <p className="text-muted-foreground text-lg">
              Comprehensive coverage of fundamental computer science concepts
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-chart-1 rounded-full"></div>
                  Data Structures
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {dataStructures.map((ds, index) => (
                    <Badge key={index} variant="outline">
                      {ds}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-chart-2 rounded-full"></div>
                  Algorithms
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {algorithms.map((algo, index) => (
                    <Badge key={index} variant="outline">
                      {algo}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-accent/5">
        <div className="container mx-auto text-center max-w-3xl">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Learning?</h2>
          <p className="text-muted-foreground text-lg mb-8">
            Join thousands of students who have improved their understanding of data structures and algorithms
          </p>
          <Button asChild size="lg" className="bg-accent hover:bg-accent/90">
            <Link href="/visualizers">
              Explore Visualizers <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4">
        <div className="container mx-auto text-center">
          <p className="text-muted-foreground">Built for computer science education</p>
        </div>
      </footer>
    </div>
  )
}
