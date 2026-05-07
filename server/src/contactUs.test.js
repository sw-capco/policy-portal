const test = require("node:test");
const assert = require("node:assert/strict");

const { handleContactUs } = require("./routes/contactUs");

function createMockRes() {
  const res = {
    statusCode: 200,
    body: undefined,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    }
  };
  return res;
}

test("POST /api/contact-us accepts valid payload", async () => {
  const req = { body: { name: "Jane Doe", email: "jane@example.com", message: "Hello" } };
  const res = createMockRes();
  await handleContactUs(req, res);
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.success, true);
  assert.equal(res.body.message, "Your message has been received.");
});

test("POST /api/contact-us rejects missing fields", async () => {
  const req = { body: { email: "jane@example.com", message: "Hello" } };
  const res = createMockRes();
  await handleContactUs(req, res);
  assert.equal(res.statusCode, 400);
  assert.equal(res.body.success, false);
  assert.equal(typeof res.body.error, "string");
});

test("POST /api/contact-us rejects invalid email", async () => {
  const req = { body: { name: "Jane Doe", email: "not-an-email", message: "Hello" } };
  const res = createMockRes();
  await handleContactUs(req, res);
  assert.equal(res.statusCode, 400);
  assert.equal(res.body.success, false);
  assert.match(res.body.error, /email/i);
});
