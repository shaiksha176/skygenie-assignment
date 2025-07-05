import React from "react";
import {
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Typography,
  Container,
  Box,
  Avatar,
  Zoom,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

const datasets = [
  {
    id: "account-industry",
    title: "Accounts",
    subtitle: "Manage and analyze account data",
    avatarColor: "#e3f2fd",
    icon: "🏢",
  },
  {
    id: "acv-range",
    title: "ACV Range",
    subtitle: "Annual contract value insights",
    avatarColor: "#e8f5e9",
    icon: "💲",
  },
  {
    id: "customer-type",
    title: "Customers",
    subtitle: "Customer analytics and segmentation",
    avatarColor: "#f3e5f5",
    icon: "👥",
  },
  {
    id: "team",
    title: "Team",
    subtitle: "Team performance and metrics",
    avatarColor: "#fff3e0",
    icon: "👤",
  },
];

const Home = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ backgroundColor: "#f9fafc", minHeight: "100vh", py: 6 }}>
      <Container maxWidth="lg">
        <Box textAlign="center" mb={6}>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            📊 Sales & Revenue Dashboard
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Select a dataset to explore detailed analytics and insights
          </Typography>
        </Box>

        <Grid container spacing={4} justifyContent="center">
          {datasets.map((ds, idx) => (
            <Grid
              key={ds.id}
              size={{ xs: 12, sm: 6, md: 3 }}
              display="flex"
              justifyContent="center"
            >
              <Zoom in style={{ transitionDelay: `${idx * 100}ms` }}>
                <Card
                  elevation={3}
                  sx={{
                    width: "100%",
                    borderRadius: 3,
                    p: 2,
                    backgroundColor: "white",
                    transition: "transform 0.3s, box-shadow 0.3s",
                    "&:hover": {
                      transform: "scale(1.03)",
                      boxShadow: 4,
                      cursor: "pointer",
                    },
                  }}
                >
                  <CardActionArea
                    sx={{ height: "100%", p: 2 }}
                    onClick={() => navigate(`/dataset/${ds.id}`)}
                  >
                    <Box
                      display="flex"
                      flexDirection="column"
                      alignItems="center"
                    >
                      <Avatar
                        sx={{
                          bgcolor: ds.avatarColor,
                          width: 50,
                          height: 50,
                          mb: 2,
                          fontSize: 24,
                        }}
                      >
                        {ds.icon}
                      </Avatar>
                      <Typography variant="h6" fontWeight={600}>
                        {ds.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        align="center"
                        mt={1}
                      >
                        {ds.subtitle}
                      </Typography>
                    </Box>
                  </CardActionArea>
                </Card>
              </Zoom>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default Home;
