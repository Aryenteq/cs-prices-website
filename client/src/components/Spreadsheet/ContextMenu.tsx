import React from "react";

type ContextMenuProps = {
    x: number;
    y: number;
    options: string[];
    onClick: (option: string) => void;
    onClose: () => void;
};

const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, options, onClick, onClose }) => {
    return (
        <div
            className="absolute bg-background border border-gray-300 rounded shadow-lg z-30"
            style={{ top: `${y}px`, left: `${x}px` }}
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
