const test = require("node:test");
const assert = require("node:assert/strict");

const { Policyholder } = require("./models/Policyholder");
const emailService = require("./services/emailService");
const apiAuthController = require("./controllers/apiAuthController");

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

test("POST /api/auth/login returns sessionToken when MFA disabled", async () => {
  const req = { body: { email: "demo@example.com", password: "Password123!" } };
  const res = createMockRes();
  await apiAuthController.login(req, res, (err) => {
    throw err;
  });
  assert.equal(res.statusCode, 200);
  assert.equal(typeof res.body.sessionToken, "string");
  assert.ok(res.body.sessionToken.length > 20);
});

test("POST /api/auth/login returns mfaRequired and /api/auth/mfa verifies code (single-use)", async () => {
  const originalSend = emailService.sendMfaCodeEmail;
  let lastCode = null;
  emailService.sendMfaCodeEmail = async ({ toEmail, code }) => {
    assert.equal(toEmail, "demo@example.com");
    lastCode = code;
    return { ok: true };
  };

  try {
    // Enable MFA for the demo policyholder (id=1) using existing model methods.
    await Policyholder.setPendingMfaSecret("1", "TESTSECRETBASE32");
    await Policyholder.enableMfaFromPending("1");

    const loginReq = { body: { email: "demo@example.com", password: "Password123!" } };
    const loginRes = createMockRes();
    await apiAuthController.login(loginReq, loginRes, (err) => {
      throw err;
    });
    assert.equal(loginRes.statusCode, 200);
    assert.equal(loginRes.body.mfaRequired, true);
    assert.equal(loginRes.body.mfaChannel, "email");
    assert.equal(typeof loginRes.body.sessionId, "string");
    assert.ok(loginRes.body.sessionId.length > 10);
    assert.equal(typeof lastCode, "string");
    assert.equal(lastCode.length, 6);

    const badReq = { body: { sessionId: loginRes.body.sessionId, code: "000000" } };
    const badRes = createMockRes();
    await apiAuthController.mfa(badReq, badRes, (err) => {
      throw err;
    });
    assert.equal(badRes.statusCode, 401);

    const okReq = { body: { sessionId: loginRes.body.sessionId, code: lastCode } };
    const okRes = createMockRes();
    await apiAuthController.mfa(okReq, okRes, (err) => {
      throw err;
    });
    assert.equal(okRes.statusCode, 200);
    assert.equal(typeof okRes.body.sessionToken, "string");
    assert.ok(okRes.body.sessionToken.length > 20);

    const reuseReq = { body: { sessionId: loginRes.body.sessionId, code: lastCode } };
    const reuseRes = createMockRes();
    await apiAuthController.mfa(reuseReq, reuseRes, (err) => {
      throw err;
    });
    assert.equal(reuseRes.statusCode, 401);
  } finally {
    emailService.sendMfaCodeEmail = originalSend;
  }
});
