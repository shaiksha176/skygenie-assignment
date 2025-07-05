import express from "express";
import cors from "cors";
import morgan from "morgan";
import team from "./data/team.json" assert { type: "json" };
import account_industry from "./data/account_industry.json" assert { type: "json" };
import acv_range from "./data/acv_range.json" assert { type: "json" };
import customer_type from "./data/customer_type.json" assert { type: "json" };

const app = express();
const router = express.Router();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

router.use("/api", (req, res, next) => {
  console.log(`API Request: ${req.method} ${req.url}`);
  next();
});

// Health check API endpoint
router.get("/health", (req, res) => {
  res.status(200).json({ status: "UP" });
});

router.get("/team", (req, res) => {
  res
    .status(200)
    .json({ data: team, key: "Cust_Type", title: "ACV by Quarter and Team" });
});

router.get("/account-industry", (req, res) => {
  res.status(200).json({
    data: account_industry,
    key: "Acct_Industry",
    title: "ACV by Quarter and Account Industry",
  });
});

router.get("/acv-range", (req, res) => {
  res.status(200).json({
    data: acv_range,
    key: "ACV_Range",
    title: "ACV by Quarter and ACV Range",
  });
});

router.get("/customer-type", (req, res) => {
  res.status(200).json({
    data: customer_type,
    key: "Cust_Type",
    title: "ACV by Quarter and Customer Type",
  });
});

app.use("/api", router);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal Server Error" });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
