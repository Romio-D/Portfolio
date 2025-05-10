import express from "express";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { promises as fs } from "fs";
import { error } from "console";

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.use(express.static(join(__dirname, "public")));
app.use(express.urlencoded({ extended: false }));

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
loadProjects();

app.get("/", (req, res) => res.render("index.ejs"));
app.get("/about", (req, res) => res.render("about.ejs"));
app.get("/projects", (req, res) => res.render("projects.ejs", { projects }));
app.get("/contact", (req, res) => res.render("contacts.ejs", { msgSent: false }));

app.post("/contact", async (req, res) => {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).render("contact.ejs", {
            msgSent: false,
            error: "All fields are required",
        });
    }

    try {
        let message = [];
        try {
            const data = await fs.readFile(join(__dirname, "messages.json"));
            messages = JSON.parse(data);
        } catch (err) {
            console.warn("messages.json not found, creating new file");
        }

        messages.push({ name, email, message, date: new Date() });

        await fs.writeFile(
            join(__dirname, "messages.json"),
            JSON.stringify(messages, null, 2)
        );

        res.render("contact.ejs", { msgSent: true });

    } catch (err) {
        console.error("Error saving message", err);
        res.status(500).render("contact.ejs", {
            msgSent: false,
            error: "Server error",
        });
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));