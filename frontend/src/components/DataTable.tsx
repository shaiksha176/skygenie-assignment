import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
} from "@mui/material";
import * as d3 from "d3";

const categoryKeyMap: Record<string, string> = {
  "account-industry": "Acct_Industry",
  "acv-range": "ACV_Range",
  "customer-type": "Cust_Type",
  team: "Cust_Type",
};

const DataTable = ({ data = [], id }: { data: any[]; id: string }) => {
  if (!data || data.length === 0) return null;

  // console.log("Raw Data:", data);

  // Detect which key to use for category
  let key: string;

  if (categoryKeyMap[id]) {
    // If we have a predefined mapping for this dataset ID, use that
    key = categoryKeyMap[id];
  } else {
    // Otherwise, find the first key in the data object that is NOT one of the common fields
    const knownKeys = ["count", "acv", "closed_fiscal_quarter", "query_key"];
    key =
      Object.keys(data[0]).find((k) => {
        return !knownKeys.includes(k); // Skip "count", "acv", etc.
      }) || "category"; // If nothing found, default to "category"
  }

  // Step 2: Get all the unique values for the selected key (category values)
  const categorySet = new Set<string>();
  data.forEach((row) => {
    if (row[key]) categorySet.add(row[key]);
  });

  // Convert the Set into a sorted array of category names

  const categories = Array.from(categorySet).sort();

  // console.log("Categories:", categories);

  const colorScale = d3.scaleOrdinal(d3.schemeCategory10).domain(categories);

  // Group data by quarter
  const grouped: Record<string, Record<string, any>> = {};
  data.forEach((d) => {
    const quarter = d.closed_fiscal_quarter;
    const cat = d[key];
    if (!grouped[quarter]) grouped[quarter] = {};
    grouped[quarter][cat] = d;
  });

  // console.log("Grouped Data:", grouped);

  const quarters = Object.keys(grouped).sort();

  // console.log("Quarters:", quarters);

  // Initialize totals
  const totals: Record<string, { count: number; acv: number }> = {};
  categories.forEach((cat) => {
    totals[cat] = { count: 0, acv: 0 };
  });

  return (
    <>
      <Typography
        variant="h6"
        sx={{ mt: 4, mb: 2, fontWeight: 600, color: "#333" }}
      >
        Quarterly Breakdown
      </Typography>

      <TableContainer
        component={Paper}
        elevation={3}
        sx={{
          borderRadius: 2,
          overflowX: "auto",
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        }}
      >
        <Table
          sx={{
            tableLayout: "auto",
            "& th, & td": {
              whiteSpace: "nowrap",
              borderRight: "1px solid #ddd",
            },
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell
                sx={{ backgroundColor: "#f0f0f0", fontWeight: "bold" }}
              >
                Quarter
              </TableCell>
              {categories.map((cat) => {
                const color = colorScale(cat);
                return (
                  <React.Fragment key={cat}>
                    <TableCell
                      align="right"
                      sx={{
                        backgroundColor: color,
                        color: "white",
                        fontWeight: "bold",
                      }}
                    >
                      {cat} Count
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        backgroundColor: color,
                        color: "white",
                        fontWeight: "bold",
                      }}
                    >
                      {cat} ACV
                    </TableCell>
                  </React.Fragment>
                );
              })}
            </TableRow>
          </TableHead>

          <TableBody>
            {quarters.map((q, i) => (
              <TableRow
                key={q}
                sx={{
                  backgroundColor: i % 2 === 0 ? "#fafafa" : "#fff",
                }}
              >
                <TableCell>{q}</TableCell>
                {categories.map((cat) => {
                  const entry = grouped[q][cat] || { count: 0, acv: 0 };
                  totals[cat].count += entry.count;
                  totals[cat].acv += entry.acv;
                  const color = colorScale(cat);
                  return (
                    <React.Fragment key={cat}>
                      <TableCell
                        align="right"
                        sx={{ backgroundColor: `${color}22` }}
                      >
                        {entry.count}
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{ backgroundColor: `${color}22` }}
                      >
                        {entry.acv.toFixed(2)}
                      </TableCell>
                    </React.Fragment>
                  );
                })}
              </TableRow>
            ))}

            <TableRow sx={{ backgroundColor: "#eee" }}>
              <TableCell>
                <strong>Total</strong>
              </TableCell>
              {categories.map((cat) => {
                const color = colorScale(cat);
                return (
                  <React.Fragment key={cat}>
                    <TableCell
                      align="right"
                      sx={{ backgroundColor: `${color}22` }}
                    >
                      <strong>{totals[cat].count}</strong>
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{ backgroundColor: `${color}22` }}
                    >
                      <strong>${(totals[cat].acv / 1000).toFixed(1)}K</strong>
                    </TableCell>
                  </React.Fragment>
                );
              })}
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default DataTable;
