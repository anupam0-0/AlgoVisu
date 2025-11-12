<div align="center">
  <h1 style="font-size: 3rem; font-weight: bold;">VTRACE</h1>
  <p style="font-size: 1.25rem;">Visualization Tool for Real-time Algorithm Comprehension & Exploration</p>
  <p>
    Turn complex computer science concepts into clear, interactive animations. Perfect for students, educators, and anyone learning Data Structures and Algorithms.
  </p>
  <p>
    <a href="https://github.com/darknight08zz/AlgoVisu/stargazers"><img src="https://img.shields.io/github/stars/darknight08zz/AlgoVisu?style=for-the-badge&logo=github&color=orange" alt="GitHub stars"></a>
    <a href="https://github.com/darknight08zz/AlgoVisu/forks"><img src="https://img.shields.io/github/forks/darknight08zz/AlgoVisu?style=for-the-badge&logo=github&color=blue" alt="GitHub forks"></a>
    <a href="https://github.com/darknight08zz/AlgoVisu/blob/main/LICENSE"><img src="https://img.shields.io/github/license/darknight08zz/AlgoVisu?style=for-the-badge&color=green" alt="License"></a>
  </p>
</div>

## ✨ Features

- **Interactive Visualizations**: Step-by-step animations for a wide range of data structures and algorithms.
- **Real-time Controls**: Play, pause, step forward/backward, and adjust animation speed to learn at your own pace.
- **In-depth Explanations**: Each visualizer includes detailed explanations, pseudocode, complexity analysis, and real-world use cases.
- **Modern & Responsive UI**: Clean, intuitive interface built with the latest web technologies for a seamless experience on any device.
- **Application-focused Demos**: Explore practical applications like e-commerce ranking and real-time leaderboards to see how algorithms solve real problems.

## 🚀 Available Visualizers

VTRACE offers a growing library of visualizations:

### Data Structures
- **Queue**: Explore Linear, Circular, Priority, and Double-Ended (Deque) queues.
- **Heap**: Understand Min-Heap and Max-Heap operations like insert, extract, and build-heap.
- **Trie (Prefix Tree)**: Visualize insert, search, and delete operations for efficient string manipulation.
- **Real-time Leaderboard**: See an AVL Tree in action, powering a dynamically updating leaderboard with O(log n) efficiency.

### Algorithms
- **Sorting**: Compare 6 different sorting algorithms side-by-side:
  - Bubble Sort
  - Selection Sort
  - Insertion Sort
  - Merge Sort
  - Quick Sort
  - Heap Sort

### Applications
- **E-commerce Ranking**: A simulation of how product feeds are ranked using various sorting algorithms based on signals like price, date, or popularity.

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **UI Library**: [React](https://react.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [Shadcn/UI](https://ui.shadcn.com/) & [Radix UI](https://www.radix-ui.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)

## 🏁 Getting Started

To run VTRACE locally, follow these steps:

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

3. **Build for production:**
   ```bash
   npm run build
   npm start
   ```

## 📂 Project Structure

The codebase is organized to be clean and scalable:

```plaintext
d:/Capstone/AlgoVisu/
├── app/
│   ├── layout.tsx              # Root layout for the entire application
│   ├── page.tsx                # The main landing page
│   └── visualizers/
│       ├── ecommerce-ranking/page.tsx   # E-commerce Product Ranking Visualizer
│       ├── print-queue/page.tsx         # Print Job Queue (FIFO) Simulation
│       ├── realtime-leaderboard/page.tsx# Real-time Leaderboard (AVL Tree)
│       ├── sorting/page.tsx             # Sorting Algorithms Visualizer
│       └── trie/page.tsx                # Trie (Prefix Tree) Visualizer
├── components/
│   ├── ui/                     # Auto-generated UI components from Shadcn/UI
│   ├── header.tsx              # Main site header component
│   └── visualizer-layout.tsx   # Shared layout for all visualizer pages
├── lib/
│   ├── assets/                 # Static assets like images, icons, etc.
│   └── utils.ts                # Utility functions (e.g., cn for Tailwind Merge)
├── public/
│   └── ...                     # Publicly served assets (e.g., favicons)
├── README.md                   # Project documentation (you are here!)
├── package.json                # Project dependencies and scripts
├── tailwind.config.ts          # Tailwind CSS configuration
└── tsconfig.json               # TypeScript configuration
```

## 🤝 How to Contribute

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. **Fork the Project**: Click the 'Fork' button at the top right of this page.
2. **Clone your Fork**:
   ```bash
   git clone https://github.com/your-username/AlgoVisu.git
   ```
3. **Create your Feature Branch**:
   ```bash
   git checkout -b feature/AmazingFeature
   ```
4. **Commit your Changes**:
   ```bash
   git commit -m 'Add some AmazingFeature'
   ```
5. **Push to the Branch**:
   ```bash
   git push origin feature/AmazingFeature
   ```
6. **Open a Pull Request**: Go back to the original repository and click 'New pull request'.

Please open an issue first to discuss any major changes you would like to make.

## 📄 License

This project is licensed under the **MIT License**. See the LICENSE file for more details.
