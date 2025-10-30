// src/components/Footer.tsx
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-background py-8 text-center text-sm text-muted-foreground">
      <div className="container mx-auto px-4">
        <p>&copy; {new Date().getFullYear()} DSA Visualizer. Open-source learning tool for everyone.</p>
        <p className="mt-2">
          <Link href="https://github.com/your-username/dsa-visualizer" className="text-primary hover:underline">
            View on GitHub
          </Link>
        </p>
      </div>
    </footer>
  );
}