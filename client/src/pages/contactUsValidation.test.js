import test from "node:test";
import assert from "node:assert/strict";
import { validateContactUs } from "./contactUsValidation.js";

test("validateContactUs returns required-field errors", () => {
  const errors = validateContactUs({ name: "", email: "", message: "" });
  assert.equal(errors.name, "Name is required.");
  assert.equal(errors.email, "Email is required.");
  assert.equal(errors.message, "Message is required.");
});

test("validateContactUs validates email format", () => {
  const errors = validateContactUs({ name: "A", email: "bad", message: "Hello" });
  assert.equal(errors.email, "Enter a valid email address.");
});

test("validateContactUs returns no errors for valid inputs", () => {
  const errors = validateContactUs({ name: "A", email: "a@example.com", message: "Hello" });
  assert.equal(Object.keys(errors).length, 0);
});

