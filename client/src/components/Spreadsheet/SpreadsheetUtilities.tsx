import React, { useState, useEffect, useRef } from "react";
import { useMutation } from "react-query";
import { Button, Popover } from '@mui/material';
import { SketchPicker } from 'react-color';

import { SpreadsheetProps } from "../../pages/SpreadsheetPage";
import { useInfo } from "../InfoContext";
import { sketchColors } from "./Functions/Utils";
import {
    updateCellsStyle, updateCellsHorizontalAlignment,
    updateCellsVerticalAlignment, updateCellsColor, updateCellsBgColor
} from "./Functions/CellFetch";
import { Spreadsheet, HorizontalAlignment, VerticalAlignment } from "./Functions/Types";

import { DEFAULT_FONT_SIZE } from "./SpreadsheetTable";

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

const fonts = ['Arial', 'Times New Roman', 'Verdana', 'Helvetica', 'Georgia', 'Courier New',
    'Trebuchet MS', 'Impact', 'Open Sans', 'Playfair Display', 'Roboto', 'Dancing Script'];

const SpreadsheetUtilities: React.FC<SpreadsheetProps> = ({ setSaving, spreadsheet, setSpreadsheet, selectedCellIds, setSelectedCellIds,
    currentFontFamily, setCurrentFontFamily, currentFontSize, setCurrentFontSize, currentTextColor, setCurrentTextColor, currentBgColor, setCurrentBgColor
}) => {

    const { setInfo } = useInfo();
    const [isHorizontalAlignmentOpen, setHorizontalAlignmentOpen] = useState(false);
    const horizontalMenuRef = useRef<HTMLDivElement | null>(null);
    const [isVerticalAlignmentOpen, setVerticalAlignmentOpen] = useState(false);
    const verticalMenuRef = useRef<HTMLDivElement | null>(null);
    const [isFontMenuOpen, setFontMenuOpen] = useState(false);
    const fontMenuRef = useRef<HTMLDivElement | null>(null);
    const [lastValidValue, setLastValidValue] = useState<string>(`${DEFAULT_FONT_SIZE}`);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.currentTarget.value;

        if (/^\d*$/.test(value)) {
            setCurrentFontSize(Number(value));
            setLastValidValue(value);
            if (Number(value) >= 5 && Number(value) <= 48) {
                toggleTextStyle('fontSize', value);
            }
        } else {
            e.currentTarget.value = lastValidValue;
        }
    };

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
        setCurrentFontFamily(() => {
            toggleTextStyle('fontFamily', font);
            return font;
        });
        setFontMenuOpen(false);
    };

    const increaseFontSize = () => {
        setCurrentFontSize((prevFontSize) => {
            const newFontSize = Math.min(prevFontSize + 1, 48);
            toggleTextStyle('fontSize', `${newFontSize}`);
            return newFontSize;
        });
    };

    const decreaseFontSize = () => {
        setCurrentFontSize((prevFontSize) => {
            const newFontSize = Math.max(prevFontSize - 1, 5);
            toggleTextStyle('fontSize', `${newFontSize}`);
            return newFontSize;
        });
    };



    const isDisabled = spreadsheet!.permission === 'VIEW';



    //
    //
    // MUTATIONS
    //
    //

    const { mutate: updateCellsStyleMutation } = useMutation(updateCellsStyle, {
        onSuccess: () => {
            setSaving(false);
        },
        onError: (error: any) => {
            setSaving(false);
            if (error.status !== 401) {
                console.error('Error updating styles:', error);
            }
            setInfo({ message: 'Something went wrong updating the styles', isError: true });
        }
    });

    const { mutate: updateCellsHorizontalAlignmentMutation } = useMutation(updateCellsHorizontalAlignment, {
        onSuccess: () => {
            setSaving(false);
        },
        onError: (error: any) => {
            setSaving(false);
            if (error.status !== 401) {
                console.error('Error updating styles:', error);
            }
            setInfo({ message: 'Something went wrong updating the styles', isError: true });
        }
    });

    const { mutate: updateCellsVerticalAlignmentMutation } = useMutation(updateCellsVerticalAlignment, {
        onSuccess: () => {
            setSaving(false);
        },
        onError: (error: any) => {
            setSaving(false);
            if (error.status !== 401) {
                console.error('Error updating styles:', error);
            }
            setInfo({ message: 'Something went wrong updating the styles', isError: true });
        }
    });

    const { mutate: updateCellsColorMutation } = useMutation(updateCellsColor, {
        onSuccess: () => {
            setSaving(false);
        },
        onError: (error: any) => {
            setSaving(false);
            if (error.status !== 401) {
                console.error('Error updating styles:', error);
            }
            setInfo({ message: 'Something went wrong updating the styles', isError: true });
        }
    });

    const { mutate: updateCellsBgColorMutation } = useMutation(updateCellsBgColor, {
        onSuccess: () => {
            setSaving(false);
        },
        onError: (error: any) => {
            setSaving(false);
            if (error.status !== 401) {
                console.error('Error updating styles:', error);
            }
            setInfo({ message: 'Something went wrong updating the styles', isError: true });
        }
    });


    const toggleTextStyle = (styleProperty: 'fontFamily' | 'fontSize' | 'fontWeight' | 'fontStyle' | 'textDecoration', toggleValue: string) => {
        if (selectedCellIds.length > 0) {
            const allHaveStyle = selectedCellIds.every((cellId) => {
                const cell = spreadsheet?.sheet?.cells.find(cell => cell.id === cellId);
                return cell?.style?.[styleProperty] === toggleValue;
            });

            let newValue: string | number = toggleValue;
            if (styleProperty !== 'fontFamily' && styleProperty !== 'fontSize') {
                newValue = allHaveStyle ? (styleProperty === 'textDecoration' ? 'none' : 'normal') : toggleValue;
            }

            if (styleProperty === 'fontSize') {
                newValue = Number(toggleValue);
            }

            setSpreadsheet((prevSpreadsheet: Spreadsheet | undefined) => {
                if (!prevSpreadsheet) {
                    return prevSpreadsheet;
                }

                const updatedSheet = {
                    ...prevSpreadsheet.sheet,
                    cells: prevSpreadsheet.sheet.cells.map(cell =>
                        selectedCellIds.includes(cell.id)
                            ? { ...cell, style: { ...cell.style, [styleProperty]: newValue } }
                            : cell
                    )
                };

                return {
                    ...prevSpreadsheet,
                    sheet: updatedSheet,
                };
            });

            const stylesToUpdate = selectedCellIds.map((cellId) => ({
                cellId: cellId,
                style: { [styleProperty]: newValue }
            }));

            setSaving(true);
            updateCellsStyleMutation(stylesToUpdate);
        }
    };


    const setHorizontalAlignment = (value: HorizontalAlignment) => {
        if (selectedCellIds.length > 0) {
            setSpreadsheet((prevSpreadsheet: Spreadsheet | undefined) => {
                if (!prevSpreadsheet) {
                    return prevSpreadsheet;
                }

                const updatedSheet = {
                    ...prevSpreadsheet.sheet,
                    cells: prevSpreadsheet.sheet.cells.map(cell =>
                        selectedCellIds.includes(cell.id)
                            ? { ...cell, hAlignment: value }
                            : cell
                    )
                };

                return {
                    ...prevSpreadsheet,
                    sheet: updatedSheet,
                };
            });


            const hAlignmentsToUpdate = selectedCellIds.map((cellId) => ({
                cellId: cellId,
                hAlignment: value,
            }));

            setSaving(true);
            updateCellsHorizontalAlignmentMutation(hAlignmentsToUpdate);
        }
    };

    const setVerticalAlignment = (value: VerticalAlignment) => {
        if (selectedCellIds.length > 0) {
            setSpreadsheet((prevSpreadsheet: Spreadsheet | undefined) => {
                if (!prevSpreadsheet) {
                    return prevSpreadsheet;
                }

                const updatedSheet = {
                    ...prevSpreadsheet.sheet,
                    cells: prevSpreadsheet.sheet.cells.map(cell =>
                        selectedCellIds.includes(cell.id)
                            ? { ...cell, vAlignment: value }
                            : cell
                    )
                };

                return {
                    ...prevSpreadsheet,
                    sheet: updatedSheet,
                };
            });


            const vAlignmentsToUpdate = selectedCellIds.map((cellId) => ({
                cellId: cellId,
                vAlignment: value,
            }));

            setSaving(true);
            updateCellsVerticalAlignmentMutation(vAlignmentsToUpdate);
        }
    };

    const setTextColor = (value: string) => {
        if (selectedCellIds.length > 0) {
            setSpreadsheet((prevSpreadsheet: Spreadsheet | undefined) => {
                if (!prevSpreadsheet) {
                    return prevSpreadsheet;
                }

                const updatedSheet = {
                    ...prevSpreadsheet.sheet,
                    cells: prevSpreadsheet.sheet.cells.map(cell =>
                        selectedCellIds.includes(cell.id)
                            ? { ...cell, color: value }
                            : cell
                    )
                };

                return {
                    ...prevSpreadsheet,
                    sheet: updatedSheet,
                };
            });


            const colorsToUpdate = selectedCellIds.map((cellId) => ({
                cellId: cellId,
                color: value,
            }));

            setSaving(true);
            updateCellsColorMutation(colorsToUpdate);
        }
    };

    const setBgColor = (value: string) => {
        if (selectedCellIds.length > 0) {
            setSpreadsheet((prevSpreadsheet: Spreadsheet | undefined) => {
                if (!prevSpreadsheet) {
                    return prevSpreadsheet;
                }

                const updatedSheet = {
                    ...prevSpreadsheet.sheet,
                    cells: prevSpreadsheet.sheet.cells.map(cell =>
                        selectedCellIds.includes(cell.id)
                            ? { ...cell, bgColor: value }
                            : cell
                    )
                };

                return {
                    ...prevSpreadsheet,
                    sheet: updatedSheet,
                };
            });


            const colorsToUpdate = selectedCellIds.map((cellId) => ({
                cellId: cellId,
                bgColor: value,
            }));

            setSaving(true);
            updateCellsBgColorMutation(colorsToUpdate);
        }
    };

    const [anchorElText, setAnchorElText] = useState<null | HTMLElement>(null);
    const [tempTextColor, setTempTextColor] = useState(currentTextColor);
    const [anchorElBg, setAnchorElBg] = useState<null | HTMLElement>(null);
    const [tempBgColor, setTempBgColor] = useState(currentBgColor);

    // Text Color
    const handleTextColorClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElText(event.currentTarget);
        setTempTextColor(currentTextColor);
    };

    const handleTextColorClose = () => {
        setAnchorElText(null);
    };

    const handleTextColorChange = (color: any) => {
        setTempTextColor(color.hex);
    };

    const handleTextColorConfirm = () => {
        setCurrentTextColor(tempTextColor);
        setTextColor(tempTextColor);
        handleTextColorClose();
    };

    const handleTextColorCancel = () => {
        setTempTextColor(currentTextColor);
        handleTextColorClose();
    };

    const openTextColor = Boolean(anchorElText);

    // Background Color
    const handleBgColorClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElBg(event.currentTarget);
        setTempBgColor(currentBgColor);
    };

    const handleBgColorClose = () => {
        setAnchorElBg(null);
    };

    const handleBgColorChange = (color: any) => {
        setTempBgColor(color.hex);
    };

    const handleBgColorConfirm = () => {
        setCurrentBgColor(tempBgColor);
        setBgColor(tempBgColor);
        handleBgColorClose();
    };

    const handleBgColorCancel = () => {
        setTempBgColor(currentBgColor);
        handleBgColorClose();
    };

    const openBgColor = Boolean(anchorElBg);



    return (
        <div className="relative flex items-center mx-4 gap-2 flex-wrap">
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
                    <div className="text-white w-[100px] truncate">{currentFontFamily}</div>
                </button>

                {isFontMenuOpen && (
                    <div
                        ref={fontMenuRef}
                        className="absolute top-full left-0 mt-2 flex flex-col bg-gray-800 p-2 rounded shadow-lg z-10 max-h-[300px] w-[200px] overflow-auto custom-scrollbar"
                    >
                        {fonts.map((font) => (
                            <button
                                key={font}
                                className="rounded p-1 hover:bg-gray-700 transition duration-300 ease-in-out text-white"
                                style={{ fontFamily: font }}
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
                    value={currentFontSize}
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

            <button className="rounded p-1 hover:bg-gray-700 transition duration-300 ease-in-out" title="Bold (Ctrl+B)" disabled={isDisabled}
                onClick={() => toggleTextStyle('fontWeight', 'bold')}>
                <img src={boldImg} alt="Bold" className="w-5 h-5" />
            </button>
            <button className="rounded p-1 hover:bg-gray-700 transition duration-300 ease-in-out" title="Italic (Ctrl+I)" disabled={isDisabled}
                onClick={() => toggleTextStyle('fontStyle', 'italic')}>
                <img src={italicImg} alt="Italic" className="w-5 h-5" />
            </button>
            <button className="rounded p-1 hover:bg-gray-700 transition duration-300 ease-in-out" title="Strikethrough" disabled={isDisabled}
                onClick={() => toggleTextStyle('textDecoration', 'line-through')}>
                <img src={strikethroughImg} alt="Strikethrough" className="w-5 h-5" />
            </button>
            <div className="relative flex items-center">
                <button
                    className="rounded p-1 hover:bg-gray-700 transition duration-300 ease-in-out"
                    title="Text color"
                    disabled={isDisabled}
                    onClick={handleTextColorClick}
                >
                    <img src={textColorImg} alt="Text color" className="w-5 h-5" />
                </button>

                <Popover
                    open={openTextColor}
                    anchorEl={anchorElText}
                    onClose={handleTextColorCancel}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left',
                    }}
                >
                    <div className="pb-2">
                        <SketchPicker
                            color={tempBgColor}
                            onChangeComplete={handleTextColorChange}
                            disableAlpha
                            presetColors={sketchColors}
                        />

                        <div className="flex justify-around mt-2">
                            <Button variant="contained" onClick={handleTextColorCancel}
                                sx={{ color: '#510154', backgroundColor: '#FFFFFF' }}>
                                Cancel
                            </Button>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleTextColorConfirm}
                                style={{ marginRight: '10px' }}
                                sx={{ color: '#510154', backgroundColor: '#FFFFFF' }}
                            >
                                OK
                            </Button>
                        </div>
                    </div>
                </Popover>
            </div>

            <div className="bg-accent w-[1px] h-5 py-[1px]"></div>

            <div className="relative flex items-center">
                <button
                    className="rounded p-1 hover:bg-gray-700 transition duration-300 ease-in-out"
                    title="Fill color"
                    disabled={isDisabled}
                    onClick={handleBgColorClick}
                >
                    <img src={bgColorImg} alt="Fill color" className="w-5 h-5" />
                </button>

                <Popover
                    open={openBgColor}
                    anchorEl={anchorElBg}
                    onClose={handleBgColorCancel}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left',
                    }}
                >
                    <div className="pb-2">
                        <SketchPicker
                            color={tempBgColor}
                            onChangeComplete={handleBgColorChange}
                            disableAlpha
                            presetColors={sketchColors}
                        />


                        <div className="flex justify-around mt-2">
                            <Button variant="contained" onClick={handleBgColorCancel}
                                sx={{ color: '#510154', backgroundColor: '#FFFFFF' }}>
                                Cancel
                            </Button>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleBgColorConfirm}
                                style={{ marginRight: '10px' }}
                                sx={{ color: '#510154', backgroundColor: '#FFFFFF' }}
                            >
                                OK
                            </Button>
                        </div>
                    </div>
                </Popover>
            </div>

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
                        <button className="rounded p-1 hover:bg-gray-700 transition duration-300 ease-in-out" title="Align on Left" disabled={isDisabled}
                            onClick={() => { setHorizontalAlignment(HorizontalAlignment.LEFT) }}>
                            <img src={horizontalLeftAlignmentImg} alt="Align on Left" className="w-5 h-5" style={{ maxWidth: 'none' }} />
                        </button>
                        <button className="rounded p-1 hover:bg-gray-700 transition duration-300 ease-in-out" title="Align on Center" disabled={isDisabled}
                            onClick={() => { setHorizontalAlignment(HorizontalAlignment.CENTER) }}>
                            <img src={horizontalCenterAlignmentImg} alt="Align on Center" className="w-5 h-5" style={{ maxWidth: 'none' }} />
                        </button>
                        <button className="rounded p-1 hover:bg-gray-700 transition duration-300 ease-in-out" title="Align on Right" disabled={isDisabled}
                            onClick={() => { setHorizontalAlignment(HorizontalAlignment.RIGHT) }}>
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
                        <button className="rounded p-1 hover:bg-gray-700 transition duration-300 ease-in-out" title="Align on Top" disabled={isDisabled}
                            onClick={() => { setVerticalAlignment(VerticalAlignment.TOP) }}>
                            <img src={verticalTopAlignmentImg} alt="Align on Top" className="w-5 h-5" style={{ maxWidth: 'none' }} />
                        </button>
                        <button className="rounded p-1 hover:bg-gray-700 transition duration-300 ease-in-out" title="Align on Center" disabled={isDisabled}
                            onClick={() => { setVerticalAlignment(VerticalAlignment.CENTER) }}>
                            <img src={verticalCenterAlignmentImg} alt="Align on Center" className="w-5 h-5" style={{ maxWidth: 'none' }} />
                        </button>
                        <button className="rounded p-1 hover:bg-gray-700 transition duration-300 ease-in-out" title="Align on Bottom" disabled={isDisabled}
                            onClick={() => { setVerticalAlignment(VerticalAlignment.BOTTOM) }}>
                            <img src={verticalBottomAlignmentImg} alt="Align on Bottom" className="w-5 h-5" style={{ maxWidth: 'none' }} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default SpreadsheetUtilities;