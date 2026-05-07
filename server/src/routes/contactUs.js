const express = require("express");
const { rateLimiter } = require("../middleware/rateLimiter");
const { submitContactForm } = require("../controllers/contactController");

const contactUsRouter = express.Router();

contactUsRouter.post("/", rateLimiter({ windowMs: 60_000, max: 5 }), submitContactForm);

module.exports = { contactUsRouter };

