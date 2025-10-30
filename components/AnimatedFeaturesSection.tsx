// src/components/AnimatedFeaturesSection.tsx
"use client";

import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export default function AnimatedFeaturesSection({ features }: { features: Feature[] }) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
      {features.map((feature, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ delay: index * 0.1, duration: 0.5 }}
          whileHover={{ y: -8 }}
          className="h-full"
        >
          <Card className="h-full border-2 border-primary/20 hover:border-primary transition-all duration-300 bg-background/80 backdrop-blur-sm">
            <CardHeader className="flex flex-col items-center pb-4">
              <div className="mx-auto h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                {feature.icon}
              </div>
              <CardTitle className="text-center mt-4 text-lg font-semibold">
                {feature.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <CardDescription className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </CardDescription>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}