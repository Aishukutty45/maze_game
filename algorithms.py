
import heapq
from collections import deque
import math

# --- Maze Algorithms ---

def solve_maze_bfs(grid, start, goal):
    rows, cols = len(grid), len(grid[0])
    queue = deque([start])
    visited = {start}
    came_from = {start: None}
    history = [] # For animation: list of visited nodes in order
    
    steps = 0
    found = False
    
    while queue:
        current = queue.popleft()
        steps += 1
        history.append(current)
        
        if current == goal:
            found = True
            break
        
        for dr, dc in [(-1,0), (1,0), (0,-1), (0,1)]:
            nr, nc = current[0] + dr, current[1] + dc
            if 0 <= nr < rows and 0 <= nc < cols:
                if grid[nr][nc] != 1 and (nr, nc) not in visited:
                    visited.add((nr, nc))
                    came_from[(nr, nc)] = current
                    queue.append((nr, nc))
                    
    path = []
    if found:
        curr = goal
        while curr:
            path.append(curr)
            curr = came_from.get(curr)
        path.reverse()
        
    return {
        "found": found,
        "path": path,
        "history": history,
        "steps": steps,
        "visited_count": len(visited)
    }

def solve_maze_dfs(grid, start, goal):
    rows, cols = len(grid), len(grid[0])
    stack = [start]
    visited = set() # Mark when popped
    came_from = {start: None}
    history = []
    
    steps = 0
    found = False
    
    while stack:
        current = stack.pop()
        
        if current in visited:
            continue
            
        visited.add(current)
        steps += 1
        history.append(current) 
        
        if current == goal:
            found = True
            break
            
        # Neighbors
        neighbors = []
        for dr, dc in [(-1,0), (1,0), (0,-1), (0,1)]:
            nr, nc = current[0] + dr, current[1] + dc
            if 0 <= nr < rows and 0 <= nc < cols:
                # Check not visited. 
                # Note: We might add to stack multiple times, but 'visited' check on pop handles it.
                if grid[nr][nc] != 1 and (nr, nc) not in visited:
                    neighbors.append((nr, nc))
        
        # Reverse to prioritize Right/Down (if last pushed is popped first)
        for n in neighbors:
            # We record 'came_from' here. 
            # It might get overwritten if 'n' is reached from another node later 
            # but before 'n' is popped. This is acceptable for DFS path finding.
            if n not in came_from: 
                came_from[n] = current
            stack.append(n)

    path = []
    if found:
        curr = goal
        while curr:
            path.append(curr)
            curr = came_from.get(curr)
        path.reverse()
        
    return {
        "found": found,
        "path": path,
        "history": history,
        "steps": steps,
        "visited_count": len(visited)
    }

def solve_maze_astar(grid, start, goal):
    rows, cols = len(grid), len(grid[0])
    
    def h(a, b):
        return abs(a[0] - b[0]) + abs(a[1] - b[1])
        
    pq = []
    heapq.heappush(pq, (0, start))
    came_from = {start: None}
    cost_so_far = {start: 0}
    visited_order = [] # Order they were popped (closed set)
    
    steps = 0
    found = False
    
    while pq:
        _, current = heapq.heappop(pq)
        steps += 1
        visited_order.append(current)
        
        if current == goal:
            found = True
            break
            
        for dr, dc in [(-1,0), (1,0), (0,-1), (0,1)]:
            nr, nc = current[0] + dr, current[1] + dc
            if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] != 1:
                new_cost = cost_so_far[current] + 1
                if (nr, nc) not in cost_so_far or new_cost < cost_so_far[(nr, nc)]:
                    cost_so_far[(nr, nc)] = new_cost
                    priority = new_cost + h((nr,nc), goal)
                    heapq.heappush(pq, (priority, (nr, nc)))
                    came_from[(nr, nc)] = current
    
    path = []
    if found:
        curr = goal
        while curr:
            path.append(curr)
            curr = came_from.get(curr)
        path.reverse()
        
    return {
        "found": found,
        "path": path,
        "history": visited_order,
        "steps": steps,
        "visited_count": len(cost_so_far)
    }

# --- 8-Puzzle Algorithms ---

GOAL_STATE = (1, 2, 3, 4, 5, 6, 7, 8, 0)

def get_puzzle_neighbors(state):
    # State is a tuple of 9 inits
    idx = state.index(0)
    r, c = divmod(idx, 3)
    
    neighbors = []
    for dr, dc in [(-1,0), (1,0), (0,-1), (0,1)]:
        nr, nc = r + dr, c + dc
        if 0 <= nr < 3 and 0 <= nc < 3:
            # Swap
            n_idx = nr * 3 + nc
            new_list = list(state)
            new_list[idx], new_list[n_idx] = new_list[n_idx], new_list[idx] # Swap
            neighbors.append(tuple(new_list))
    return neighbors

def solve_puzzle_bfs(start_state):
    if start_state == GOAL_STATE:
         return {"found": True, "path": [start_state], "history": [], "steps": 0}
         
    queue = deque([start_state])
    came_from = {start_state: None}
    visited = {start_state}
    history = []
    
    found = False
    steps = 0
    max_steps = 5000 # Safety Break
    
    while queue and steps < max_steps:
        current = queue.popleft()
        history.append(current)
        steps += 1
        
        if current == GOAL_STATE:
            found = True
            break
            
        for next_state in get_puzzle_neighbors(current):
            if next_state not in visited:
                visited.add(next_state)
                came_from[next_state] = current
                queue.append(next_state)
                
    path = []
    if found:
        curr = GOAL_STATE
        while curr:
            path.append(curr)
            curr = came_from.get(curr)
        path.reverse()
        
    return {
        "found": found,
        "path": path,
        "history": history, # Can be large
        "steps": steps,
        "visited_count": len(visited)
    }

def solve_puzzle_dfs(start_state):
    # DFS is baaad for 8-puzzle (depths can be infinite without depth limit), 
    # but regular visited set handles cycles. 
    # Still, it can go deep and find non-optimal paths. 
    # We will limit depth or steps.
    
    stack = [start_state]
    came_from = {start_state: None}
    visited = {start_state}
    history = []
    
    found = False
    steps = 0
    max_steps = 10000 
    
    while stack and steps < max_steps:
        current = stack.pop()
        history.append(current)
        steps += 1
        
        if current == GOAL_STATE:
            found = True
            break
            
        for next_state in get_puzzle_neighbors(current):
            if next_state not in visited:
                visited.add(next_state)
                came_from[next_state] = current
                stack.append(next_state)
                
    path = []
    if found:
        curr = GOAL_STATE
        while curr:
            path.append(curr)
            curr = came_from.get(curr)
        path.reverse()
        
    return {
        "found": found,
        "path": path,
        "history": history,
        "steps": steps,
        "visited_count": len(visited)
    }

def solve_puzzle_astar(start_state):
    def manhattan(state):
        dist = 0
        for i, val in enumerate(state):
            if val == 0: continue
            # Current pos
            r, c = divmod(i, 3)
            # Goal pos (val-1 for 1-based tiles at 0-based indices)
            # Goal: 1 at 0, 2 at 1... 8 at 7, 0 at 8
            # target index for 'val' is val-1
            tr, tc = divmod(val - 1, 3)
            dist += abs(r - tr) + abs(c - tc)
        return dist

    pq = []
    heapq.heappush(pq, (0, start_state))
    came_from = {start_state: None}
    cost_so_far = {start_state: 0}
    visited_order = []
    
    found = False
    steps = 0
    
    while pq:
        _, current = heapq.heappop(pq)
        visited_order.append(current)
        steps += 1
        
        if current == GOAL_STATE:
            found = True
            break
        
        if steps > 10000: # Safety
            break
            
        for next_state in get_puzzle_neighbors(current):
            new_cost = cost_so_far[current] + 1
            if next_state not in cost_so_far or new_cost < cost_so_far[next_state]:
                cost_so_far[next_state] = new_cost
                priority = new_cost + manhattan(next_state)
                heapq.heappush(pq, (priority, next_state))
                came_from[next_state] = current

    path = []
    if found:
        curr = GOAL_STATE
        while curr:
            path.append(curr)
            curr = came_from.get(curr)
        path.reverse()

    return {
        "found": found,
        "path": path,
        "history": visited_order,
        "steps": steps,
        "visited_count": len(cost_so_far)
    }
