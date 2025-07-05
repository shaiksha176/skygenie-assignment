// Dashboard.js
import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import { Card, CardContent, Typography, Grid } from "@mui/material";

// Mock data (you can load using d3.csv)
const mockData = [
  {
    count: 5,
    acv: 238547.19,
    closed_fiscal_quarter: "2023-Q3",
    Team: "Asia Pac",
  },
  {
    count: 3,
    acv: 105789.5,
    closed_fiscal_quarter: "2023-Q3",
    Team: "Europe",
  },
  {
    count: 7,
    acv: 310000,
    closed_fiscal_quarter: "2023-Q4",
    Team: "US",
  },
];

const Dashboard = () => {
  return (
    <Grid container spacing={2}>
      {mockData.map((row, index) => (
        <Grid size={{ md: 4 }} key={index}>
          <DataCard row={row} index={index} />
        </Grid>
      ))}
    </Grid>
  );
};

const DataCard = ({ row, index }) => {
  const barRef = useRef(null);
  const doughnutRef = useRef(null);

  useEffect(() => {
    drawBarChart(barRef.current, row);
    drawDoughnutChart(doughnutRef.current, row);
  }, [row]);

  return (
    <Card>
      <CardContent>
        <Typography variant="h6">{row.Team}</Typography>
        <Typography variant="body2">
          Quarter: {row.closed_fiscal_quarter}
        </Typography>
        <Typography variant="body2">Deals: {row.count}</Typography>
        <Typography variant="body2">
          ACV: ${row.acv.toLocaleString()}
        </Typography>

        <div ref={barRef}></div>
        <div ref={doughnutRef}></div>
      </CardContent>
    </Card>
  );
};

const drawBarChart = (container, row) => {
  container.innerHTML = ""; // Clear old chart
  const width = 200,
    height = 100;

  const svg = d3
    .select(container)
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  const data = [
    { label: "ACV", value: row.acv },
    { label: "Count", value: row.count },
  ];

  const x = d3
    .scaleBand()
    .domain(data.map((d) => d.label))
    .range([0, width])
    .padding(0.3);

  const y = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d.value)])
    .range([height, 0]);

  svg
    .selectAll("rect")
    .data(data)
    .enter()
    .append("rect")
    .attr("x", (d) => x(d.label))
    .attr("y", (d) => y(d.value))
    .attr("width", x.bandwidth())
    .attr("height", (d) => height - y(d.value))
    .attr("fill", "#1976d2");
};

const drawDoughnutChart = (container, row) => {
  container.innerHTML = ""; // Clear old chart
  const width = 200,
    height = 200,
    radius = Math.min(width, height) / 2;

  const svg = d3
    .select(container)
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", `translate(${width / 2}, ${height / 2})`);

  // Dummy data: show acv vs remaining to total
  const total = 1000000; // example max or total
  const data = [
    { label: "ACV", value: row.acv },
    { label: "Rest", value: total - row.acv },
  ];

  const color = d3.scaleOrdinal(["#4caf50", "#ccc"]);

  const arc = d3.arc().innerRadius(50).outerRadius(radius);

  const pie = d3.pie().value((d) => d.value);

  svg
    .selectAll("path")
    .data(pie(data))
    .enter()
    .append("path")
    .attr("d", arc)
    .attr("fill", (d) => color(d.data.label));
};

export default Dashboard;
