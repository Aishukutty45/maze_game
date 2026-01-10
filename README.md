# 🧭 Pathfinding Master

[![Python](https://img.shields.io/badge/Python-3.8+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/Flask-2.0+-000000?style=for-the-badge&logo=flask&logoColor=white)](https://flask.palletsprojects.com/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.0-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

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

---

## � Docker Deployment

The application is fully containerized. To run it using Docker:

### 1. Build and Run with Docker Compose (Recommended)
```bash
docker-compose up --build
```
This will build the image and start the application on `http://localhost:5000`.

### 2. Manual Docker Build & Run
```bash
# Build the image
docker build -t puzzle-pathfinder .

# Run the container
docker run -p 5000:5000 puzzle-pathfinder
```

The application will be accessible at `http://localhost:5000`.

---

## ☁️ Deploying to Render

Render is a great platform for hosting Dockerized applications. You can deploy this app in minutes:

1.  **Push your code to GitHub/GitLab**.
2.  **Log in to Render** and click **"New +"** -> **"Web Service"**.
3.  Connect your repository.
4.  Render will detect the `Dockerfile`.
5.  In the settings:
    *   **Runtime**: Select `Docker`.
    *   **Region**: Choose the one closest to you.
6.  Click **"Deploy Web Service"**.

Render will automatically build your image and deploy it. The app will be available at your `*.onrender.com` URL.

---

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
