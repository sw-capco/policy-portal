const test = require("node:test");
const assert = require("node:assert/strict");

const contactController = require("./controllers/contactController");
const contactUsService = require("./services/contactUsService");

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

test("POST /api/contact-us returns 400 with field errors for invalid payload", async () => {
  const req = { body: { name: " ", email: "not-an-email", message: "short" }, ip: "127.0.0.1", headers: {} };
  const res = createMockRes();

  await contactController.submitContactForm(req, res, (err) => {
    throw err;
  });

  assert.equal(res.statusCode, 400);
  assert.equal(res.body.success, false);
  assert.ok(Array.isArray(res.body.errors));
  const fields = res.body.errors.map((e) => e.field);
  assert.ok(fields.includes("name"));
  assert.ok(fields.includes("email"));
  assert.ok(fields.includes("message"));
});

test("POST /api/contact-us sanitizes input and returns success for valid payload", async () => {
  const original = contactUsService.submitContactInquiry;
  let captured = null;
  contactUsService.submitContactInquiry = async (payload) => {
    captured = payload;
    return { ok: true };
  };

  try {
    const req = {
      body: { name: " <b>Alice</b> ", email: "alice@example.com", message: "Hello <script>alert(1)</script> world" },
      ip: "203.0.113.10",
      headers: {}
    };
    const res = createMockRes();

    await contactController.submitContactForm(req, res, (err) => {
      throw err;
    });

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.success, true);
    assert.equal(typeof res.body.message, "string");

    assert.ok(captured);
    assert.equal(captured.meta.requesterIp, "203.0.113.10");
    assert.ok(typeof captured.meta.receivedAt === "string");
    assert.equal(captured.name, "&lt;b&gt;Alice&lt;/b&gt;");
    assert.equal(captured.message, "Hello &lt;script&gt;alert(1)&lt;/script&gt; world");
    assert.equal(captured.email, "alice@example.com");
  } finally {
    contactUsService.submitContactInquiry = original;
  }
});

