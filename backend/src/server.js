import express from "express";
import cors from "cors";
import morgan from "morgan";
import clinicRoutes from "./routes/clinicRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

const app = express();


app.use(cors({ origin: "https://bankreconn.centralindia.cloudapp.azure.com", credentials: true }));
app.use(express.json());
app.use(morgan("dev"));


app.get("/", (req, res) => {
  res.send("🏥 Hospital Portal Backend is Running");
});


app.use("/api/clinic", clinicRoutes);
app.use("/api/admin", adminRoutes);


app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Server Error" });
});


app.listen(5000, () => console.log("Server running on port 5000"));
