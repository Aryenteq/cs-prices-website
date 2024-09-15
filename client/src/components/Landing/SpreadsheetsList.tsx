import React, { useEffect, useState } from "react";
import ListHeader from "./ListHeader";
import SpreadsheetItem from "./SpreadsheetItem";
import type { Spreadsheet, Filters } from "../../types/SpreadsheetListTypes";
import { useSpreadsheets } from "../query/Spreadsheet/SpreadsheetsFetch";

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
        orderType: 'desc'
    });

    const { data: spreadsheets, isLoading, error } = useSpreadsheets(filters);

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

        document.addEventListener("click", handleClickOutside);

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

    const renderGroups = () => {
        const groupOrder = (filters.orderBy === 'LAST_OPENED' || filters.orderBy === 'CREATED') && filters.orderType === 'asc'
            ? ['earlier', 'previous30Days', 'previous7Days', 'yesterday', 'today']
            : ['today', 'yesterday', 'previous7Days', 'previous30Days', 'earlier'];

        return groupOrder.map((group) => {
            if (groupedSpreadsheets[group].length > 0) {
                const groupLabel = group === 'today' ? 'Last 24h' :
                    group === 'yesterday' ? 'Yesterday' :
                        group === 'previous7Days' ? 'Previous 7 days' :
                            group === 'previous30Days' ? 'Previous 30 days' :
                                'Earlier';

                return (
                    <div key={group}>
                        <h3>{groupLabel}</h3>
                        {groupedSpreadsheets[group].map(spreadsheet => (
                            <SpreadsheetItem
                                key={spreadsheet.id}
                                spreadsheet={spreadsheet}
                                openMenuId={openMenuId}
                                handleMenuToggle={handleMenuToggle}
                            />
                        ))}
                    </div>
                );
            }
            return null;
        });
    };

    return (
        <div className="my-10 px-2 breakpoint-1000:px-20">
            <ListHeader onFiltersChange={handleFiltersChange} />
            <div className="mt-5">
                {isEmpty ? (
                    <p className="w-full text-center mt-20">No spreadsheets found, try creating one now!</p>
                ) : (
                    renderGroups()
                )}
            </div>
        </div>
    );
}

export default SpreadsheetsList;