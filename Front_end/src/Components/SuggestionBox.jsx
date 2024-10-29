// SuggestionBox.jsx
import React from "react";
import PropTypes from "prop-types"; // Import PropTypes

const SuggestionBox = ({ suggestion }) => {
  return (
    <div
      style={{
        marginTop: "20px",
        padding: "15px",
        backgroundColor: "#333", // Dark background color
        color: "#fff",           // White text color
        width: "80%",            // Adjustable width for responsiveness
        maxWidth: "640px",       // Limit the max width
        margin: "20px auto",     // Center align and add margin on top and bottom
        borderRadius: "8px",     // Rounded corners
        border: "2px solid #fff", // White border for visibility
        textAlign: "center",     // Center the text
      }}
    >
      <h3 style={{ margin: "0 0 10px", fontSize: "22px" }}>Suggestions</h3>
      <p style={{ margin: 0, fontSize: "18px" }}>{suggestion || "No suggestion yet"}</p>
    </div>
  );
};

// Add prop types validation
SuggestionBox.propTypes = {
  suggestion: PropTypes.string.isRequired, // Validate suggestion as a required string
};

// Add display name
SuggestionBox.displayName = "SuggestionBox";

export default SuggestionBox;
