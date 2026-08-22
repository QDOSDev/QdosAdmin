import React, { useState } from 'react';

interface SearchBarProps {
    onSearch: (query: string) => void;
}

const Search: React.FC<SearchBarProps> = ({ onSearch }) => {
    const [query, setQuery] = useState('');

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(e.target.value);
    };

    const handleSearch = () => {
        if (query.trim()) {
            onSearch(query); // Call the passed search function
        }
    };

    return (
        <div className="search-bar flex items-center space-x-2">
            <input
                type="text"
                className="p-2 border border-gray-300 rounded-md"
                placeholder="Search..."
                value={query}
                onChange={handleSearchChange}
            />
            <button onClick={handleSearch} className="bg-blue-500 text-white p-2 rounded-md">
                Search
            </button>
        </div>
    );
};

export default Search;

