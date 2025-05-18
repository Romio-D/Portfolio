import express from "express";
import { promises as fs } from "fs";
import { join } from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const router = express.Router();

export default function createRouter(projects) {
  router.get("/", (req, res) => {
    res.render("index.ejs", {
      pageTitle: "Home Page - Romio Dhar",
      metaDescription: "Portfolio of Romio Dhar, a Full-Stack Developer specializing in scalable web solutions with HTML, CSS, JavaScript, Express.js, and Node.js.",
      currentPath: req.path,
    });
  });

  router.get("/about", (req, res) => {
    res.render("about.ejs", {
      pageTitle: "About Romio Dhar - Full-Stack Developer",
      metaDescription: "Learn more about Romio Dhar, a Full-Stack Developer specializing in scalable web solutions with HTML, CSS, JavaScript, Express.js, and Node.js.",
      currentPath: req.path,
    });
  });

  router.get("/projects", (req, res) => {
    res.render("projects.ejs", {
      projects,
      pageTitle: "My Work - Romio Dhar",
      metaDescription: "Explore the projects of Romio Dhar, showcasing skills in HTML, CSS, JavaScript, Express.js, Node.js, and MongoDB.",
      currentPath: req.path,
    });
  });

  router.get("/contact", (req, res) => {
    res.render("contact.ejs", {
      msgSent: false,
      error: null,
      pageTitle: "Contact Romio Dhar",
      metaDescription: "Get in touch with Romio Dhar to discuss your web development project and bring your ideas to life.",
      currentPath: req.path,
    });
  });

  router.post("/contact", async (req, res) => {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).render("contact.ejs", {
        msgSent: false,
        error: "All fields are required",
        pageTitle: "Contact Romio Dhar",
        metaDescription: "Get in touch with Romio Dhar to discuss your web development project and bring your ideas to life.",
        currentPath: req.path,
      });
    }

    try {
      let messages = [];
      try {
        const data = await fs.readFile(join(__dirname, "../messages.json"));
        messages = JSON.parse(data);
      } catch (err) {
        console.warn("messages.json not found, creating new file");
      }

      messages.push({ name, email, message, date: new Date() });

      await fs.writeFile(
        join(__dirname, "../messages.json"),
        JSON.stringify(messages, null, 2)
      );

      res.render("contact.ejs", {
        msgSent: true,
        error: null,
        pageTitle: "Contact Romio Dhar",
        metaDescription: "Get in touch with Romio Dhar to discuss your web development project and bring your ideas to life.",
        currentPath: req.path,
      });
    } catch (err) {
      console.error("Error saving message", err);
      res.status(500).render("contact.ejs", {
        msgSent: false,
        error: "Server error",
        pageTitle: "Contact Romio Dhar",
        metaDescription: "Get in touch with Romio Dhar to discuss your web development project and bring your ideas to life.",
        currentPath: req.path,
      });
    }
  });

  return router;
}