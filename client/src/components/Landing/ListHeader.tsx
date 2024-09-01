// ListHeader.tsx
import React, { useEffect, useState } from "react";
import Selector from "../MUI/Selector";
import DialogSelect from "../MUI/Dialog";
import type { Filters } from "./SpreadsheetsList";

interface ListHeaderProps {
    onFiltersChange: (filters: Partial<Filters>) => void;
}

const ListHeader: React.FC<ListHeaderProps> = ({ onFiltersChange }) => {
    const [owner, setOwner] = useState<Filters['owner']>('ALL');
    const [type, setType] = useState<Filters['type']>('ALL');
    const [orderBy, setOrderBy] = useState<string | number>('LAST_OPENED');
    const [orderType, setOrderType] = useState<string | number>('desc');

    const orderAndSortOptions = [
        {
            label: "Sort by",
            value: orderBy,
            selectOptions: [
                { value: 'CREATED', label: 'Created' },
                { value: 'LAST_OPENED', label: 'Last opened' },
                { value: 'NAME', label: 'Name' },
            ],
            onChange: setOrderBy,
        },
        {
            label: "Order",
            value: orderType,
            selectOptions: [
                { value: 'asc', label: 'Asc' },
                { value: 'desc', label: 'Desc' },
            ],
            onChange: setOrderType,
        }
    ];

    useEffect(() => {
        onFiltersChange({
            owner,
            type,
            orderBy: orderBy as Filters['orderBy'],
            orderType: orderType as Filters['orderType'],
        });
    }, [owner, type, orderBy, orderType]);

    return (
        <header className="flex items-center">
            <p className="w-9/20 truncate font-bold text-1xl text-primary-light">Name</p>
            <p className="w-1/6 truncate font-bold text-1xl text-primary-light">Last opened</p>
            <div className="w-1/6 truncate">
                <Selector
                    theme="dark"
                    label="Owner"
                    name="owner"
                    options={[
                        { value: 'ME', label: 'Me' },
                        { value: 'OTHER', label: 'Not me' },
                        { value: 'ALL', label: 'Anyone' },
                    ]}
                    onChange={(value) => setOwner(value as Filters['owner'])}
                />
            </div>
            <div className="w-1/6 truncate">
                <Selector
                    theme="dark"
                    label="Type"
                    name="type"
                    options={[
                        { value: 'NORMAL', label: 'Normal' },
                        { value: 'CS', label: 'CS' },
                        { value: 'ALL', label: 'All' },
                    ]}
                    onChange={(value) => setType(value as Filters['type'])}
                />
            </div>
            <div className="w-1/20">
                <DialogSelect options={orderAndSortOptions} />
            </div>
        </header>
    );
};

export default ListHeader;