import { useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa6";

export default function Symbol({ mouse, size = 40, symbol }) {
    const [rotation, setRotation] = useState(0);
    const [randomOffset, setRandomOffset] = useState(0.1);

    useEffect(() => {
        setRandomOffset(Math.random());
    }, []);

    useEffect(() => {
        // Rotate based on mouse offset
        const angle = (mouse.x + mouse.y) * (15 * size * randomOffset + 70); // tweak multiplier for effect
        setRotation(angle);
    }, [mouse]);

    return (
        <div
            className="symbol-container"
            style={{
                width: size,
                height: size,
                transform: `rotate(${rotation}deg)`,
                transition: "transform 0.6s ease-out",
            }}
        >
            {symbol}
        </div>
    );
}
