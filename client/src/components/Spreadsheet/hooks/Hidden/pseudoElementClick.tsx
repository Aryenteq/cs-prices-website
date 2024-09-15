import { useCallback } from 'react';

export const usePseudoElementClick = (hiddenCols: boolean[], hiddenRows: boolean[], handleRevealCols: Function, handleRevealRows: Function) => {
    const handlePseudoElementClick = useCallback((e: React.MouseEvent, index: number, type: 'col' | 'row') => {
        const th = e.currentTarget;
        const rect = th.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.bottom;
        const threshold = 15;

        if (type === 'col') {
            if (clickX < threshold && hiddenCols[index - 1]) {
                handleRevealCols(index - 1);
            } else if (clickX > rect.width - threshold && hiddenCols[index + 1]) {
                handleRevealCols(index + 1);
            }
        } else {
            if (clickY < threshold && hiddenRows[index - 1]) {
                handleRevealRows(index - 1);
            } else if (clickY > rect.width - threshold && hiddenRows[index + 1]) {
                handleRevealRows(index + 1);
            }
        }
    }, [hiddenCols, hiddenRows, handleRevealCols, handleRevealRows]);

    return {
        handlePseudoElementClick,
    };
};