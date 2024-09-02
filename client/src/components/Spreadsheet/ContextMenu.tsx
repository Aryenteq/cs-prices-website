import React, { useEffect, useState } from "react";

type ContextMenuProps = {
    x: number;
    y: number;
    options: string[];
    onClick: (option: string) => void;
    onClose: () => void;
};

const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, options, onClick, onClose }) => {
    const [position, setPosition] = useState({ top: y, left: x });

    useEffect(() => {
        const menuHeight = options.length * 40; // menu item - 40px
        const menuWidth = 200; // menu width - 200px

        const screenHeight = window.innerHeight;
        const screenWidth = window.innerWidth;

        let newTop = y;
        let newLeft = x;

        // Position adjustments
        if (y + menuHeight > screenHeight) {
            newTop = y - menuHeight;
            if (newTop < 0) {
                newTop = 0;
            }
        }

        if (x + menuWidth > screenWidth) {
            newLeft = x - menuWidth;
            if (newLeft < 0) {
                newLeft = 0;
            }
        }

        setPosition({ top: newTop, left: newLeft });
    }, [x, y, options.length]);

    return (
        <div
            className="absolute bg-background border border-gray-300 rounded shadow-lg z-30"
            style={{ top: `${position.top}px`, left: `${position.left}px` }}
            onMouseLeave={onClose}
        >
            {options.map((option, index) => (
                <div
                    key={index}
                    className="p-2 hover:bg-background-dark cursor-pointer"
                    onClick={() => onClick(option)}
                >
                    {option}
                </div>
            ))}
        </div>
    );
};

export default ContextMenu;
