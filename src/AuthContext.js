// Import necessary modules and hooks from 'react' and 'react-router-dom'
import React, { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Create an authentication context
const AuthContext = createContext();

// Define the Authentication Provider component
export const AuthProvider = ({ children }) => {
  // Declare state variables to track login status and navigation
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  // Check login status on component mount
  useEffect(() => {
    checkLoginStatus();
  }, []);

  // Set up an interval to refresh the user's token if logged in
  useEffect(() => {
    if (isLoggedIn) {
      const interval = setInterval(async () => {
        const success = await refreshToken();
        if (!success) {
          setIsLoggedIn(false);
          navigate("/login");
        }
      }, 540000); // Refresh every 9 minutes

      return () => clearInterval(interval); // Cleanup on unmount
    }
  }, [isLoggedIn, navigate]);

  // Function to refresh the user's token
  async function refreshToken() {
    try {
      const refreshToken = JSON.parse(localStorage.getItem("refreshToken"));

      if (!refreshToken) {
        return false;
      }

      const response = await fetch(
        "http://sefdb02.qut.edu.au:3000/user/refresh",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            refreshToken: refreshToken.token,
          }),
        }
      );

      if (!response.ok) {
        return false;
      }

      const data = await response.json();

      localStorage.setItem("bearerToken", JSON.stringify(data.bearerToken));
      localStorage.setItem("refreshToken", JSON.stringify(data.refreshToken));

      return true;
    } catch (error) {
      return false;
    }
  }

  // Function to check the user's login status
  function checkLoginStatus() {
    const bearerToken = JSON.parse(localStorage.getItem("bearerToken"));
    setIsLoggedIn(!!bearerToken);
  }

  // Function to log the user in
  function login() {
    checkLoginStatus();
  }

  // Function to log the user out
  async function logout() {
    const refreshToken = JSON.parse(localStorage.getItem("refreshToken"));

    // Make a POST request to /user/logout with the refresh token
    if (refreshToken) {
      try {
        await fetch("http://sefdb02.qut.edu.au:3000/user/logout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            refreshToken: refreshToken.token,
          }),
        });
      } catch (error) {
        console.error("Error logging out:", error);
      }
    }
    // Remove the tokens from local storage and update the login status
    localStorage.removeItem("bearerToken");
    localStorage.removeItem("refreshToken");
    setIsLoggedIn(false);
  }

  // Render the AuthContext.Provider component with the provided value and children
  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Export the AuthContext object
export default AuthContext;
