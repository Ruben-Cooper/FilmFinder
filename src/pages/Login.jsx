import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../App.css";
import AuthContext from "../AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      const response = await fetch(
        "http://sefdb02.qut.edu.au:3000/user/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email,
            password: password,
            longExpiry: false,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      const data = await response.json();

      // Save the tokens
      localStorage.setItem("bearerToken", JSON.stringify(data.bearerToken));
      localStorage.setItem("refreshToken", JSON.stringify(data.refreshToken));

      // Call the login function from the context
      login();

      // Redirect
      navigate("/");
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  return (
    <body>
      <h1 className="register-title">Welcome Back, FilmFanatic!</h1>
      <div className="registration-container">
        <div className="registration-box">
          <h2>Login</h2>
          <form onSubmit={handleSubmit}>
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              name="password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            {errorMessage && <p className="error">{errorMessage}</p>}
            <button className="form-button" type="submit">
              Login
            </button>
          </form>
          <Link to="/register">
            <p className="black">
              Don't have an account? <br></br>Register now.
            </p>
          </Link>
        </div>
      </div>
    </body>
  );
}

export function getAuthHeaders() {
  const bearerToken = JSON.parse(localStorage.getItem("bearerToken"));
  if (!bearerToken) {
    return {};
  }

  return {
    Authorization: `${bearerToken.token_type} ${bearerToken.token}`,
  };
}
