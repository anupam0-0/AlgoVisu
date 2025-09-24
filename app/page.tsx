import { FaGithub } from "react-icons/fa";

import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import Link from "next/link";
import { ArrowRight, BookOpen, Code, Zap, Users } from "lucide-react";

import { AuroraText } from "@/components/ui/aurora-text";
import { RainbowButton } from "@/components/ui/rainbow-button";
import Header from "@/components/header"


export default function HomePage() {
  const features = [
    {
      icon: <Code className="h-6 w-6" />,
      title: "Interactive Visualizations",
      description:
        "Step-by-step animations for arrays, linked lists, trees, graphs, and sorting algorithms",
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Real-time Controls",
      description:
        "Play, pause, step forward/backward through algorithm execution with adjustable speed",
    },
    {
      icon: <BookOpen className="h-6 w-6" />,
      title: "Educational Content",
      description:
        "Comprehensive explanations of time/space complexity and real-world applications",
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Student-Friendly",
      description:
        "Designed for computer science students, bootcamp participants, and educators",
    },
  ];

  const dataStructures = [
    "Arrays",
    "Linked Lists",
    "Stacks",
    "Queues",
    "Binary Trees",
    "Graphs",
  ];

  const algorithms = [
    "Bubble Sort",
    "Merge Sort",
    "Quick Sort",
    "BFS",
    "DFS",
    "Dijkstra's Algorithm",
  ];

  return (
    <div className="min-h-screen ">
      
      {/* Header */}
      <Header />

      {/* Hero Section */}
        <section className="py-28 px-4 w-full relative overflow-hidden ">
           {/* <Particles color="#00f" className='absolute' /> */}
          <div className="container mx-auto text-center max-w-4xl">
            <Badge variant="secondary" className="mb-4">
              Interactive Learning Tool
            </Badge>
            <h1 className="text-4xl md:text-6xl font-extrabold text-primary  text-balance mb-8">
              Visualization Tool for Real-Time <AuroraText>Algorithm</AuroraText> and Comprehensive
              Exploration
            </h1>
            <p className="text-xl text-muted-foreground font-medium mb-8 max-w-2xl text-pretty  mx-auto">
              Transform complex computer science concepts into clear,
              interactive animations. Perfect for students, educators, and
              anyone learning DSA fundamentals.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <RainbowButton size="lg" >

                <Link href="/visualizers" className='inline-flex'>
                  Start Visualizing <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                 </RainbowButton>

               <RainbowButton size="lg" variant="outline" className='text-primary'><Link href="/about">Learn More</Link></RainbowButton>
            </div>
          </div>
        </section>

      {/* Features Section */}
      <section className="py-24 px-4 border-2 border-primary bg-orange-200">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Why Choose out DSA Visualizer?
            </h2>
            <p className="text-primary/60 tracking-wide text-lg max-w-2xl mx-auto">
              Our interactive approach makes complex algorithms easy to
              understand and remember
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="text-center border-2 border-primary relative">
                <CardHeader>
                  <div className="mx-auto h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600">
                    {feature.icon}
                  </div>                  
                </CardHeader>
                <CardContent>
                  <CardTitle className="text-lg pb-2 ">{feature.title}</CardTitle>
                  <CardDescription className=" text-primary/80  ">{feature.description}</CardDescription>
                </CardContent>
                {/* <div className="absolute h-full w-full rounded-2xl  bg-primary -right-2 -bottom-2 -z-[10]" ></div> */}
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
            <Card >
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
      <section className="py-20 px-4 ">
        <div className="container mx-auto text-center max-w-6xl py-28 bg-primary rounded-2xl">
          <h2 className="text-3xl font-bold mb-4 text-secondary">Ready to Start Learning?</h2>
          <p className="text-secondary/60 text-lg mb-16">
            Join thousands of students who have improved their understanding of
            data structures and algorithms
          </p>
          <RainbowButton size="lg" >
                <Link href="/visualizers" className='inline-flex'>
                  Explore Visualizers <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                 </RainbowButton>
        </div>
      </section>
    </div>
  );
}
