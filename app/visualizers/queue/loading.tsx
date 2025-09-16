export default function QueueLoading() {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mb-4"></div>
      <p className="text-muted-foreground">Loading Queue Visualizer...</p>
    </div>
  );
}
