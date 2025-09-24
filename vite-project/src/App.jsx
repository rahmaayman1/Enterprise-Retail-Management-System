import { useState } from 'react'

import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard"; 
import Inventory from "./pages/Inventory";
import Sales from "./pages/Sales";
import Purchase from "./pages/Purchase";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import PrivateRoute from "./components/privateRoute";

function App() {
  return (
    <Router>
      <Routes>
        {/* صفحة Login */}
        <Route path="/" element={<Login />} />

        {/* كل صفحات Dashboard */}
        <Route
          path="/dashboard/*"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        >
        {/*<Route path="/dashboard/*" element={<Dashboard />}>*/}
          <Route path="inventory" element={<Inventory />} />
          <Route path="sales" element={<Sales />} />
          <Route path="purchase" element={<Purchase />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
      
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
