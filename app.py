
from flask import Flask, jsonify, request, send_from_directory, render_template
from algorithms import solve_maze_bfs, solve_maze_dfs, solve_maze_astar, solve_puzzle_bfs, solve_puzzle_dfs, solve_puzzle_astar
import os

app = Flask(__name__, static_folder='static', template_folder='templates')

# --- DATA: Levels ---

MAZE_LEVELS = [
    {
        "id": 1,
        "name": "Level 1 (Easy)",
        "layout": [
            [0,0,0,0,0],
            [1,1,1,1,0],
            [0,0,0,0,0],
            [0,1,1,1,1],
            [0,0,0,0,0]
        ],
        "start": [0, 0],
        "goal": [4, 4]
    },
    {
        "id": 2,
        "name": "Level 2 (Medium)",
        "layout": [
            [0,0,1,0,0,0,0,0,0,0],
            [0,1,1,0,1,1,1,1,1,0],
            [0,0,0,0,0,0,0,0,1,0],
            [1,1,1,1,1,0,1,0,1,0],
            [0,0,0,0,1,0,1,0,0,0],
            [0,1,1,0,1,0,1,1,1,1],
            [0,0,1,0,0,0,0,0,0,0],
            [1,0,1,1,1,1,1,1,1,0],
            [1,0,0,0,0,0,0,0,0,0],
            [1,1,1,1,1,1,1,1,1,0]
        ],
        "start": [0, 0],
        "goal": [9, 9]
    },
    {
        "id": 3,
        "name": "Level 3 (Hard)",
         "layout": [
            [0,0,0,1,0,0,0,0,0,0,0,0,0,0,0],
            [1,1,0,1,0,1,1,1,1,1,0,1,1,1,0],
            [0,0,0,0,0,0,0,0,0,1,0,0,0,1,0],
            [0,1,1,1,1,1,1,1,0,1,1,1,0,1,0],
            [0,0,0,0,0,1,0,0,0,0,0,1,0,1,0],
            [0,1,1,1,0,1,0,1,1,1,0,1,0,0,0],
            [0,1,0,0,0,1,0,1,0,0,0,1,1,1,1],
            [0,1,0,1,1,1,0,1,0,1,1,1,0,0,0],
            [0,0,0,0,0,0,0,1,0,0,0,0,0,1,0],
            [1,1,1,1,1,1,0,1,1,1,1,1,0,1,0],
            [0,0,0,0,0,0,0,0,0,0,0,1,0,0,0],
            [0,1,1,1,1,1,1,1,1,1,0,1,1,1,0],
            [0,0,0,0,0,0,0,0,0,1,0,0,0,0,0],
            [1,1,1,1,1,1,1,1,0,1,0,1,1,1,0],
            [0,0,0,0,0,0,0,0,0,0,0,1,0,0,0]
        ],
        "start": [0, 0],
        "goal": [14, 14]
    }
]

PUZZLE_LEVELS = [
    {
        "id": 1, "name": "Beginner (1 move)",
        "state": [1, 2, 3, 4, 5, 6, 7, 0, 8] # 0 just needs to move right
    },
    {
        "id": 2, "name": "Intermediate (Multi-step)",
        "state": [1, 2, 3, 4, 0, 6, 7, 5, 8]
    },
    {
        "id": 3, "name": "Expert (Complex)",
        "state": [0, 1, 3, 4, 2, 5, 7, 8, 6] # Random-ish
    },
     {
        "id": 4, "name": "Custom",
        "state": [1, 2, 3, 4, 5, 6, 7, 8, 0] # Solved state, user edits
    }
]

# --- Routes ---

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/levels/maze', methods=['GET'])
def get_maze_levels():
    return jsonify(MAZE_LEVELS)

@app.route('/api/levels/puzzle', methods=['GET'])
def get_puzzle_levels():
    return jsonify(PUZZLE_LEVELS)

@app.route('/api/maze/solve', methods=['POST'])
def solve_maze():
    data = request.json
    level_id = data.get('levelId')
    algorithm = data.get('algorithm')
    
    # Check if custom grid provided, else use level
    level = next((l for l in MAZE_LEVELS if l['id'] == level_id), None)
    if not level:
        return jsonify({"error": "Level not found"}), 404
        
    grid = level['layout']
    start = tuple(level['start'])
    goal = tuple(level['goal'])
    
    # If custom grid sent from frontend? Let's stick to levels for now or accept 'customGrid' if needed.
    # User might want to draw walls. Let's support 'customGrid' in payload for future proofing.
    if 'customGrid' in data:
        grid = data['customGrid']
        # Find start/goal in custom grid? Or pass them.
        # Assuming start/goal fixed for now or passed.
    
    result = {}
    if algorithm == 'BFS':
        result = solve_maze_bfs(grid, start, goal)
    elif algorithm == 'DFS':
        result = solve_maze_dfs(grid, start, goal)
    elif algorithm == 'A*':
        result = solve_maze_astar(grid, start, goal)
    else:
        return jsonify({"error": "Unknown algorithm"}), 400
        
    return jsonify(result)

@app.route('/api/puzzle/solve', methods=['POST'])
def solve_puzzle():
    data = request.json
    start_state = tuple(data.get('state')) # Expect list
    algorithm = data.get('algorithm')
    
    result = {}
    if algorithm == 'BFS':
        result = solve_puzzle_bfs(start_state)
    elif algorithm == 'DFS':
        result = solve_puzzle_dfs(start_state)
    elif algorithm == 'A*':
        result = solve_puzzle_astar(start_state)
    else:
        return jsonify({"error": "Unknown algorithm"}), 400
        
    return jsonify(result)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
