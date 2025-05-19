import express from "express";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { promises as fs } from "fs";
import helmet from "helmet";
import dotenv from "dotenv";
import morgan from "morgan";
import compression from "compression";
import cookieParser from "cookie-parser";
import { doubleCsrf } from "csrf-csrf";
import createRouter from "./routes/index.js";

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = process.env.PORT || 3000;

const { doubleCsrfProtection } = doubleCsrf({
  getSecret: () => process.env.CSRF_SECRET || "Secret",
  cookieName: "_csrf",
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  },
  getSessionIdentifier: (req) => req.ip || "stateless",
});

app.set("view engine", "ejs");
app.use(express.static(join(__dirname, "public")));
app.use(express.urlencoded({ extended: false }));
app.use(helmet());
app.use(morgan("dev"));
app.use(compression());
app.use(cookieParser());
app.use(doubleCsrfProtection);

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
  // Handle CSRF token errors
  if (err.code === "EBADCSRFTOKEN") {
    res.status(403).render("error.ejs", {
      pageTitle: "Error",
      metaDescription: "",
      currentPath: req.path,
      error: "Invalid CSRF token. Please try again.",
    });
  } else {
  res.status(500).render("error.ejs", {
    pageTitle: "Error",
    metaDescription: "",
    currentPath: req.path,
    error: "Something went wrong!",
  });
  };
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));