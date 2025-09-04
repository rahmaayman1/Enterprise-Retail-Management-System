import React from "react";
import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav style={{ 
      padding: "15px", 
      background: "#007bff", 
      color: "white", 
      display: "flex", 
      justifyContent: "space-between",
      alignItems: "center"
    }}>
      <h2>Retail Management</h2>
      <div>
        <Link to="/dashboard" style={linkStyle}>Dashboard</Link>
        <Link to="/products" style={linkStyle}>Products</Link>
        <Link to="/" style={linkStyle}>Logout</Link>
      </div>
    </nav>
  );
}

const linkStyle = {
  color: "white",
  textDecoration: "none",
  marginLeft: "20px",
  fontSize: "16px"
};

export default Navbar;
