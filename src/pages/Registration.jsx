import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../App.css";

export default function Registration() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const navigate = useNavigate();

  // Redirect to login page after registration is complete
  useEffect(() => {
    if (registrationComplete) {
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    }
  }, [registrationComplete, navigate]);

  // Handle registration form submission
  async function handleSubmit(event) {
    event.preventDefault();

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    const email = event.target.email.value;

    try {
      const response = await fetch(
        "http://sefdb02.qut.edu.au:3000/user/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const data = await response.json();

      console.log(data.message);

      setRegistrationComplete(true);
    } catch (error) {
      console.error("Error during registration:", error.message);
      setErrorMessage("Registration failed. Please try again.");
    }
  }

  function handleConfirmPasswordChange(event) {
    setConfirmPassword(event.target.value);
    if (event.target.value !== password) {
      setErrorMessage("Passwords do not match.");
    } else {
      setErrorMessage("");
    }
  }

  return (
    <body>
      <h1 className="register-title">Become a FilmFanatic Today!</h1>
      <div className="registration-container">
        <div className="registration-box">
          <h2>Register</h2>
          <form onSubmit={handleSubmit}>
            <label htmlFor="email">Email:</label>
            <input type="email" id="email" name="email" required />
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              name="password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <label htmlFor="confirmPassword">Confirm Password:</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              required
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
            />
            {errorMessage && <p className="error">{errorMessage}</p>}
            {registrationComplete && (
              <p className="success">
                Registration complete! Redirecting to login...
              </p>
            )}
            <button className="form-button" type="submit">
              Register
            </button>
          </form>
          <Link to="/login">
            <p className="black">
              Already have an account?<br></br>Login now.
            </p>
          </Link>
        </div>
      </div>
    </body>
  );
}
