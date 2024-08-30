import React, { useState, useEffect, useRef } from "react";
import { useQuery } from "react-query";
import { SpreadsheetProps } from "../../pages/SpreadsheetPage";
import { getAuthHeader } from "../../utils/authHeader";
import { useInfo } from "../InfoContext";

import undoImg from "../../media/svgs/undo.svg";
import redoImg from "../../media/svgs/redo.svg";
import boldImg from "../../media/svgs/text-bold.svg";
import italicImg from "../../media/svgs/text-italic.svg";
import strikethroughImg from "../../media/svgs/strikethrough.svg";
import textColorImg from "../../media/svgs/text-color.svg";
import bgColorImg from "../../media/svgs/bg-color.svg";
import horizontalLeftAlignmentImg from "../../media/svgs/horizontal-left.svg";
import horizontalCenterAlignmentImg from "../../media/svgs/horizontal-center.svg";
import horizontalRightAlignmentImg from "../../media/svgs/horizontal-right.svg";
import verticalBottomAlignmentImg from "../../media/svgs/vertical-bottom.svg";
import verticalCenterAlignmentImg from "../../media/svgs/vertical-center.svg";
import verticalTopAlignmentImg from "../../media/svgs/vertical-top.svg";

const fetchSpreadsheetPermission = async (spreadsheetId: number): Promise<string> => {
    const headers = getAuthHeader();

    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/spreadsheet/${spreadsheetId}/permission`, {
        method: 'GET',
        headers: headers,
    });

    if (!response.ok) {
        throw new Error('Failed to fetch permission');
    }

    return response.json();
};

const SpreadsheetUtilities: React.FC<SpreadsheetProps & {
    selectedCellIds: number[];
    setSelectedCellIds: React.Dispatch<React.SetStateAction<number[]>>;
}> = ({ selectedCellIds, setSelectedCellIds, saving, setSaving, uid, spreadsheetId }) => {
    
    const { setInfo } = useInfo();
    const [permission, setPermission] = useState<string>('VIEW');
    const [isHorizontalAlignmentOpen, setHorizontalAlignmentOpen] = useState(false);
    const horizontalMenuRef = useRef<HTMLDivElement | null>(null);
    const [isVerticalAlignmentOpen, setVerticalAlignmentOpen] = useState(false);
    const verticalMenuRef = useRef<HTMLDivElement | null>(null);
    const [isFontMenuOpen, setFontMenuOpen] = useState(false);
    const fontMenuRef = useRef<HTMLDivElement | null>(null);
    const fonts = ['Arial', 'Open Sans', 'Playfair Display', 'Roboto', 'Dancing Script'];
    const [fontFamily, setFontFamily] = useState<string>('Arial');
    const [fontSize, setFontSize] = useState<number>(12);
    const [lastValidValue, setLastValidValue] = useState<string>('12');

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.currentTarget.value;

        if (/^\d*$/.test(value)) {
            setFontSize(Number(value));
            setLastValidValue(value);
        } else {
            e.currentTarget.value = lastValidValue;
        }
    };

    useQuery<string, Error>(
        ['spreadsheetPermission', spreadsheetId],
        () => fetchSpreadsheetPermission(spreadsheetId),
        {
            keepPreviousData: true,
            onSuccess: (data) => setPermission(data),
            onError: (error: any) => {
                console.error('Error getting spreadsheet permission:', error);
                const parsedMessage = JSON.parse(error.message);
                const errorMessage = parsedMessage.message || 'An unknown error occurred while getting your permissions.';
                setInfo({ message: errorMessage, isError: true });
            },
        }
    );

    const showVerticalMenu = () => {
        setVerticalAlignmentOpen((prev) => !prev);
    };

    const showHorizontalMenu = () => {
        setHorizontalAlignmentOpen((prev) => !prev);
    };

    const showFontMenu = () => {
        setFontMenuOpen((prev) => !prev);
    };

    const handleClickOutside = (event: MouseEvent) => {
        if (verticalMenuRef.current && !verticalMenuRef.current.contains(event.target as Node)) {
            setVerticalAlignmentOpen(false);
        }
        if (horizontalMenuRef.current && !horizontalMenuRef.current.contains(event.target as Node)) {
            setHorizontalAlignmentOpen(false);
        }
        if (fontMenuRef.current && !fontMenuRef.current.contains(event.target as Node)) {
            setFontMenuOpen(false);
        }
    };

    useEffect(() => {
        if (isVerticalAlignmentOpen || isHorizontalAlignmentOpen || isFontMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isVerticalAlignmentOpen, isHorizontalAlignmentOpen, isFontMenuOpen]);

    const handleFontChange = (font: string) => {
        setFontFamily(font);
        setFontMenuOpen(false);
    };

    const increaseFontSize = () => {
        setFontSize((prev) => Math.min(prev + 1, 48));
    };

    const decreaseFontSize = () => {
        setFontSize((prev) => Math.max(prev - 1, 8));
    };

    const isDisabled = permission === 'VIEW';

    return (
        <div className="relative flex items-center mx-4 gap-2">
            <button className="rounded p-1 hover:bg-gray-700 transition duration-300 ease-in-out" title="Undo (Ctrl+Z)" disabled={isDisabled}>
                <img src={undoImg} alt="Undo" className="w-6 h-6" />
            </button>
            <button className="rounded-lg p-1 hover:bg-gray-700 transition duration-300 ease-in-out" title="Redo (Ctrl+Y)" disabled={isDisabled}>
                <img src={redoImg} alt="Redo" className="w-6 h-6" />
            </button>

            <div className="bg-accent w-[1px] h-5 py-[1px]"></div>

            <div className="relative">
                <button
                    className="rounded p-1 hover:bg-gray-700 transition duration-300 ease-in-out"
                    title="Select Font"
                    onClick={showFontMenu}
                    disabled={isDisabled}
                >
                    <div className="text-white w-[100px] truncate">{fontFamily}</div>
                </button>

                {isFontMenuOpen && (
                    <div
                        ref={fontMenuRef}
                        className="absolute top-full left-0 mt-2 flex flex-col bg-gray-800 p-2 rounded shadow-lg z-10"
                    >
                        {fonts.map((font) => (
                            <button
                                key={font}
                                className="rounded p-1 hover:bg-gray-700 transition duration-300 ease-in-out text-white"
                                onClick={() => handleFontChange(font)}
                            >
                                {font}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="flex items-center">
                <button
                    className="rounded p-1 hover:bg-gray-700 transition duration-300 ease-in-out text-primary-light"
                    title="Decrease Font Size"
                    onClick={decreaseFontSize}
                    disabled={isDisabled}
                >
                    -
                </button>
                <input
                    type="text"
                    value={fontSize}
                    onChange={handleInputChange}
                    className="w-12 text-center bg-gray-900 text-white border border-gray-700 rounded"
                    disabled={isDisabled}
                />

                <button
                    className="rounded p-1 hover:bg-gray-700 transition duration-300 ease-in-out text-primary-light"
                    title="Increase Font Size"
                    onClick={increaseFontSize}
                    disabled={isDisabled}
                >
                    +
                </button>
            </div>
            
            <div className="bg-accent w-[1px] h-5 py-[1px]"></div>

            <button className="rounded p-1 hover:bg-gray-700 transition duration-300 ease-in-out" title="Bold (Ctrl+B)" disabled={isDisabled}>
                <img src={boldImg} alt="Bold" className="w-5 h-5" />
            </button>
            <button className="rounded p-1 hover:bg-gray-700 transition duration-300 ease-in-out" title="Italic (Ctrl+I)" disabled={isDisabled}>
                <img src={italicImg} alt="Italic" className="w-5 h-5" />
            </button>
            <button className="rounded p-1 hover:bg-gray-700 transition duration-300 ease-in-out" title="Strikethrough" disabled={isDisabled}>
                <img src={strikethroughImg} alt="Strikethrough" className="w-5 h-5" />
            </button>
            <button className="rounded p-1 hover:bg-gray-700 transition duration-300 ease-in-out" title="Text color" disabled={isDisabled}>
                <img src={textColorImg} alt="Text color" className="w-5 h-5" />
            </button>

            <div className="bg-accent w-[1px] h-5 py-[1px]"></div>

            <button className="rounded p-1 hover:bg-gray-700 transition duration-300 ease-in-out" title="Fill color" disabled={isDisabled}>
                <img src={bgColorImg} alt="Fill color" className="w-5 h-5" />
            </button>

            <div className="relative">
                <button
                    className="rounded p-1 hover:bg-gray-700 transition duration-300 ease-in-out"
                    title="Horizontal Align"
                    onClick={showHorizontalMenu}
                    disabled={isDisabled}
                >
                    <img src={horizontalLeftAlignmentImg} alt="Horizontal Align" className="w-5 h-5" />
                </button>

                {isHorizontalAlignmentOpen && (
                    <div
                        ref={horizontalMenuRef}
                        className="absolute top-full left-0 mt-2 flex bg-gray-800 p-2 rounded shadow-lg z-10"
                    >
                        <button className="rounded p-1 hover:bg-gray-700 transition duration-300 ease-in-out" title="Align on Left" disabled={isDisabled}>
                            <img src={horizontalLeftAlignmentImg} alt="Align on Left" className="w-5 h-5" style={{ maxWidth: 'none' }} />
                        </button>
                        <button className="rounded p-1 hover:bg-gray-700 transition duration-300 ease-in-out" title="Align on Center" disabled={isDisabled}>
                            <img src={horizontalCenterAlignmentImg} alt="Align on Center" className="w-5 h-5" style={{ maxWidth: 'none' }} />
                        </button>
                        <button className="rounded p-1 hover:bg-gray-700 transition duration-300 ease-in-out" title="Align on Right" disabled={isDisabled}>
                            <img src={horizontalRightAlignmentImg} alt="Align on Right" className="w-5 h-5" style={{ maxWidth: 'none' }} />
                        </button>
                    </div>
                )}
            </div>

            <div className="relative">
                <button
                    className="rounded p-1 hover:bg-gray-700 transition duration-300 ease-in-out"
                    title="Vertical Align"
                    onClick={showVerticalMenu}
                    disabled={isDisabled}
                >
                    <img src={verticalBottomAlignmentImg} alt="Vertical Align" className="w-5 h-5" />
                </button>

                {isVerticalAlignmentOpen && (
                    <div
                        ref={verticalMenuRef}
                        className="absolute top-full left-0 mt-2 flex bg-gray-800 p-2 rounded shadow-lg z-10"
                    >
                        <button className="rounded p-1 hover:bg-gray-700 transition duration-300 ease-in-out" title="Align on Top" disabled={isDisabled}>
                            <img src={verticalTopAlignmentImg} alt="Align on Top" className="w-5 h-5" style={{ maxWidth: 'none' }} />
                        </button>
                        <button className="rounded p-1 hover:bg-gray-700 transition duration-300 ease-in-out" title="Align on Center" disabled={isDisabled}>
                            <img src={verticalCenterAlignmentImg} alt="Align on Center" className="w-5 h-5" style={{ maxWidth: 'none' }} />
                        </button>
                        <button className="rounded p-1 hover:bg-gray-700 transition duration-300 ease-in-out" title="Align on Bottom" disabled={isDisabled}>
                            <img src={verticalBottomAlignmentImg} alt="Align on Bottom" className="w-5 h-5" style={{ maxWidth: 'none' }} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default SpreadsheetUtilities;