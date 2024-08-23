import React from "react";
import search from "../../media/svgs/search.svg";


const SpreadsheetSearch: React.FC = () => {
    return (
        <div className="w-full absolute flex justify-center">
            <div className="relative flex justify-center w-1/2 md:w-1/3">
                <img src={search} alt="Search" className="absolute top-2 left-6" />
                <input
                    type="text"
                    placeholder="Search..."
                    className="w-full py-2 border border-gray-300 rounded-full px-16"
                />
            </div>
        </div>
    );
};

export default SpreadsheetSearch;
