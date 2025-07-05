import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

type DoughnutChartProps = {
  data: any[];
  title: string;
  stackByKey: string;
};

const DoughnutChart: React.FC<DoughnutChartProps> = ({
  data,
  title,
  stackByKey,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  const width = 280;
  const height = 280;
  const outerRadius = Math.min(width, height) / 2;
  const innerRadius = outerRadius * 0.65;
  const margin = { top: 20, right: 20, bottom: 20, left: 20 };

  const formatKeyForDisplay = (key: string) =>
    key
      ?.replace(/_/g, " ")
      .replace(/([A-Z])/g, " $1")
      .trim()
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    if (!data || data.length === 0 || !stackByKey) {
      svg
        .append("text")
        .attr("x", width / 2)
        .attr("y", height / 2)
        .attr("text-anchor", "middle")
        .attr("font-size", "14px")
        .attr("fill", "#777")
        .text("No Data Available");
      return;
    }

    const totals = d3.rollups(
      data,
      (v) => d3.sum(v, (d) => d.acv),
      (d) => d[stackByKey]
    );

    const totalSum = d3.sum(totals, ([, v]) => v);

    console.log("Doughnut Chart Data:", totals);

    if (totalSum === 0) {
      svg
        .append("text")
        .attr("x", width / 2)
        .attr("y", height / 2)
        .attr("text-anchor", "middle")
        .attr("font-size", "14px")
        .attr("fill", "#777")
        .text("Total ACV is Zero");
      return;
    }

    const categories = totals.map(([key]) => key);
    const color = d3.scaleOrdinal(d3.schemeCategory10).domain(categories);

    const pie = d3
      .pie()
      .value(([, value]) => value)
      .sort(null);
    const arc = d3.arc().innerRadius(innerRadius).outerRadius(outerRadius);

    const g = svg
      .append("g")
      .attr("transform", `translate(${width / 2}, ${height / 2})`);

    const arcs = g
      .selectAll(".arc")
      .data(pie(totals))
      .join("g")
      .attr("class", "arc");

    arcs
      .append("path")
      .attr("d", arc as any)
      .attr("fill", (d) => color(d.data[0]))
      .attr("stroke", "white")
      .style("stroke-width", "1px")
      .append("title")
      .text((d) => {
        const percentage = (d.data[1] / totalSum) * 100;
        return `${d.data[0]}: ${d3.format("$,.2f")(
          d.data[1]
        )} (${percentage.toFixed(1)}%)`;
      });

    g.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "-0.5em")
      .style("font-size", "12px")
      .style("font-weight", "bold")
      .text("Total ACV");

    g.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "1em")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .text(d3.format("$,.0f")(totalSum));

    // Legend
    const legend = svg
      .append("g")
      .attr("transform", `translate(${width + 20}, ${margin.top})`);

    legend
      .append("text")
      .attr("x", 0)
      .attr("y", -10)
      .style("font-size", "14px")
      .style("font-weight", "bold")
      .attr("fill", "#333")
      .text(formatKeyForDisplay(stackByKey));

    legend
      .selectAll(".legend-item")
      .data(categories)
      .join("g")
      .attr("transform", (_, i) => `translate(0, ${i * 22})`)
      .each(function (d) {
        const group = d3.select(this);
        group
          .append("rect")
          .attr("width", 16)
          .attr("height", 16)
          .attr("fill", color(d));

        group
          .append("text")
          .attr("x", 22)
          .attr("y", 12)
          .style("font-size", "12px")
          .style("fill", "#333")
          .text(d);
      });
  }, [data, stackByKey, title]);

  return (
    <div
      style={{
        display: "flex",
        backgroundColor: "#fff",
        borderRadius: "12px",
        padding: "16px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        fontFamily: "Inter, sans-serif",
        width: 480,
        minHeight: 340,
        alignItems: "center",
      }}
    >
      <div>
        <h3
          style={{
            textAlign: "center",
            color: "#222",
            fontWeight: 600,
            marginBottom: 10,
          }}
        >
          {title}
        </h3>
        <svg ref={svgRef} width={width + 140} height={height} />
      </div>
    </div>
  );
};

export default DoughnutChart;
