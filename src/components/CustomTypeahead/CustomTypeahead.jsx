import React, { useState } from "react";
import "./CustomTypeahead.css";

const CustomTypeahead = ({ options, onSelect, placeholder, onClear }) => {
  const [query, setQuery] = useState("");
  const [filteredOptions, setFilteredOptions] = useState([]);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    if (!value.trim()) {
      setFilteredOptions([]);
      setIsDropdownVisible(false);
      if (onClear) onClear(); // Call onClear when input is cleared
      return;
    }

    const matches = options.filter((option) =>
      option.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredOptions(matches);
    setIsDropdownVisible(true);
  };

  const handleOptionClick = (option) => {
    setQuery(option);
    setFilteredOptions([]); // Hide dropdown
    setIsDropdownVisible(false);
    if (onSelect) onSelect(option); // Notify parent
  };

  return (
    <div className="custom-typeahead">
      <input
        type="text"
        className="typeahead-input"
        value={query}
        onChange={handleInputChange}
        placeholder={placeholder || "Search..."}
        onFocus={() => filteredOptions.length && setIsDropdownVisible(true)}
        onBlur={(e) => {
          if (
            !e.relatedTarget ||
            !e.relatedTarget.className.includes("typeahead-option")
          ) {
            setIsDropdownVisible(false);
          }
        }}
      />
      {isDropdownVisible && (
        <ul className="typeahead-dropdown">
          {filteredOptions.map((option, index) => (
            <li
              key={index}
              tabIndex="0"
              className="typeahead-option"
              onMouseDown={() => handleOptionClick(option)} // Prevent premature blur
            >
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CustomTypeahead;
