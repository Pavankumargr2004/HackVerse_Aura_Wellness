import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, RefreshCw, CheckCircle } from 'lucide-react';

interface ColorWeaveProps {
    onBack: () => void;
}

interface Point { id: number; x: number; y: number; }
type Line = [Point, Point];

const initialPoints = [
    { id: 1, x: 100, y: 100 }, { id: 2, x: 300, y: 300 },
    { id: 3, x: 100, y: 300 }, { id: 4, x: 300, y: 100 },
    { id: 5, x: 50, y: 200 }, { id: 6, x: 350, y: 200 },
];
const initialLines: [number, number][] = [[1, 2], [3, 4], [5, 6]];

const checkIntersection = (l1: Line, l2: Line): boolean => {
    const [p1, p2] = l1;
    const [p3, p4] = l2;

    const det = (p2.x - p1.x) * (p4.y - p3.y) - (p2.y - p1.y) * (p4.x - p3.x);
    if (det === 0) return false;

    const t = ((p3.x - p1.x) * (p4.y - p3.y) - (p3.y - p1.y) * (p4.x - p3.x)) / det;
    const u = -((p2.x - p1.x) * (p3.y - p1.y) - (p2.y - p1.y) * (p3.x - p1.x)) / det;

    return t > 0 && t < 1 && u > 0 && u < 1;
};

const ColorWeave: React.FC<ColorWeaveProps> = ({ onBack }) => {
    const [points, setPoints] = useState<Point[]>(initialPoints);
    const [intersections, setIntersections] = useState(0);
    const [isSolved, setIsSolved] = useState(false);
    const [draggingPointId, setDraggingPointId] = useState<number | null>(null);
    const svgRef = useRef<SVGSVGElement>(null);

    const lines: Line[] = initialLines.map(([p1Id, p2Id]) => [
        points.find(p => p.id === p1Id)!,
        points.find(p => p.id === p2Id)!
    ]);

    useEffect(() => {
        let intersectionCount = 0;
        for (let i = 0; i < lines.length; i++) {
            for (let j = i + 1; j < lines.length; j++) {
                if (checkIntersection(lines[i], lines[j])) {
                    intersectionCount++;
                }
            }
        }
        setIntersections(intersectionCount);
        setIsSolved(intersectionCount === 0);
    }, [points]);

    const getMousePos = (e: React.MouseEvent) => {
        if (!svgRef.current) return { x: 0, y: 0 };
        const rect = svgRef.current.getBoundingClientRect();
        return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const handleMouseDown = (id: number) => {
        if (isSolved) return;
        setDraggingPointId(id);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (draggingPointId === null || isSolved) return;
        const { x, y } = getMousePos(e);
        setPoints(prevPoints => prevPoints.map(p =>
            p.id === draggingPointId ? { ...p, x, y } : p
        ));
    };

    const handleMouseUp = () => {
        setDraggingPointId(null);
    };
    
    const resetGame = () => {
        setPoints(initialPoints);
        setIsSolved(false);
    }

    return (
        <div className="glass-card h-full rounded-2xl p-4 sm:p-6 flex flex-col animate-fadeIn max-w-2xl mx-auto">
            <button onClick={onBack} className="self-start mb-4 text-primary hover:text-violet-300 font-semibold transition-colors flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" /> Back to Mini Games
            </button>
            <div className="text-center mb-4">
                <h2 className="text-3xl font-bold">Color Weave</h2>
                <p className="text-muted-foreground">Click and drag the nodes to untangle the lines.</p>
            </div>
            
            <div className="relative w-full aspect-square bg-secondary rounded-xl overflow-hidden cursor-pointer">
                <svg ref={svgRef} width="100%" height="100%" viewBox="0 0 400 400" onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
                    {lines.map((line, i) => (
                        <line key={i} x1={line[0].x} y1={line[0].y} x2={line[1].x} y2={line[1].y} strokeWidth="3" className="stroke-muted-foreground" />
                    ))}
                    {points.map(p => (
                        <circle key={p.id} cx={p.x} cy={p.y} r="10" onMouseDown={() => handleMouseDown(p.id)} className="fill-primary cursor-grab active:cursor-grabbing" />
                    ))}
                </svg>
                {isSolved && (
                    <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-center animate-fadeIn">
                        <CheckCircle className="h-16 w-16 text-emerald-400 mb-4" />
                        <h3 className="text-2xl font-bold text-white">Puzzle Solved!</h3>
                        <p className="text-muted-foreground">Great job finding clarity.</p>
                    </div>
                )}
            </div>

            <div className="mt-4 flex items-center justify-between">
                <p className="text-muted-foreground font-medium">Intersections: <span className="font-bold text-primary">{intersections}</span></p>
                <button onClick={resetGame} className="flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-semibold text-white bg-secondary hover:bg-muted transition-colors">
                    <RefreshCw className="h-5 w-5"/> Reset
                </button>
            </div>
        </div>
    );
};

export default ColorWeave;
