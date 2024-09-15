const getRevealRange = (startIndex: number, hidden: boolean[]): { revealStart: number, revealEnd: number } => {
    let revealStart = startIndex;
    let revealEnd = startIndex;

    for (let i = startIndex - 1; i >= 0; i--) {
        if (hidden[i]) {
            revealStart = i;
        } else {
            break;
        }
    }

    for (let i = startIndex; i < hidden.length; i++) {
        if (hidden[i]) {
            revealEnd = i;
        } else {
            break;
        }
    }

    return { revealStart, revealEnd };
};


export const revealRows = (startIndex: number, hiddenRows: boolean[], setHiddenRows: Function, setSaving: Function, updateHiddenRowsMutation: Function, sheetId: number) => {
    const { revealStart, revealEnd } = getRevealRange(startIndex, hiddenRows);
    
    const newHidden = [...hiddenRows];

    for (let i = revealStart; i <= revealEnd; i++) {
        if (newHidden[i]) {
            newHidden[i] = false;
        }
    }

    setHiddenRows(newHidden);

    setSaving(true);
    updateHiddenRowsMutation({
        sheetId,
        rowIndex: revealStart,
        hidden: false,
    });
};
