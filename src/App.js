import "./App.css";

import { Routes, Route } from "react-router-dom";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

import Header from "./components/Header";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import Registration from "./pages/Registration";
import Login from "./pages/Login";
import Movies from "./pages/Movies";
import Movie from "./pages/Movie";
import Person from "./pages/Person";

export default function App() {
  return (
    // Uses the react-router-dom library to define the routes for the application
    <div className="App">
      <Header />
      <Routes>
        <Route path="*" element={<h1>Not Found 404</h1>} />
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Registration />} />
        <Route path="/login" element={<Login />} />
        <Route path="/movies" element={<Movies />} />
        <Route path="/movies/:id" element={<Movie />} />
        <Route path="/people/:id" element={<Person />} />
      </Routes>
      <Footer />
    </div>
  );
}
