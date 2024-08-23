export const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const isToday = date.toDateString() === today.toDateString();
    const isYesterday = date.toDateString() === yesterday.toDateString();
    const isCurrentYear = date.getFullYear() === today.getFullYear();

    const formatTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    const formatDate = date.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
    });

    if (isToday) {
        return formatTime; // e.g., "17:04"
    } else if (isYesterday) {
        return "Yesterday";
    } else {
        return `${formatDate}${isCurrentYear ? '' : ` ${date.getFullYear()}`}`; // e.g., "17 Aug" or "17 Aug 2022"
    }
};
