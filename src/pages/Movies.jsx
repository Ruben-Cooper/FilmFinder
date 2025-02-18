import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function Movies() {
  const [gridApi, setGridApi] = useState(null);
  const [displayedRowCount, setDisplayedRowCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedYear, setSelectedYear] = useState("");

  const columns = [
    {
      headerName: "Title",
      field: "title",
      cellRenderer: "titleCellRenderer",
    },
    { headerName: "Year", field: "year" },
    { headerName: "imdbRating", field: "imdbRating" },
    {
      headerName: "rottenTomatoesRating",
      field: "rottenTomatoesRating",
    },
    {
      headerName: "metaCriticRating",
      field: "metacriticRating",
    },
    { headerName: "Classification", field: "classification" },
  ];

  // Makes individual movie titles link to their respective pages
  function TitleCellRenderer(props) {
    if (!props.data) {
      return null;
    }

    const { title, imdbID } = props.data;
    return <Link to={`/movies/${imdbID}`}>{title}</Link>;
  }

  const onGridReady = (params) => {
    setGridApi(params.api);
    params.api.setDatasource(datasource(searchQuery, selectedYear));
  };

  // Fetches data from the API and allows for unlimited scrolling
  const datasource = (searchQuery, selectedYear) => ({
    getRows: async (params) => {
      const pageNumber = params.startRow / 100 + 1;
      const response = await fetch(
        searchQuery || selectedYear
          ? `http://sefdb02.qut.edu.au:3000/movies/search?${
              searchQuery ? `title=${encodeURIComponent(searchQuery)}` : ""
            }${searchQuery && selectedYear ? "&" : ""}${
              selectedYear ? `year=${selectedYear}` : ""
            }`
          : `http://sefdb02.qut.edu.au:3000/movies/search?page=${pageNumber}`
      );
      const data = await response.json();

      if (data.data.length > 0) {
        params.successCallback(data.data, data.total);

        setDisplayedRowCount(params.startRow + data.data.length);
      } else {
        params.failCallback();
      }
    },
  });

  const handleSearch = () => {
    if (gridApi) {
      gridApi.setDatasource(datasource(searchQuery, selectedYear));
    }
  };

  const generateYearArray = (startYear, endYear) => {
    return Array.from(
      { length: endYear - startYear + 1 },
      (_, i) => startYear + i
    );
  };

  const handleYearSelect = (event) => {
    setSelectedYear(event.target.value);
  };

  return (
    <div>
      <h1>Movie List</h1>
      <input
        type="text"
        placeholder="Search movies..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <select value={selectedYear} onChange={handleYearSelect}>
        <option value="">Any Year</option>
        {generateYearArray(1990, 2023).map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </select>
      <button onClick={handleSearch}>Search</button>
      <div
        className="ag-theme-alpine-dark movies-table"
        style={{ height: 650, width: 1215 }}
      >
        <AgGridReact
          columnDefs={columns}
          onGridReady={onGridReady}
          rowModelType="infinite"
          paginationPageSize={100}
          cacheBlockSize={100}
          maxBlocksInCache={3}
          cacheOverflowSize={2}
          frameworkComponents={{
            titleCellRenderer: TitleCellRenderer,
          }}
        />
      </div>
      <p>Displayed Results: {displayedRowCount} of 12184</p>
    </div>
  );
}
