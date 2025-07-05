import React, { useRef, useEffect } from "react";
import * as d3 from "d3";

type Props = {
  data: any[];
  title: string;
  stackByKey: string;
};

const StackedBarChart: React.FC<Props> = ({ data, title, stackByKey }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const margin = { top: 20, right: 20, bottom: 100, left: 60 };
  const height = 500;

  const formatKeyForDisplay = (key: string) => {
    return key
      ?.replace(/_/g, " ")
      .replace(/([A-Z])/g, " $1")
      .trim()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = wrapperRef.current?.clientWidth || 800;
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    if (!data || data.length === 0 || !stackByKey) {
      svg
        .append("text")
        .attr("x", width / 2)
        .attr("y", height / 2)
        .attr("text-anchor", "middle")
        .attr("font-size", "16px")
        .attr("fill", "#999")
        .text("No data available");
      return;
    }

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const quarters = Array.from(
      new Set(data.map((d) => d.closed_fiscal_quarter))
    ).sort();
    const categories = Array.from(
      new Set(data.map((d) => d[stackByKey]))
    ).sort();

    const groupedData = d3.groups(data, (d) => d.closed_fiscal_quarter);
    const dataMap = new Map();
    groupedData.forEach(([quarter, entries]) => {
      const map = new Map();
      entries.forEach((d) => map.set(d[stackByKey], d.acv));
      dataMap.set(quarter, map);
    });

    const stackData = quarters.map((q) => {
      const obj: any = { quarter: q };
      categories.forEach((cat) => {
        obj[cat] = dataMap.get(q)?.get(cat) || 0;
      });
      return obj;
    });

    const stack = d3.stack().keys(categories);
    const stackedSeries = stack(stackData);

    const x = d3
      .scaleBand()
      .domain(quarters)
      .range([0, chartWidth])
      .padding(0.2);

    // Y-axis domain calculation
    // Calculate the maximum total value for each quarter (sum of all categories)
    const maxTotalValue =
      d3.max(stackData, (d) => {
        return categories.reduce((sum, cat) => sum + (d[cat] || 0), 0);
      }) || 0;

    // Alternative approach: use the maximum value from stacked series
    const maxStackedValue =
      d3.max(stackedSeries, (series) => d3.max(series, (d) => d[1])) || 0;

    // Use the maximum of both approaches to ensure proper scaling
    const yDomainMax = Math.max(maxTotalValue, maxStackedValue);
    // const yDomainMax =
    //   d3.max(stackData, (d) =>
    //     categories.reduce((total, cat) => total + (d[cat] || 0), 0)
    //   ) || 0;
    const y = d3
      .scaleLinear()
      .domain([0, yDomainMax])
      .nice()
      .range([chartHeight, 0]);

    const color = d3.scaleOrdinal(d3.schemeCategory10).domain(categories);

    // X-axis
    g.append("g")
      .attr("transform", `translate(0,${chartHeight})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .style("text-anchor", "middle")
      .style("font-size", "12px")
      .attr("dy", "1.2em");

    // X-axis label
    g.append("text")
      .attr("x", chartWidth / 2)
      .attr("y", chartHeight + 60)
      .attr("text-anchor", "middle")
      .style("fill", "#555")
      .style("font-size", "13px")
      .text("Fiscal Quarter");

    // Y-axis with  tick formatting
    g.append("g")
      .call(
        d3
          .axisLeft(y)
          .ticks(5) // Increased ticks for better understanding
          .tickFormat(d3.format("~s"))
      )
      .selectAll("text")
      .style("font-size", "12px");

    // Y-axis label
    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -chartHeight / 2)
      .attr("y", -margin.left + 15)
      .attr("text-anchor", "middle")
      .style("fill", "#555")
      .style("font-size", "13px")
      .text("ACV");

    // Add grid lines for better readability
    g.selectAll(".grid-line")
      .data(y.ticks(8))
      .enter()
      .append("line")
      .attr("class", "grid-line")
      .attr("x1", 0)
      .attr("x2", chartWidth)
      .attr("y1", (d) => y(d))
      .attr("y2", (d) => y(d))
      .attr("stroke", "#e0e0e0")
      .attr("stroke-width", 0.5)
      .attr("stroke-dasharray", "2,2");

    // Create stacked bars
    const barGroups = g
      .selectAll(".layer")
      .data(stackedSeries)
      .join("g")
      .attr("fill", (d) => color(d.key));

    barGroups
      .selectAll("rect")
      .data((d) => d.map((point) => ({ ...point, key: d.key })))
      .join("rect")
      .attr("x", (d) => x(d.data.quarter)!)
      .attr("y", (d) => y(d[1]))
      .attr("height", (d) => Math.max(0, y(d[0]) - y(d[1])))
      .attr("width", x.bandwidth())
      .append("title")
      .text((d) => {
        const match = data.find(
          (item) =>
            item.closed_fiscal_quarter === d.data.quarter &&
            item[stackByKey] === d.key
        );
        const count = match?.count ?? 0;
        const value = d.data[d.key] || 0;
        const valueInMillions = value / 1000000;
        return `Quarter: ${d.data.quarter}
${stackByKey}: ${d.key}
ACV: ${d3.format("$,.2f")(value)} (${d3.format("$,.2f")(valueInMillions)}M)
Count: ${count}`;
      });

    // Legend positioned below chart
    const legend = svg
      .append("g")
      .attr(
        "transform",
        `translate(${margin.left}, ${chartHeight + margin.top + 70})`
      );

    categories.forEach((cat, i) => {
      const legendGroup = legend
        .append("g")
        .attr("transform", `translate(${i * 120}, 0)`);

      legendGroup
        .append("rect")
        .attr("width", 14)
        .attr("height", 14)
        .attr("fill", color(cat));

      legendGroup
        .append("text")
        .attr("x", 20)
        .attr("y", 11)
        .style("font-size", "12px")
        .style("fill", "#333")
        .text(cat);
    });
  }, [data, stackByKey, title]);

  return (
    <div
      ref={wrapperRef}
      style={{
        width: "100%",
        fontFamily: "Inter, sans-serif",
        backgroundColor: "white",
        borderRadius: "12px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        padding: "16px",
      }}
    >
      <h3 style={{ textAlign: "center", marginBottom: "10px", color: "#222" }}>
        {title || "Chart"}
      </h3>
      <svg ref={svgRef} width="100%" height={height} />
    </div>
  );
};

export default StackedBarChart;
