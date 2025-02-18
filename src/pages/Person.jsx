import HeroImg from "../img/HeroL.jpg";
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { getAuthHeaders } from "./Login";
import { BarChart } from "../components/BarChart.jsx";

const MovieNameCellRenderer = ({ movieName, movieId }) => (
  <Link to={`/movies/${movieId}`}>{movieName}</Link>
);

const Person = () => {
  const [personData, setPersonData] = useState(null);
  const { id: personId } = useParams();

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(
        `http://sefdb02.qut.edu.au:3000/people/${personId}`,
        {
          headers: {
            ...getAuthHeaders(),
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setPersonData(data);
      } else {
        setPersonData({ error: true, message: "Please Login" });
      }
    };

    fetchData();
  }, [personId]);

  if (!personData) {
    return <div>Loading...</div>;
  }

  if (personData.error) {
    return (
      <div>
        <h1>
          <Link to="/login">{personData.message}</Link>
        </h1>
        <img src={HeroImg} alt="Hero" width="500" height="500" />
      </div>
    );
  }

  const rolesColumns = [
    {
      headerName: "Movie Name",
      field: "movieName",
      cellRendererFramework: MovieNameCellRenderer,
      cellRendererParams: (params) => ({
        movieName: params.data.movieName,
        movieId: params.data.movieId,
      }),
    },
    { headerName: "Role", field: "category" },
    {
      headerName: "Character(s)",
      valueGetter: (params) =>
        params.data.characters.length > 0
          ? params.data.characters.join(", ")
          : "",
    },
    { headerName: "IMDB Rating", field: "imdbRating", sortable: true },
  ];

  return (
    <div>
      <h1>{personData.name}</h1>
      <p>
        {personData.birthYear} -{" "}
        {personData.deathYear ? personData.deathYear : ""}
      </p>
      <div
        className="ag-grid-wrapper"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          className="ag-theme-alpine-dark"
          style={{ height: "550px", width: "811px" }}
        >
          <AgGridReact columnDefs={rolesColumns} rowData={personData.roles} />
        </div>
      </div>

      <p>IMDB Ratings Distribution:</p>
      <div className="chart-container">
        <BarChart personData={personData} />
      </div>
    </div>
  );
};

export default Person;
