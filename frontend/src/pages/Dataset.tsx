import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  CircularProgress,
  Button,
} from "@mui/material";
import DataTable from "../components/DataTable";
import StackedBarChart from "../components/StackedBarChart";
import DoughnutChart from "../components/DoughnutChart";
import axios from "axios";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const Dataset = () => {
  const { id } = useParams();
  const [data, setData] = useState([]);
  const [key, setKey] = useState("");
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/api/${id}`);
        const result = response.data.data;

        setData(result);
        setKey(response.data.key);
        setTitle(response.data.title);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <Box
        minHeight="80vh"
        display="flex"
        justifyContent="center"
        alignItems="center"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ backgroundColor: "#f9fafc", py: 6, minHeight: "100vh" }}>
      <Container maxWidth="lg">
        <Box mb={5}>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            mb={2}
          >
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate("/")}
            >
              Back
            </Button>
            <Typography variant="h4" fontWeight={700}>
              {title || id?.toUpperCase()} Dashboard
            </Typography>
            <Box width="80px" />
          </Box>

          <Typography
            variant="subtitle1"
            color="text.secondary"
            textAlign="center"
          >
            Visual insights and data breakdown for <strong>{title}</strong>
          </Typography>
        </Box>

        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 12 }}>
            <StackedBarChart data={data} title={title} stackByKey={key} />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <DoughnutChart data={data} title={title} stackByKey={key} />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
              <DataTable data={data} />
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Dataset;
