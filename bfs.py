import json
import sys
import io

# Ensure UTF-8 encoding for Windows compatibility
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

with open("map_data.json", "r") as f:
    data = json.load(f)

N = data["grid_size"]["N"]
M = data["grid_size"]["M"]
MAP = data["map"]

# Find mouse (M) and cat (C) positions
MR, MC = 0, 0
CR, CC = 0, 0

for i in range(N):
    for j in range(M):
        if MAP[i][j] == 'M':
            MR, MC = i, j
        elif MAP[i][j] == 'C':
            CR, CC = i, j

SRC_MOUSE = (MR, MC)
SRC_CAT = (CR, CC)

# MAP = []  # Map of the Game

DISTANCE_CAT = {}  # Distances
DISTANCE_MOUSE={}
PARENT = {}    # Parents

DX = [0, 1, 0, -1]
DY = [1, 0, -1, 0]


def Check_Goal(i, j):
    return MAP[i][j] in ['G', 'D']  # Door can be 'G' or 'D'


def BFS_CAT(SRC: tuple):
    Q = [SRC]
    DISTANCE_CAT[SRC] = 0

    while Q:
        I, J = Q.pop(0)

        for k in range(4):
            newi = I + DX[k]
            newj = J + DY[k]

            if 0 <= newi < N and 0 <= newj < M:

                if MAP[newi][newj] == '#':
                    continue

                new_T = (newi, newj)

                if new_T not in DISTANCE_CAT:
                    DISTANCE_CAT[new_T] = DISTANCE_CAT[(I, J)] + 1
                    Q.append(new_T)


def BFS_MOUSE(SRC: tuple):
    Q = [SRC]
    DISTANCE_MOUSE[SRC] = 0

    while Q:   
        I, J = Q.pop(0)

        if Check_Goal(I, J):
            return "Path Found"

        for k in range(4):
            newi = I + DX[k]  
            newj = J + DY[k]   

            if 0 <= newi < N and 0 <= newj < M:  

                if MAP[newi][newj] == '#':
                    continue

                new_T = (newi, newj)

                # Not visited
                if new_T not in DISTANCE_MOUSE: 

                    # Cat MUST have a distance value for this cell
                    if new_T in DISTANCE_CAT:

                        # Mouse must reach earlier than cat
                        if DISTANCE_MOUSE[(I, J)] + 1 < DISTANCE_CAT[new_T]:

                            PARENT[new_T] = (I, J)
                            DISTANCE_MOUSE[new_T] = DISTANCE_MOUSE[(I, J)] + 1
                            Q.append(new_T)

    return "No Safe Path"


BFS_CAT(SRC=SRC_CAT)
State = BFS_MOUSE(SRC=SRC_MOUSE)

# Output result as JSON
result = {
    "success": State == 'Path Found',
    "message": "Mouse can escape safely!" if State == 'Path Found' else "No Safe Path Mouse died",
    "path": [],
    "mouse_start": SRC_MOUSE,
    "cat_start": SRC_CAT,
    "door_pos": None
}

# Find door position
for i in range(N):
    for j in range(M):
        if MAP[i][j] in ['G', 'D']:
            result["door_pos"] = (i, j)
            break

# Reconstruct path if found

def BFS_MOUSE_NOCAT(SRC: tuple):
    Q = [SRC]
    DISTANCE_MOUSE[SRC] = 0

    while Q:   
        I, J = Q.pop(0)

        if Check_Goal(I, J):
            return

        for k in range(4):
            newi = I + DX[k]  
            newj = J + DY[k]   

            if 0 <= newi < N and 0 <= newj < M:  

                if MAP[newi][newj] == '#':
                    continue

                new_T = (newi, newj)

                # Not visited
                if new_T not in DISTANCE_MOUSE: 
                        PARENT[new_T] = (I, J)
                        DISTANCE_MOUSE[new_T] = DISTANCE_MOUSE[(I, J)] + 1
                        Q.append(new_T)

    return

if(State != 'Path Found'):
    PARENT.clear()
    DISTANCE_MOUSE.clear()
    BFS_MOUSE_NOCAT(SRC=SRC_MOUSE)

curr = result["door_pos"]
path = []
while curr != SRC_MOUSE:
    path.append(curr)
    curr = PARENT[curr]
path.append(SRC_MOUSE)
path.reverse()
result["path"] = path


print(json.dumps(result))