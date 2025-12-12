const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const PORT = 5000;

const server = http.createServer((req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    if (req.url === '/save_map' && req.method === 'POST') {
        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            try {
                const mapData = JSON.parse(body);
                const filePath = path.join(__dirname, 'map_data.json');
                
                fs.writeFileSync(filePath, JSON.stringify(mapData, null, 2));
                
                console.log('Map data saved to map_data.json');
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, message: 'Map saved successfully' }));
            } catch (error) {
                console.error('Error saving map:', error);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: error.message }));
            }
        });
    } else if (req.url === '/run_solver' && req.method === 'POST') {
        // Run the Python solver
        console.log('Running Python solver...');
        console.log('Working directory:', __dirname);
        
        const pythonProcess = spawn('python', ['bfs_solver.py'], {
            cwd: __dirname,
            shell: true
        });
        
        let output = '';
        let errorOutput = '';

        pythonProcess.stdout.on('data', (data) => {
            const text = data.toString();
            console.log('Python stdout:', text);
            output += text;
        });

        pythonProcess.stderr.on('data', (data) => {
            const text = data.toString();
            console.log('Python stderr:', text);
            errorOutput += text;
        });

        pythonProcess.on('error', (error) => {
            console.error('Failed to start Python process:', error);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
                success: false, 
                error: 'Failed to start Python: ' + error.message
            }));
        });

        pythonProcess.on('close', (code) => {
            console.log('Python process exited with code:', code);
            console.log('Python output:', output);
            if (errorOutput) console.log('Python errors:', errorOutput);
            
            if (code === 0) {
                // Parse the output to extract solution
                try {
                    const solution = parseSolverOutput(output);
                    if (solution) {
                        console.log('Parsed solution:', solution);
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ 
                            success: true, 
                            solution: solution,
                            output: output 
                        }));
                    } else {
                        console.log('No solution found in output');
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ 
                            success: false, 
                            error: 'No solution found',
                            output: output 
                        }));
                    }
                } catch (error) {
                    console.error('Parse error:', error);
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ 
                        success: false, 
                        error: 'Failed to parse solution: ' + error.message,
                        output: output 
                    }));
                }
            } else {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 
                    success: false, 
                    error: errorOutput || 'Python script failed',
                    output: output 
                }));
            }
        });
    } else if (req.url === '/' || req.url === '/index.html') {
        serveFile('index.html', 'text/html', res);
    } else if (req.url === '/test') {
        // Test endpoint
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Server is working!' }));
    } else if (req.url.endsWith('.js')) {
        serveFile(req.url.substring(1), 'application/javascript', res);
    } else {
        res.writeHead(404);
        res.end('Not found');
    }
});

function parseSolverOutput(output) {
    // Extract information from Python output
    const lines = output.split('\n');
    
    let pathLength = 0;
    let trapsCount = 0;
    let goalType = 'Edge';
    let path = [];
    
    // Check if solution was found first
    const solutionFound = output.includes('Solution found') || output.includes('[SUCCESS]');
    
    if (!solutionFound) {
        console.log('No solution indicators found in output');
        return null;
    }
    
    // Parse output
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        if (line.includes('Path length:')) {
            const match = line.match(/(\d+)\s*moves?/);
            if (match) {
                pathLength = parseInt(match[1]);
            }
        } else if (line.includes('Number of traps:')) {
            const match = line.match(/Number of traps:\s*(\d+)/);
            if (match) {
                trapsCount = parseInt(match[1]);
            }
        } else if (line.includes('Door found')) {
            goalType = 'Door';
        } else if (line.startsWith('Path:')) {
            // Parse path coordinates
            const pathStr = line.substring(5).trim();
            const pathParts = pathStr.split('->');
            path = pathParts.map(part => {
                const match = part.trim().match(/\((\d+),\s*(\d+)\)/);
                if (match) {
                    return [parseInt(match[1]), parseInt(match[2])];
                }
                return null;
            }).filter(p => p !== null);
        }
    }
    
    console.log('Parsed data:', { pathLength, trapsCount, goalType, pathCount: path.length });
    
    // Validate we have a valid path
    if (path.length === 0) {
        console.log('No path coordinates found in output');
        return null;
    }
    
    return {
        pathLength: pathLength,
        trapsCount: trapsCount,
        goalType: goalType,
        path: path
    };
}

function serveFile(filePath, contentType, res) {
    const fullPath = path.join(__dirname, filePath);
    fs.readFile(fullPath, (err, data) => {
        if (err) {
            res.writeHead(404);
            res.end('File not found');
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(data);
        }
    });
}

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
    console.log(`Open your browser and navigate to http://localhost:${PORT}`);
});
