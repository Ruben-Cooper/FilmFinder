import React from "react";
import { Bar } from "react-chartjs-2";
import { LinearScale } from "chart.js";
import Chart from "chart.js/auto";
Chart.register(LinearScale);

export const BarChart = (props) => {
  const { personData } = props;

  const imdbRatings = personData.roles.map((role) => role.imdbRating);
  const ratingBuckets = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

  imdbRatings.forEach((rating) => {
    const index = Math.floor(rating);
    ratingBuckets[index]++;
  });

  const data = {
    labels: [
      "0-1",
      "1-2",
      "2-3",
      "3-4",
      "4-5",
      "5-6",
      "6-7",
      "7-8",
      "8-9",
      "9-10",
    ],
    datasets: [
      {
        label: "IMDB Ratings",
        data: ratingBuckets,
        backgroundColor: [
          "rgba(75, 192, 192, 0.2)",
          "rgba(255, 99, 132, 0.2)",
          "rgba(255, 206, 86, 0.2)",
          "rgba(153, 102, 255, 0.2)",
          "rgba(54, 162, 235, 0.2)",
          "rgba(255, 159, 64, 0.2)",
          "rgba(255, 99, 132, 0.2)",
          "rgba(75, 192, 192, 0.2)",
          "rgba(255, 206, 86, 0.2)",
          "rgba(153, 102, 255, 0.2)",
        ],
        borderColor: [
          "rgba(75, 192, 192, 1)",
          "rgba(255, 99, 132, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(153, 102, 255, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 159, 64, 1)",
          "rgba(255, 99, 132, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(153, 102, 255, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    scales: {
      y: {
        title: {
          display: true,
          text: "Number of Movies",
          color: "turquoise",
        },
        beginAtZero: true,
        ticks: {
          color: "white",
        },
      },
      x: {
        title: {
          display: true,
          text: "IMDB Rating Range",
          color: "turquoise",
        },
        ticks: {
          color: "white",
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
    },
  };

  return <Bar data={data} options={options} />;
};

export default BarChart;
