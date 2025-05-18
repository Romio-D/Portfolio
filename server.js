import express from "express";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { promises as fs } from "fs";
import helmet from "helmet";
import dotenv from "dotenv";
import createRouter from "./routes/index.js";

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.use(express.static(join(__dirname, "public")));
app.use(express.urlencoded({ extended: false }));
app.use(helmet());

let projects;
async function loadProjects() {
  try {
    const data = await fs.readFile(join(__dirname, "projects.json"));
    projects = JSON.parse(data);
  } catch (err) {
    console.error("Error loading projects:", err);
    projects = [];
  }
}
await loadProjects();

// Use the router with the projects data
app.use("/", createRouter(projects));

// Error-handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render("error.ejs", {
    pageTitle: "Error",
    metaDescription: "",
    currentPath: req.path,
    error: "Something went wrong!",
  });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));