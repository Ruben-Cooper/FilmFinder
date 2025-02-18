import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import "../App.css";

const Movie = () => {
  const [movieData, setMovieData] = useState(null);
  const { id: movieId } = useParams();

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(
        `http://sefdb02.qut.edu.au:3000/movies/data/${movieId}`
      );
      const data = await response.json();
      setMovieData(data);
    };

    fetchData();
  }, [movieId]);

  if (!movieData) {
    return <div>Loading...</div>;
  }

  const NameCellRenderer = (props) => {
    const { value, data } = props;
    const actorId = data.id;

    return <Link to={`/people/${actorId}`}>{value}</Link>;
  };

  const principalColumns = [
    { headerName: "Role", field: "category" },
    {
      headerName: "Name",
      field: "name",
      cellRenderer: "nameCellRenderer",
    },
    { headerName: "Characters", field: "characters" },
  ];

  const formatRating = (source, value) => {
    switch (source) {
      case "Internet Movie Database":
        return `${value}/10`;
      case "Rotten Tomatoes":
        return `${value}%`;
      case "Metacritic":
        return `${value}/100`;
      default:
        return value;
    }
  };

  return (
    <div>
      <h1>
        {movieData.title} ({movieData.year})
      </h1>
      <div className="image-and-ratings-wrapper">
        <div className="ratings">
          {movieData.ratings.map((rating, index) => (
            <span key={index} className="rating-item">
              {rating.source}: {formatRating(rating.source, rating.value)}
            </span>
          ))}
        </div>
        <img src={movieData.poster} alt={movieData.title} />
      </div>
      <div>
        <div className="bluebox">
          <div className="content">Runtime: {movieData.runtime} minutes</div>
        </div>
        <div className="redbox">
          <div className="content">
            Box Office: ${movieData.boxoffice.toLocaleString()}
          </div>
        </div>
      </div>
      <p>Genres: {movieData.genres.join(", ")}</p>
      <p>Country: {movieData.country}</p>
      <br />
      <p>Plot:</p>
      <div className="plot-text">{movieData.plot}</div>
      <br />
      <p>Film Crew:</p>
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
          style={{ height: "400px", width: "611px" }}
        >
          <AgGridReact
            columnDefs={principalColumns}
            rowData={movieData.principals}
            frameworkComponents={{
              nameCellRenderer: NameCellRenderer,
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Movie;
