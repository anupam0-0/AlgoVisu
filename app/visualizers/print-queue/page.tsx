"use client";

import { useState, useEffect, useRef } from "react";
import { VisualizerLayout } from "@/components/visualizer-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Printer, FileText, Plus } from "lucide-react";

// Fallback for toast if sonner isn't used
const toast = (typeof window !== "undefined" && (window as any).toast) 
  ? (window as any).toast 
  : null;

interface PrintJob {
  id: number;
  name: string;
  pages: number;
  timestamp: number;
  printerId?: number;
}

type PrinterStatus = "idle" | "printing";

export default function PrintQueueVisualizerPage() {
  const [jobs, setJobs] = useState<PrintJob[]>([
    { id: 1, name: "Report.pdf", pages: 5, timestamp: Date.now() - 30000 },
    { id: 2, name: "Invoice.docx", pages: 2, timestamp: Date.now() - 20000 },
  ]);
  const [jobName, setJobName] = useState("Homework.pdf");
  const [pages, setPages] = useState("3");
  const [printer1Status, setPrinter1Status] = useState<PrinterStatus>("idle");
  const [printer2Status, setPrinter2Status] = useState<PrinterStatus>("idle");

  const audioContextRef = useRef<AudioContext | null>(null);
  const isAudioEnabledRef = useRef(false);

  const resetQueue = () => {
    setJobs([
      { id: 1, name: "Report.pdf", pages: 5, timestamp: Date.now() - 30000 },
      { id: 2, name: "Invoice.docx", pages: 2, timestamp: Date.now() - 20000 },
    ]);
    setPrinter1Status("idle");
    setPrinter2Status("idle");
  };

  const initAudio = () => {
    if (!audioContextRef.current && typeof window !== "undefined") {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      isAudioEnabledRef.current = true;
    }
  };

  const playPrinterSound = () => {
    if (!isAudioEnabledRef.current) return;
    const ctx = audioContextRef.current;
    if (!ctx) return;

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    oscillator.frequency.setValueAtTime(300, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.8);
    gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);
    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.8);
  };

  const addJob = () => {
    if (!jobName.trim()) return;
    const pageNum = Math.max(1, parseInt(pages) || 1);
    const newJob: PrintJob = {
      id: Date.now(),
      name: jobName,
      pages: pageNum,
      timestamp: Date.now(),
    };
    setJobs((prev) => [...prev, newJob]);
    setJobName("");
    setPages("1");
  };

  const assignToPrinter = (job: PrintJob) => {
    if (printer1Status === "idle") {
      setPrinter1Status("printing");
      return { ...job, printerId: 1 };
    } else if (printer2Status === "idle") {
      setPrinter2Status("printing");
      return { ...job, printerId: 2 };
    }
    return job;
  };

  const printNext = () => {
    if (jobs.length === 0 || (printer1Status === "printing" && printer2Status === "printing")) return;

    initAudio();
    playPrinterSound();

    const nextJob = jobs[0];
    const jobWithPrinter = assignToPrinter(nextJob);
    const delay = Math.min(3000, 1000 + nextJob.pages * 400);

    const completePrint = () => {
      setJobs((prev) => prev.slice(1));
      if (jobWithPrinter.printerId === 1) {
        setPrinter1Status("idle");
      } else {
        setPrinter2Status("idle");
      }
      const msg = `🖨️ ${nextJob.name} printed on Printer ${jobWithPrinter.printerId}!`;
      toast?.success?.(msg) || alert(msg);
    };

    setTimeout(completePrint, delay);
  };

  useEffect(() => {
    const input = document.getElementById("job-name") as HTMLInputElement;
    if (input) input.focus();
  }, []);

  return (
    <VisualizerLayout
      title="🖨️ Print Job Queue (Multi-Printer)"
      description="A real-world simulation of FIFO queues using shared printers"
      difficulty="Beginner"
      onReset={resetQueue}
      complexity={{ time: "O(1)", space: "O(n)" }}
      applications={[
        {
          title: "Shared Office Printers",
          description: "Multiple users submit jobs to a common queue processed in order.",
          examples: ["University labs", "Corporate offices", "Library printers"],
        },
        {
          title: "Load Balancing",
          description: "Multiple printers reduce wait time by processing jobs in parallel.",
          examples: ["Print farms", "Cloud print services"],
        },
      ]}
    >
      <div className="w-full space-y-6">
        {/* Knowledge Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">📘 How Print Queues Work</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>
              Print jobs are added to the <strong>back</strong> of a queue and processed from the <strong>front</strong> (FIFO).
            </p>
            <p>
              With <strong>multiple printers</strong>, the system assigns each job to the first available printer — improving efficiency while preserving order.
            </p>
          </CardContent>
        </Card>

        {/* Printers */}
        <div className="flex flex-wrap justify-center gap-8">
          <div className="flex flex-col items-center">
            <div className="relative">
              <div
                className={`w-20 h-20 rounded-lg flex items-center justify-center border-2 ${
                  printer1Status === "printing"
                    ? "border-blue-500 bg-blue-50 animate-pulse"
                    : "border-gray-300 bg-gray-100"
                }`}
              >
                <Printer className="h-8 w-8 text-gray-700" />
              </div>
              <Badge
                variant={printer1Status === "idle" ? "outline" : "default"}
                className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 text-xs"
              >
                {printer1Status === "idle" ? "Idle" : "Printing..."}
              </Badge>
            </div>
            <span className="text-sm mt-2 text-muted-foreground">Printer 1</span>
          </div>

          <div className="flex flex-col items-center">
            <div className="relative">
              <div
                className={`w-20 h-20 rounded-lg flex items-center justify-center border-2 ${
                  printer2Status === "printing"
                    ? "border-green-500 bg-green-50 animate-pulse"
                    : "border-gray-300 bg-gray-100"
                }`}
              >
                <Printer className="h-8 w-8 text-gray-700" />
              </div>
              <Badge
                variant={printer2Status === "idle" ? "outline" : "default"}
                className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 text-xs"
              >
                {printer2Status === "idle" ? "Idle" : "Printing..."}
              </Badge>
            </div>
            <span className="text-sm mt-2 text-muted-foreground">Printer 2</span>
          </div>
        </div>

        {/* Queue Visualization */}
        <div className="flex flex-wrap gap-4 justify-center min-h-[120px] items-center">
          {jobs.length === 0 ? (
            <span className="text-muted-foreground italic">No print jobs queued</span>
          ) : (
            jobs.map((job, index) => (
              <div
                key={job.id}
                className={`w-28 h-32 border-2 rounded-lg flex flex-col items-center justify-center p-2 bg-card ${
                  index === 0 ? "border-blue-500 bg-blue-50" : "border-border"
                }`}
              >
                <FileText className="h-8 w-8 text-muted-foreground mb-2" />
                <span className="font-medium text-sm text-center truncate w-full">{job.name}</span>
                <span className="text-xs text-muted-foreground mt-1">{job.pages} page{job.pages !== 1 ? "s" : ""}</span>
                {index === 0 && <Badge variant="outline" className="mt-2 text-xs">Next</Badge>}
              </div>
            ))
          )}
        </div>

        {/* Controls */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Print Job
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                id="job-name"
                placeholder="Document name"
                value={jobName}
                onChange={(e) => setJobName(e.target.value)}
              />
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Pages"
                  value={pages}
                  onChange={(e) => setPages(e.target.value)}
                  min="1"
                  className="w-20"
                />
                <Button onClick={addJob} disabled={!jobName.trim()} className="flex-1">
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Printer className="h-4 w-4" />
                Print Next
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                onClick={printNext}
                disabled={jobs.length === 0 || (printer1Status === "printing" && printer2Status === "printing")}
                className="w-full"
              >
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Uses first available printer
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </VisualizerLayout>
  );
}