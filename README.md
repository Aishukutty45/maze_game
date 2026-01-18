# 🧭 Pathfinding Master


**Pathfinding Master** is an interactive web application designed to visualize classic search algorithms in real-time. Whether navigating complex 2D mazes or solving the logic-driven 8-Puzzle, this tool provides a step-by-step educational look at how machines "think" and find paths.

---

## 🚀 Key Features

### 🧩 1. Maze Navigation
*   **Multiple Difficulty Levels**: Choose between Easy, Medium, and Hard maze layouts.
*   **Real-time Animation**: Watch the algorithm expand node-by-node.
*   **Path Highlighting**: once the goal is reached, the optimal path is drawn in vibrant gold.

### 🔢 2. 8-Puzzle Solver
*   **State Visualization**: See the sliding tiles move as the search progresses.
*   **Initial States**: Select from Beginner, Intermediate, or Expert starting configurations.
*   **Heuristic Insights**: Observe how A* uses Manhattan distance to solve puzzles efficiently.

### 🛠️ 3. Premium UI/UX
*   **Glassmorphic Design**: A modern, dark-themed interface with blur effects.
*   **Interactive Controls**: Toggle algorithms, reset states, and adjust visualization speed.
*   **Responsive Layout**: Works seamlessly across different screen sizes.

---

## 🧠 Algorithms Implemented

| Algorithm | Description | Best For |
| :--- | :--- | :--- |
| **BFS** | Breadth-First Search. Explores level-by-level. | Shortest path in unweighted grids. |
| **DFS** | Depth-First Search. Goes deep into one branch before backtracking. | Complete exploration (not always optimal path). |
| **A\*** | A-Star Search. Uses heuristics to estimate cost to goal. | Efficiency and speed (Optimal path). |

---

## 🛠️ Tech Stack

*   **Backend**: Python, Flask (RESTful API).
*   **Frontend**: React (Hooks, Fiber architecture via CDN), Tailwind CSS (Aesthetics).
*   **Communication**: Axios for seamless frontend-backend data fetching.
*   **Logic**: Custom state-space search implementations for BFS, DFS, and A*.

---

do visit my app at ---https://maze-game-p33l.onrender.com/

## 📂 Project Structure

```text
fullstack_app/
├── app.py              # Flask server & API endpoints
├── algorithms.py       # Core pathfinding logic (BFS, DFS, A*)
├── static/
│   └── js/
│       └── App.js      # React frontend application
├── templates/
│   └── index.html      # Main HTML entry point
└── README.md           # Documentation
```

---

## 🎨 Design Philosophy
The app uses a **Midnight Deep Blue** palette (`bg-slate-900`) combined with **Cyan** for explored nodes and **Gold** for the final path, ensuring high contrast and a premium "hacker" aesthetic.

---
*Created with ❤️ for algorithm enthusiasts.*
