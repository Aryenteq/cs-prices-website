import React, { useEffect, useState } from "react";
import { useQuery } from "react-query";
import ListHeader from "./ListHeader";
import SpreadsheetItem from "./SpreadsheetItem";

import { getAuthHeader } from "../../utils/authHeader";

// Define the types for spreadsheet items and filters
export interface Spreadsheet {
    id: number;
    name: string;
    type: string;
    created: string;
    lastOpened: string;
    updatedAt: string;
    ownerName: string;
    permission: 'EDIT' | 'VIEW';
}

export interface Filters {
    owner: 'ALL' | 'ME' | 'OTHER';
    type: 'ALL' | 'NORMAL' | 'CS';
    orderBy: 'LAST_OPENED' | 'TITLE' | 'CREATED';
    orderType: 'asc' | 'desc';
}

const fetchSpreadsheets = async (filters: Filters): Promise<Spreadsheet[]> => {
    const headers = getAuthHeader();
    const query = new URLSearchParams(filters as any).toString();

    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/spreadsheet?${query}`, {
        method: 'GET',
        headers: headers,
    });

    if (!response.ok) {
        throw new Error('Failed to fetch spreadsheets');
    }

    return response.json();
};

// group spreadsheets by date
function groupSpreadsheetsByDate(spreadsheets: Spreadsheet[]): Record<string, Spreadsheet[]> {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const groups: Record<string, Spreadsheet[]> = {
        today: [],
        yesterday: [],
        previous7Days: [],
        previous30Days: [],
        earlier: [],
    };

    spreadsheets.forEach(spreadsheet => {
        const lastOpenedDate = new Date(spreadsheet.lastOpened);
        const timeDifference = today.getTime() - lastOpenedDate.getTime();
        const daysDifference = timeDifference / (1000 * 3600 * 24);

        if (daysDifference < 1) {
            groups.today.push(spreadsheet);
        } else if (daysDifference < 2) {
            groups.yesterday.push(spreadsheet);
        } else if (daysDifference < 7) {
            groups.previous7Days.push(spreadsheet);
        } else if (daysDifference < 30) {
            groups.previous30Days.push(spreadsheet);
        } else {
            groups.earlier.push(spreadsheet);
        }
    });

    return groups;
}

const SpreadsheetsList: React.FC = () => {
    const [filters, setFilters] = useState<Filters>({
        owner: 'ALL',
        type: 'ALL',
        orderBy: 'LAST_OPENED',
        orderType: 'asc'
    });

    const { data: spreadsheets, isLoading, error } = useQuery<Spreadsheet[], Error>(
        ['spreadsheets', filters],
        () => fetchSpreadsheets(filters),
        { keepPreviousData: true }
    );

    const handleFiltersChange = (newFilters: Partial<Filters>) => {
        setFilters((prevFilters) => ({
            ...prevFilters,
            ...newFilters,
        }));
    };

    const [openMenuId, setOpenMenuId] = useState<number | null>(null);

    useEffect(() => {
        const handleClickOutside = () => {
            if (openMenuId !== null) {
                setOpenMenuId(null);
            }
        };

        // Attach the click event listener to the document
        document.addEventListener("click", handleClickOutside);

        // Cleanup the event listener on component unmount
        return () => {
            document.removeEventListener("click", handleClickOutside);
        };
    }, [openMenuId]);

    const handleMenuToggle = (id: number) => {
        setOpenMenuId((prevId) => (prevId === id ? null : id));
    };

    if (isLoading) return <p>Loading...</p>;
    if (error) return <p>Error fetching spreadsheets</p>;

    const groupedSpreadsheets = groupSpreadsheetsByDate(spreadsheets || []);

    const isEmpty = !groupedSpreadsheets.today.length &&
        !groupedSpreadsheets.yesterday.length &&
        !groupedSpreadsheets.previous7Days.length &&
        !groupedSpreadsheets.previous30Days.length &&
        !groupedSpreadsheets.earlier.length;

    return (
        <div className="my-10 px-2 breakpoint-1000:px-20">
            <ListHeader onFiltersChange={handleFiltersChange} />
            <div className="mt-5">
                {isEmpty ? (
                    <p className="w-full text-center mt-20">No spreadsheets found, try creating one now!</p>
                ) : (
                    <>
                        {groupedSpreadsheets.today.length > 0 && (
                            <>
                                <h3>Last 24h</h3>
                                {groupedSpreadsheets.today.map(spreadsheet => (
                                    <SpreadsheetItem key={spreadsheet.id} spreadsheet={spreadsheet} openMenuId={openMenuId}
                                        handleMenuToggle={handleMenuToggle} />
                                ))}
                            </>
                        )}
                        {groupedSpreadsheets.yesterday.length > 0 && (
                            <>
                                <h3>Yesterday</h3>
                                {groupedSpreadsheets.yesterday.map(spreadsheet => (
                                    <SpreadsheetItem key={spreadsheet.id} spreadsheet={spreadsheet} openMenuId={openMenuId}
                                        handleMenuToggle={handleMenuToggle} />
                                ))}
                            </>
                        )}
                        {groupedSpreadsheets.previous7Days.length > 0 && (
                            <>
                                <h3>Previous 7 days</h3>
                                {groupedSpreadsheets.previous7Days.map(spreadsheet => (
                                    <SpreadsheetItem key={spreadsheet.id} spreadsheet={spreadsheet} openMenuId={openMenuId}
                                        handleMenuToggle={handleMenuToggle} />
                                ))}
                            </>
                        )}
                        {groupedSpreadsheets.previous30Days.length > 0 && (
                            <>
                                <h3>Previous 30 days</h3>
                                {groupedSpreadsheets.previous30Days.map(spreadsheet => (
                                    <SpreadsheetItem key={spreadsheet.id} spreadsheet={spreadsheet} openMenuId={openMenuId}
                                        handleMenuToggle={handleMenuToggle} />
                                ))}
                            </>
                        )}
                        {groupedSpreadsheets.earlier.length > 0 && (
                            <>
                                <h3>Earlier</h3>
                                {groupedSpreadsheets.earlier.map(spreadsheet => (
                                    <SpreadsheetItem key={spreadsheet.id} spreadsheet={spreadsheet} openMenuId={openMenuId}
                                        handleMenuToggle={handleMenuToggle} />
                                ))}
                            </>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default SpreadsheetsList;