import React, { useContext } from "react";
import { Link } from "react-router-dom";
import AuthContext from "../AuthContext";

export default function Home() {
  const { isLoggedIn } = useContext(AuthContext);

  return (
    <div>
      <header className="App-header">
        <h1>Welcome to FilmFinder</h1>
        <p>Find your favourite Movies and TV Shows!</p>
        <Link to={isLoggedIn ? "/movies" : "/register"}>
          <button className="browse-movies-btn">
            {isLoggedIn ? "Browse Movies" : "Create an account"}
          </button>
        </Link>
      </header>
    </div>
  );
}
