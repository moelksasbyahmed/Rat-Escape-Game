import json
import sys
from collections import deque

# Set UTF-8 encoding for Windows console
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

def load_map(filename='map_data.json'):
    """Load the map data from JSON file"""
    with open(filename, 'r') as f:
        data = json.load(f)
    return data

def find_positions(grid):
    """Find positions of mouse (M), cat (C), door (D), and traps (X)"""
    mouse_pos = None
    cat_pos = None
    door_pos = None
    traps = set()
    
    for y in range(len(grid)):
        for x in range(len(grid[y])):
            if grid[y][x] == 'M':
                mouse_pos = (x, y)
            elif grid[y][x] == 'C':
                cat_pos = (x, y)
            elif grid[y][x] == 'D':
                door_pos = (x, y)
            elif grid[y][x] == 'X':
                traps.add((x, y))
    
    return mouse_pos, cat_pos, door_pos, traps

def bfs_find_path(grid, start, goal, traps):
    """
    Find shortest path from start to goal avoiding traps
    Returns list of (x, y) positions representing the path
    """
    if not start or not goal:
        return None
    
    width = len(grid[0])
    height = len(grid)
    
    # BFS setup
    queue = deque([(start, [start])])
    visited = {start}
    
    # Directions: up, down, left, right
    directions = [(0, -1), (0, 1), (-1, 0), (1, 0)]
    
    while queue:
        current, path = queue.popleft()
        x, y = current
        
        # Check if we reached the goal
        if current == goal:
            return path
        
        # Explore neighbors
        for dx, dy in directions:
            nx, ny = x + dx, y + dy
            new_pos = (nx, ny)
            
            # Check bounds
            if 0 <= nx < width and 0 <= ny < height:
                # Check if not visited, not a trap, and not the cat position
                if new_pos not in visited and new_pos not in traps:
                    visited.add(new_pos)
                    queue.append((new_pos, path + [new_pos]))
    
    return None  # No path found

def solve_map(filename='map_data.json'):
    """Main solver function"""
    # Load map
    data = load_map(filename)
    grid = data['grid']
    width = data['width']
    height = data['height']
    
    print(f"Map size: {width} x {height}")
    print("\nMap layout:")
    for row in grid:
        print(' '.join(row))
    
    # Find positions
    mouse_pos, cat_pos, door_pos, traps = find_positions(grid)
    
    # Validate mouse and cat are present
    if not mouse_pos:
        print("\n[ERROR] No mouse found on the map!")
        return None
    
    if not cat_pos:
        print("\n[ERROR] No cat found on the map!")
        return None
    
    print(f"\nMouse position: {mouse_pos}")
    print(f"Cat position: {cat_pos}")
    print(f"Door position: {door_pos}")
    print(f"Number of traps: {len(traps)}")
    
    if not door_pos:
        print("\nWarning: No door found on the map!")
        print("The mouse needs to reach any edge of the map to escape.")
        
        # Find all empty positions at the edge (potential goals)
        goals = []
        for x in range(width):
            if (x, 0) not in traps and (x, 0) != cat_pos:
                goals.append((x, 0))
            if (x, height-1) not in traps and (x, height-1) != cat_pos:
                goals.append((x, height-1))
        
        for y in range(height):
            if (0, y) not in traps and (0, y) != cat_pos:
                goals.append((0, y))
            if (width-1, y) not in traps and (width-1, y) != cat_pos:
                goals.append((width-1, y))
        
        # Remove duplicates
        goals = list(set(goals))
    else:
        print("\nDoor found! Mouse needs to reach the door to escape.")
        goals = [door_pos]
    
    print(f"\nSearching for escape routes to {len(goals)} possible exit points...")
    
    # Find shortest path to any goal
    shortest_path = None
    best_goal = None
    
    for goal in goals:
        path = bfs_find_path(grid, mouse_pos, goal, traps)
        if path:
            if shortest_path is None or len(path) < len(shortest_path):
                shortest_path = path
                best_goal = goal
    
    if shortest_path:
        print(f"\n[SUCCESS] Solution found!")
        print(f"Escape route to position {best_goal}")
        print(f"Path length: {len(shortest_path) - 1} moves")
        print(f"\nPath: {' -> '.join([str(pos) for pos in shortest_path])}")
        
        # Visualize solution
        print("\nSolution visualization:")
        solution_grid = [row[:] for row in grid]
        for i, (x, y) in enumerate(shortest_path[1:-1], 1):
            if solution_grid[y][x] == '.':
                solution_grid[y][x] = str(i % 10)
        
        for row in solution_grid:
            print(' '.join(row))
        
        return shortest_path
    else:
        print("\n[FAILED] No solution found! Mouse cannot escape.")
        return None

if __name__ == "__main__":
    try:
        solution = solve_map()
    except FileNotFoundError:
        print("Error: map_data.json not found!")
        print("Please create a map using the game editor and click SOLVE first.")
    except Exception as e:
        print(f"Error: {e}")
