import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Dataset from "./pages/Dataset";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dataset/:id" element={<Dataset />} />
      </Routes>
    </Router>
  );
};

export default App;
