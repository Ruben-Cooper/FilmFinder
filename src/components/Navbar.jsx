import React, { useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import AuthContext from "../AuthContext";

export default function Navbar() {
  const { isLoggedIn, logout } = useContext(AuthContext);

  return (
    <nav className="navbar">
      <Link to="/">
        <div className="navbar-brand">FilmFinder</div>
      </Link>
      <ul>
        <li className="navbar-left">
          <Link to="/">Home</Link>
        </li>
        <li className="navbar-left">
          <Link to="/movies">Movies</Link>
        </li>
      </ul>
      <ul>
        <li className="navbar-right dropdown">
          <a>
            {isLoggedIn ? "Logged In!" : "Account"} ↓
            <i className="fa fa-caret-down"></i>
          </a>
          <div className="dropdown-content">
            {isLoggedIn ? (
              <Link
                to="/"
                onClick={() => {
                  logout();
                }}
              >
                Logout
              </Link>
            ) : (
              <>
                <Link to="/login">Login</Link>
                <Link to="/register">Register</Link>
              </>
            )}
          </div>
        </li>
      </ul>
    </nav>
  );
}
