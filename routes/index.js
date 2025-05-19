import express from "express";
import { promises as fs } from "fs";
import { join } from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";
import nodemailer from "nodemailer";

const __dirname = dirname(fileURLToPath(import.meta.url));
const router = express.Router();

// Set up Nodemailer transporter
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // Use TLS (false for port 587, true for port 465)
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

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
      csrfToken: req.csrfToken(), // Pass CSRF token to the template
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
        csrfToken: req.csrfToken(), // Pass CSRF token on error
      });
    }

    try {
      // Send email using Nodemailer
      await transporter.sendMail({
        from: `"Portfolio Contact Form" <${process.env.EMAIL}>`,
        to: process.env.EMAIL,
        replyTo: email,
        subject: `New Contact Form Submission from ${name}`,
        text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}\nDate: ${new Date().toISOString()}`,
        html: `
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Message:</strong> ${message}</p>
          <p><strong>Date:</strong> ${new Date().toISOString()}</p>
        `,
      });

      res.render("contact.ejs", {
        msgSent: true,
        error: null,
        pageTitle: "Contact Romio Dhar",
        metaDescription: "Get in touch with Romio Dhar to discuss your web development project and bring your ideas to life.",
        currentPath: req.path,
        csrfToken: req.csrfToken(), // Pass CSRF token on success
      });
    } catch (err) {
      console.error("Error sending email:", err);
      res.status(500).render("contact.ejs", {
        msgSent: false,
        error: "Failed to send message. Please try again later.",
        pageTitle: "Contact Romio Dhar",
        metaDescription: "Get in touch with Romio Dhar to discuss your web development project and bring your ideas to life.",
        currentPath: req.path,
        csrfToken: req.csrfToken(), // Pass CSRF token on error
      });
    }
  });

  return router;
}