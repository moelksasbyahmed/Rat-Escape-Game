// Test script to verify server endpoints
console.log('Testing server endpoints...\n');

// Test 1: Save map
console.log('Test 1: Saving map data...');
fetch('http://localhost:3000/save_map', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        width: 12,
        height: 9,
        grid: [
            ['.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.'],
            ['.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.'],
            ['.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.'],
            ['.', '.', '.', '.', '.', '.', '.', '.', '.', 'C', '.', '.'],
            ['.', '.', '.', '.', 'D', '.', '.', '.', 'X', 'X', '.', '.'],
            ['.', '.', '.', '.', '.', '.', '.', '.', 'M', '.', '.', '.'],
            ['.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.'],
            ['.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.'],
            ['.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.']
        ]
    })
})
.then(res => res.json())
.then(data => {
    console.log('Save map result:', data);
    
    // Test 2: Run solver
    console.log('\nTest 2: Running solver...');
    return fetch('http://localhost:3000/run_solver', {
        method: 'POST'
    });
})
.then(res => res.json())
.then(data => {
    console.log('\nSolver result:', data);
    if (data.success) {
        console.log('\n✅ All tests passed!');
        console.log('Solution:', data.solution);
    } else {
        console.log('\n❌ Solver failed:', data.error);
        console.log('Output:', data.output);
    }
})
.catch(error => {
    console.error('\n❌ Test failed:', error);
});
