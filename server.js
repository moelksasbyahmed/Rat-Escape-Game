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
        
        const pythonProcess = spawn('python', ['bfs.py'], {
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
    // Extract JSON from Python output
    // Python might print other things (warnings, etc), so we look for the last line that looks like JSON
    const lines = output.trim().split('\n');
    let lastJson = null;

    for (let i = lines.length - 1; i >= 0; i--) {
        try {
            const parsed = JSON.parse(lines[i]);
            if (parsed.success !== undefined) {
                lastJson = parsed;
                break;
            }
        } catch (e) {
            // Not a JSON line, ignore
        }
    }
    
    if (!lastJson) {
        console.log('No valid JSON found in Python output');
        return null;
    }
    
    console.log('BFS Result:', lastJson);
    return lastJson;
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
