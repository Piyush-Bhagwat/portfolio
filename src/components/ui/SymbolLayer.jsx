import { useEffect, useState } from "react";
import Symbol from "./Symbols";

export default function SymbolLayer({
    depth = 5, // How much the layer moves
    symbolCount = 10,
    symbolSize = 40,
    symbol,
}) {
    const [mouse, setMouse] = useState({ x: 0, y: 0 });
    const [symbols, setSymbols] = useState([]);

    // Track mouse movement
    useEffect(() => {
        const handleMouseMove = (e) => {
            const { innerWidth, innerHeight } = window;
            const x = (e.clientX - innerWidth / 2) / (innerWidth / 2);
            const y = (e.clientY - innerHeight / 2) / (innerHeight / 2);
            setMouse({ x, y });
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    // Generate random positions
    useEffect(() => {
        let offset = 0;
        const positions = Array.from({ length: symbolCount }).map(() => {
            offset += 2;
            return {
                top: Math.random() * 130 + offset - 30,
                left: Math.random() * 130 + offset - 30,
            }
        });
        setSymbols(positions);
    }, [symbolCount]);

    return (
        <div
            className="layer"
            style={{
                transform: `translate(${mouse.x * depth}px, ${mouse.y * depth}px)`,
                transition: "transform 0.1s ease-out",
                position: "absolute",
                zIndex: 0,
                inset: 0,
                width: "100%",
                height: "100%",
                pointerEvents: "none",
            }}
        >
            {symbols.map((pos, index) => (
                <div
                    key={index}
                    style={{
                        position: "absolute",
                        top: `${pos.top}%`,
                        left: `${pos.left}%`,
                    }}
                >
                    <Symbol mouse={mouse} size={symbolSize} symbol={symbol}/>
                </div>
            ))}
        </div>

    );
}
