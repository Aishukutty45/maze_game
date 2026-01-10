
const { useState, useEffect, useRef, useCallback } = React;

// --- Audio System ---
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

const playSound = (type) => {
    try {
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);

        const now = audioCtx.currentTime;

        if (type === 'move') {
            osc.frequency.setValueAtTime(300, now);
            osc.frequency.exponentialRampToValueAtTime(600, now + 0.1);
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
            osc.start(now);
            osc.stop(now + 0.1);
        } else if (type === 'wall') {
            osc.type = 'square';
            osc.frequency.setValueAtTime(150, now);
            osc.frequency.linearRampToValueAtTime(100, now + 0.1);
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
            osc.start(now);
            osc.stop(now + 0.15);
        } else if (type === 'win') {
            [440, 554, 659, 880].forEach((freq, i) => {
                const o = audioCtx.createOscillator();
                const g = audioCtx.createGain();
                o.connect(g);
                g.connect(audioCtx.destination);
                o.frequency.value = freq;
                g.gain.setValueAtTime(0.1, now + i * 0.1);
                g.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.5);
                o.start(now + i * 0.1);
                o.stop(now + i * 0.1 + 0.5);
            });
        }
    } catch (e) {
        console.error("Audio error", e);
    }
};

// --- Icons ---
const PlayIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
);
const RefreshIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 4v6h-6"></path><path d="M1 20v-6h6"></path><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
);
const ArrowLeftIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
);
const TrophyIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 21h8m-4-9v9m0-9a5 5 0 01-5-5V3h10v5a5 5 0 01-5 5z"></path></svg>
)

// --- Components ---

function Button({ children, onClick, variant = 'primary', className = '', disabled = false }) {
    const baseClass = "px-6 py-3 rounded-xl font-['Outfit'] font-bold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg active:scale-95 text-sm tracking-wide";
    const variants = {
        primary: "bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white shadow-violet-500/30 disabled:opacity-50 disabled:cursor-not-allowed border-t border-white/20",
        secondary: "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 disabled:opacity-50 disabled:cursor-not-allowed",
        outline: "border-2 border-slate-600 hover:bg-slate-800 text-slate-300"
    };
    return (
        <button onClick={onClick} disabled={disabled} className={`${baseClass} ${variants[variant]} ${className}`}>
            {children}
        </button>
    );
}

function Card({ children, className = '' }) {
    return (
        <div className={`glass-panel p-6 rounded-xl ${className}`}>
            {children}
        </div>
    );
}

function WinModal({ show, stats, onRetry, onNext }) {
    if (!show) return null;
    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-slate-800 p-8 rounded-2xl shadow-2xl border border-yellow-500/30 flex flex-col items-center gap-6 max-w-sm w-full transform scale-100 animate-in zoom-in-95 duration-200">
                <div className="p-4 bg-yellow-500/10 rounded-full animate-bounce">
                    <TrophyIcon />
                </div>
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-white mb-2">Level Complete!</h2>
                    <p className="text-slate-400">Great job!</p>
                </div>

                <div className="flex gap-8 w-full justify-center py-4 border-y border-slate-700">
                    <div className="text-center">
                        <div className="text-sm text-slate-500 uppercase tracking-wider">Time</div>
                        <div className="text-2xl font-mono text-yellow-400">{(stats.time / 1000).toFixed(1)}s</div>
                    </div>
                    <div className="text-center">
                        <div className="text-sm text-slate-500 uppercase tracking-wider">Moves</div>
                        <div className="text-2xl font-mono text-purple-400">{stats.moves}</div>
                    </div>
                </div>

                <div className="flex gap-3 w-full">
                    <Button onClick={onRetry} variant="secondary" className="flex-1">Replay</Button>
                    <Button onClick={onNext} className="flex-1">Next Level</Button>
                </div>
            </div>
        </div>
    );
}

// --- Maze Game ---

function MazeGame({ onBack }) {
    const [levels, setLevels] = useState([]);
    const [currentLevel, setCurrentLevel] = useState(null);
    const [grid, setGrid] = useState([]);
    const [playerPos, setPlayerPos] = useState(null);
    const [algorithm, setAlgorithm] = useState("BFS");

    const [status, setStatus] = useState("idle");
    const [gameStats, setGameStats] = useState({ moves: 0, time: 0, startTime: 0 });
    const [aiStats, setAiStats] = useState({ steps: 0, visited: 0 });

    const timerRef = useRef(null);

    // Refs for Event Listener to avoid stale closures without constant re-binding
    const stateRef = useRef({
        playerPos: null,
        grid: [],
        status: 'idle',
        currentLevel: null,
        gameStats: { moves: 0, time: 0, startTime: 0 }
    });

    // Keep refs synced
    useEffect(() => {
        stateRef.current = { playerPos, grid, status, currentLevel, gameStats };
    }, [playerPos, grid, status, currentLevel, gameStats]);

    useEffect(() => {
        axios.get('/api/levels/maze').then(res => {
            setLevels(res.data);
            if (res.data.length > 0) loadLevel(res.data[0]);
        });
        return () => stopTimer();
    }, []);

    const startTimer = () => {
        if (timerRef.current) return;
        setGameStats(prev => {
            // ensure base starts now if 0
            const now = Date.now();
            return { ...prev, startTime: now };
        });
        timerRef.current = setInterval(() => {
            setGameStats(prev => ({ ...prev, time: Date.now() - prev.startTime }));
        }, 100);
    };

    const stopTimer = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    };

    useEffect(() => {
        const handleKeyDown = (e) => {
            const { playerPos, grid, status, currentLevel } = stateRef.current; // Read latest from ref

            // Allow standard keys if not navigating
            if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) return;
            e.preventDefault();

            if ((status !== 'idle' && status !== 'playing') || !playerPos || !grid.length) return;

            let dr = 0, dc = 0;
            if (e.key === 'ArrowUp') dr = -1;
            else if (e.key === 'ArrowDown') dr = 1;
            else if (e.key === 'ArrowLeft') dc = -1;
            else if (e.key === 'ArrowRight') dc = 1;

            const [r, c] = playerPos;
            const nr = r + dr;
            const nc = c + dc;

            // Start game if idle
            if (status === 'idle') {
                setStatus('playing');
                startTimer();
                // update ref immediately for next rapid key
                stateRef.current.status = 'playing';
            }

            if (nr >= 0 && nr < grid.length && nc >= 0 && nc < grid[0].length) {
                if (grid[nr][nc].type !== 'wall') {
                    setPlayerPos([nr, nc]);
                    setGameStats(prev => ({ ...prev, moves: prev.moves + 1 }));
                    playSound('move');

                    if (currentLevel && nr === currentLevel.goal[0] && nc === currentLevel.goal[1]) {
                        stopTimer();
                        setStatus("finished");
                        playSound('win');
                    }
                } else {
                    playSound('wall');
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []); // Empty dependency array = bound once!

    const loadLevel = (lvl) => {
        setCurrentLevel(lvl);
        setGrid(lvl.layout.map(row => row.map(cell => ({
            type: cell === 1 ? 'wall' : 'free',
            state: 'default'
        }))));
        setPlayerPos(lvl.start);
        setStatus("idle");
        stopTimer();
        setGameStats({ moves: 0, time: 0, startTime: 0 });
        setAiStats({ steps: 0, visited: 0 });
    };

    const handleSolve = async () => {
        if (!currentLevel) return;
        setStatus("computing");
        stopTimer();
        setGrid(prev => prev.map(row => row.map(cell => ({ ...cell, state: 'default' }))));
        setPlayerPos(currentLevel.start);

        try {
            const res = await axios.post('/api/maze/solve', {
                levelId: currentLevel.id,
                algorithm
            });
            const data = res.data;
            if (data.found) {
                setAiStats({ steps: data.steps, visited: data.visited_count });
                animateSolution(data.history, data.path);
            } else {
                alert("No path found!");
                setStatus("idle");
            }
        } catch (e) {
            console.error(e);
            setStatus("idle");
        }
    };

    const animateSolution = (history, path) => {
        setStatus("animating");
        let i = 0;
        const speed = history.length > 50 ? 10 : 30;

        const visitInterval = setInterval(() => {
            if (i >= history.length) {
                clearInterval(visitInterval);
                animatePath(path);
                return;
            }
            const [r, c] = history[i];
            setGrid(prev => {
                const newGrid = [...prev];
                if (newGrid[r]) {
                    newGrid[r] = [...prev[r]];
                    newGrid[r][c].state = 'visited';
                }
                return newGrid;
            });
            i++;
        }, speed);
    };

    const animatePath = (path) => {
        let i = 0;
        const pathInterval = setInterval(() => {
            if (i >= path.length) {
                clearInterval(pathInterval);
                setStatus("idle");
                return;
            }
            const [r, c] = path[i];
            setGrid(prev => {
                const newGrid = [...prev];
                if (newGrid[r]) {
                    newGrid[r] = [...prev[r]];
                    newGrid[r][c].state = 'path';
                }
                return newGrid;
            });
            i++;
        }, 30);
    };

    const nextLevel = () => {
        const idx = levels.findIndex(l => l.id === currentLevel.id);
        if (idx >= 0 && idx < levels.length - 1) loadLevel(levels[idx + 1]);
        else loadLevel(levels[0]);
    }

    const getCellColor = (r, c, cell) => {
        const isPlayer = playerPos && r === playerPos[0] && c === playerPos[1];
        const isStart = currentLevel && r === currentLevel.start[0] && c === currentLevel.start[1];
        const isGoal = currentLevel && r === currentLevel.goal[0] && c === currentLevel.goal[1];

        if (status === 'playing' || status === 'idle' || status === 'finished') {
            if (isPlayer) return 'bg-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.8)] z-20 scale-110 ring-2 ring-white';
        }

        if (isStart) return 'bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.6)] z-10 ring-2 ring-green-300';
        if (isGoal) return 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.6)] z-10 ring-2 ring-red-300';

        // Darker, distinct walls
        if (cell.type === 'wall') return 'bg-slate-950 border border-slate-900 shadow-inner';

        switch (cell.state) {
            case 'path': return 'bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)] animate-pulse ring-1 ring-purple-300';
            case 'visited': return 'bg-indigo-500/20 border border-indigo-500/10';
            // Default floor tile look - Lighter and distinct (Slate 700)
            default: return 'bg-slate-700 border border-slate-600 hover:bg-slate-600 transition-colors shadow-sm';
        }
    };

    return (
        <div className="flex gap-6 h-full p-6 relative">
            <WinModal
                show={status === 'finished'}
                stats={gameStats}
                onRetry={() => loadLevel(currentLevel)} // Fixed retry ref
                onNext={nextLevel}
            />

            <div className="w-1/4 space-y-6 flex flex-col z-10">
                <Button onClick={onBack} variant="outline" className="w-fit"><ArrowLeftIcon /> Back</Button>

                <Card className="flex-1 flex flex-col gap-6">
                    <div>
                        <h2 className="text-xl font-bold text-slate-200">{currentLevel?.name || "Loading..."}</h2>
                        <div className="text-sm text-slate-500">Manual Control</div>
                    </div>

                    <div className="flex flex-col gap-4">
                        <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700 flex justify-between items-center">
                            <div>
                                <div className="text-xs text-slate-400 uppercase">Time</div>
                                <div className="text-2xl font-mono text-white">{(gameStats.time / 1000).toFixed(1)}s</div>
                            </div>
                            <div className="text-right">
                                <div className="text-xs text-slate-400 uppercase">Moves</div>
                                <div className="text-2xl font-mono text-white">{gameStats.moves}</div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg text-sm text-slate-400">
                            <span className="p-1 px-2 bg-slate-700 rounded text-slate-200 font-bold border-b-2 border-slate-600">↑↓←→</span> to move
                        </div>
                    </div>

                    <div className="h-px bg-slate-700 my-2"></div>

                    <div>
                        <h3 className="text-sm font-bold text-purple-400 mb-2">AI Solver</h3>
                        <div className="flex gap-2 mb-4">
                            {['BFS', 'DFS', 'A*'].map(algo => (
                                <button
                                    key={algo}
                                    onClick={() => setAlgorithm(algo)}
                                    className={`flex-1 py-1 rounded text-xs font-semibold transition-colors border ${algorithm === algo ? 'bg-purple-600 border-purple-500 text-white' : 'border-slate-700 text-slate-500 hover:border-slate-500'}`}
                                    disabled={status === 'animating'}
                                >
                                    {algo}
                                </button>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <Button onClick={handleSolve} disabled={status === 'playing' || status === 'animating'} className="flex-1 text-sm bg-slate-700">
                                🤖 Visualize AI
                            </Button>
                            <Button onClick={() => loadLevel(currentLevel)} variant="secondary" className="px-3" disabled={status === 'animating'}>
                                <RefreshIcon />
                            </Button>
                        </div>
                        {(aiStats.steps > 0 || status === 'animating') && (
                            <div className="mt-4 text-xs text-slate-500 flex justify-between">
                                <span>Analyzed: {aiStats.visited} nodes</span>
                                <span>Path: {aiStats.steps} len</span>
                            </div>
                        )}
                    </div>
                </Card>
            </div>

            <div className="flex-1 glass-panel rounded-xl p-8 flex items-center justify-center overflow-auto relative z-0">
                {grid.length > 0 && (
                    <div
                        className="grid gap-1 bg-slate-900 p-3 rounded-lg shadow-2xl border border-slate-700"
                        style={{
                            gridTemplateColumns: `repeat(${grid[0].length}, minmax(0, 1fr))`,
                            width: 'min(100%, 600px)',
                            aspectRatio: `${grid[0].length}/${grid.length}`
                        }}
                    >
                        {grid.map((row, r) => row.map((cell, c) => (
                            <div
                                key={`${r}-${c}`}
                                className={`rounded-sm transition-all duration-200 ${getCellColor(r, c, cell)}`}
                            />
                        )))}
                    </div>
                )}
            </div>
        </div>
    );
}

// --- Puzzle Game ---

function PuzzleGame({ onBack }) {
    const [levels, setLevels] = useState([]);
    const [currentLevel, setCurrentLevel] = useState(null);
    const [board, setBoard] = useState([]);
    const [algorithm, setAlgorithm] = useState("BFS");

    const [status, setStatus] = useState("idle");
    const [gameStats, setGameStats] = useState({ moves: 0, time: 0, startTime: 0 });
    const timerRef = useRef(null);

    // Refs for Event Listener
    const stateRef = useRef({ board: [], status: 'idle' });
    useEffect(() => {
        stateRef.current = { board, status };
    }, [board, status]);

    useEffect(() => {
        axios.get('/api/levels/puzzle').then(res => {
            setLevels(res.data);
            if (res.data.length > 0) loadLevel(res.data[0]);
        });
        return () => stopTimer();
    }, []);

    const startTimer = () => {
        if (timerRef.current) return;
        setGameStats(prev => ({ ...prev, startTime: Date.now() }));
        timerRef.current = setInterval(() => {
            setGameStats(prev => ({ ...prev, time: Date.now() - prev.startTime }));
        }, 100);
    };

    const stopTimer = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    };

    useEffect(() => {
        const handleKeyDown = (e) => {
            const { board, status } = stateRef.current;
            if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) return;
            e.preventDefault();

            if (status === 'animating' || board.length === 0 || status === 'finished') return;

            let dr = 0, dc = 0;
            if (e.key === 'ArrowUp') dr = -1;
            else if (e.key === 'ArrowDown') dr = 1;
            else if (e.key === 'ArrowLeft') dc = -1;
            else if (e.key === 'ArrowRight') dc = 1;

            if (status === 'idle') {
                setStatus('playing');
                startTimer();
                stateRef.current.status = 'playing';
            }

            const idx = board.indexOf(0);
            if (idx === -1) return;
            const r = Math.floor(idx / 3);
            const c = idx % 3;
            const nr = r + dr;
            const nc = c + dc;

            if (nr >= 0 && nr < 3 && nc >= 0 && nc < 3) {
                const nIdx = nr * 3 + nc;
                const newBoard = [...board];
                [newBoard[idx], newBoard[nIdx]] = [newBoard[nIdx], newBoard[idx]];

                setBoard(newBoard);

                setGameStats(prev => ({ ...prev, moves: prev.moves + 1 }));
                playSound('move');

                // Goal check
                if (newBoard.every((val, i) => val === [1, 2, 3, 4, 5, 6, 7, 8, 0][i])) {
                    stopTimer();
                    setStatus("finished");
                    playSound('win');
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const loadLevel = (lvl) => {
        setCurrentLevel(lvl);
        setBoard([...lvl.state]);
        setStatus("idle");
        stopTimer();
        setGameStats({ moves: 0, time: 0, startTime: 0 });
    };

    const handleSolve = async () => {
        setStatus("computing");
        stopTimer();
        try {
            const res = await axios.post('/api/puzzle/solve', {
                state: board,
                algorithm
            });
            const data = res.data;
            if (data.found) {
                animateSolution(data.path);
            } else {
                alert("No solution found within limits");
                setStatus("idle");
            }
        } catch (e) {
            console.error(e);
            setStatus("idle");
        }
    };

    const animateSolution = (pathStates) => {
        setStatus("animating");
        let i = 0;
        const interval = setInterval(() => {
            if (i >= pathStates.length) {
                clearInterval(interval);
                setStatus("idle");
                return;
            }
            setBoard(pathStates[i]);
            playSound('move');
            i++;
        }, 300);
    };

    return (
        <div className="flex gap-6 h-full p-6 relative">
            <WinModal
                show={status === 'finished'}
                stats={gameStats}
                onRetry={() => loadLevel(currentLevel)}
                onNext={() => {
                    const idx = levels.findIndex(l => l.id === currentLevel.id);
                    if (idx >= 0 && idx < levels.length - 1) loadLevel(levels[idx + 1]);
                    else loadLevel(levels[0]);
                }}
            />

            <div className="w-1/4 space-y-6 flex flex-col z-10">
                <Button onClick={onBack} variant="outline" className="w-fit"><ArrowLeftIcon /> Back</Button>

                <Card className="flex-1 flex flex-col gap-6">
                    <div>
                        <h2 className="text-xl font-bold text-slate-200">{currentLevel?.name || "Loading..."}</h2>
                        <div className="text-sm text-slate-500">Sliding Puzzle</div>
                    </div>

                    <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                        {levels.map(l => (
                            <button
                                key={l.id}
                                onClick={() => loadLevel(l)}
                                className={`text-left px-3 py-2 rounded text-xs border transition-all ${currentLevel?.id === l.id ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'}`}
                            >
                                {l.name}
                            </button>
                        ))}
                    </div>

                    <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700 flex justify-between items-center">
                        <div>
                            <div className="text-xs text-slate-400 uppercase">Time</div>
                            <div className="text-2xl font-mono text-white">{(gameStats.time / 1000).toFixed(1)}s</div>
                        </div>
                        <div className="text-right">
                            <div className="text-xs text-slate-400 uppercase">Moves</div>
                            <div className="text-2xl font-mono text-white">{gameStats.moves}</div>
                        </div>
                    </div>

                    <div className="h-px bg-slate-700"></div>

                    <div>
                        <h3 className="text-sm font-bold text-purple-400 mb-2">AI Solver</h3>
                        <div className="flex gap-2">
                            <Button onClick={handleSolve} disabled={status === 'animating' || status === 'finished'} className="flex-1 text-xs">
                                🤖 Auto Solve
                            </Button>
                        </div>
                    </div>
                </Card>
            </div>

            <div className="flex-1 glass-panel rounded-xl p-8 flex flex-col items-center justify-center gap-8 z-0">

                <div className="relative bg-slate-800 p-4 rounded-xl shadow-2xl border border-slate-700" style={{ width: '340px', height: '340px' }}>
                    <div className="grid grid-cols-3 gap-2 w-full h-full">
                        {board.map((val, idx) => (
                            <div
                                key={idx}
                                className={`
                                    rounded-lg flex items-center justify-center text-3xl font-bold shadow-lg transition-all duration-200 select-none
                                    ${val === 0
                                        ? 'bg-slate-900/50 border border-slate-700/50'
                                        : 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-t border-white/20'
                                    }
                                    ${status === 'finished' && val !== 0 ? 'from-green-500 to-emerald-600' : ''}
                                `}
                            >
                                {val !== 0 && val}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="text-slate-500 text-sm">
                    Use <span className="font-bold text-slate-300">Arrow Keys</span> to move tiles. Click anywhere to focus if keys don't work.
                </div>
            </div>
        </div>
    );
}

// --- Home Screen ---

function Home({ onSelectMode }) {
    return (
        <div className="flex flex-col items-center justify-center h-full relative overflow-hidden">
            {/* Background Blobs */}
            <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[100px] animate-pulse"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }}></div>

            <div className="text-center space-y-6 z-10 mb-16 relative">
                <div className="inline-block relative">
                    <h1 className="text-7xl md:text-8xl font-['Fredoka_One'] text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 pb-4 filter drop-shadow-2xl">
                        GRID MASTERS
                    </h1>
                    <div className="absolute -top-6 -right-6 text-4xl animate-bounce">✨</div>
                </div>

                <p className="text-2xl text-slate-300 font-['Outfit'] font-light max-w-xl mx-auto leading-relaxed">
                    Challenge your mind with <span className="text-purple-400 font-bold">Search Algorithms</span> and <span className="text-pink-400 font-bold">Puzzle Solving</span>.
                </p>

                <div className="flex justify-center gap-4">
                    <div className="px-4 py-1 rounded-full bg-slate-800/50 border border-slate-700 text-xs text-slate-400 uppercase tracking-widest">v1.0.0 Alpha</div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl px-8 z-10">
                <div
                    onClick={() => onSelectMode('maze')}
                    className="group relative h-72 bg-slate-800/60 backdrop-blur-xl rounded-3xl border border-slate-700/50 hover:border-blue-500/50 transition-all duration-500 cursor-pointer overflow-hidden flex flex-col justify-end p-8 hover:shadow-[0_0_40px_rgba(59,130,246,0.3)] hover:-translate-y-2"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="absolute top-0 right-0 p-8 transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                        <span className="text-8xl filter drop-shadow-lg opacity-80">🕸️</span>
                    </div>

                    <div className="relative z-10 space-y-2">
                        <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mb-4 group-hover:bg-blue-500 group-hover:text-white transition-colors duration-300">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="m14.31 8-5.74 9.94"></path><path d="M9.69 8h11.48"></path><path d="m7.38 12 5.74-9.94"></path><path d="M9.69 16L3.95 6.06"></path><path d="M14.31 16H2.83"></path><path d="m16.62 12-5.74 9.94"></path></svg>
                        </div>
                        <h3 className="text-4xl font-['Fredoka_One'] text-white group-hover:text-blue-200 transition-colors">Maze Runner</h3>
                        <p className="text-slate-400 font-['Outfit'] group-hover:text-slate-200">Navigate complex grids. Use BFS, DFS, and A* to find the perfect path.</p>
                    </div>

                    <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
                        <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                        </div>
                    </div>
                </div>

                <div
                    onClick={() => onSelectMode('puzzle')}
                    className="group relative h-72 bg-slate-800/60 backdrop-blur-xl rounded-3xl border border-slate-700/50 hover:border-fuchsia-500/50 transition-all duration-500 cursor-pointer overflow-hidden flex flex-col justify-end p-8 hover:shadow-[0_0_40px_rgba(217,70,239,0.3)] hover:-translate-y-2"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-600/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="absolute top-0 right-0 p-8 transform group-hover:scale-110 group-hover:-rotate-12 transition-all duration-500">
                        <span className="text-8xl filter drop-shadow-lg opacity-80">🧩</span>
                    </div>

                    <div className="relative z-10 space-y-2">
                        <div className="w-12 h-12 rounded-xl bg-fuchsia-500/20 flex items-center justify-center mb-4 group-hover:bg-fuchsia-500 group-hover:text-white transition-colors duration-300">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><rect x="7" y="7" width="3" height="3"></rect><rect x="14" y="7" width="3" height="3"></rect><rect x="7" y="14" width="3" height="3"></rect><rect x="14" y="14" width="3" height="3"></rect></svg>
                        </div>
                        <h3 className="text-4xl font-['Fredoka_One'] text-white group-hover:text-fuchsia-200 transition-colors">8-Puzzle</h3>
                        <p className="text-slate-400 font-['Outfit'] group-hover:text-slate-200">The classic sliding tile game. Solve states and watch the AI optimize the moves.</p>
                    </div>

                    <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
                        <div className="w-10 h-10 rounded-full bg-fuchsia-500 flex items-center justify-center text-white">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                        </div>
                    </div>
                </div>
            </div>

            <footer className="absolute bottom-6 text-slate-500 text-sm font-['Outfit'] opacity-50">
                Built with Python (Flask) & React
            </footer>
        </div>
    );
}

// --- Main App ---

function App() {
    const [mode, setMode] = useState('home'); // home, maze, puzzle

    return (
        <div className="h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-opacity-20">
            {mode === 'home' && <Home onSelectMode={setMode} />}
            {mode === 'maze' && <MazeGame onBack={() => setMode('home')} />}
            {mode === 'puzzle' && <PuzzleGame onBack={() => setMode('home')} />}
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
