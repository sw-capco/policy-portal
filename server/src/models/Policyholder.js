const { hashPassword } = require("../services/passwordService");
const { encryptForStorage, decryptFromStorage } = require("../services/cryptoService");

// Minimal in-memory model to support the selected issues.
// Replace with real DB integration when backend persistence is introduced.

const store = new Map();

async function seed() {
  if (store.size > 0) return;
  const password_hash = await hashPassword("Password123!");
  store.set("1", {
    id: "1",
    email: "demo@example.com",
    policy_number: "ON-123-456-789",
    password_hash,
    mfa_secret_enc: null,
    mfa_pending_secret_enc: null,
    mfa_enabled: false
  });
}

class Policyholder {
  static async findByEmail(email) {
    await seed();
    for (const ph of store.values()) {
      if (ph.email.toLowerCase() === String(email).toLowerCase()) return { ...ph };
    }
    return null;
  }

  static async findById(id) {
    await seed();
    const ph = store.get(String(id));
    return ph ? { ...ph } : null;
  }

  static async setPendingMfaSecret(id, secret) {
    await seed();
    const ph = store.get(String(id));
    if (!ph) return null;
    ph.mfa_pending_secret_enc = encryptForStorage(secret);
    return { ...ph };
  }

  static async enableMfaFromPending(id) {
    await seed();
    const ph = store.get(String(id));
    if (!ph || !ph.mfa_pending_secret_enc) return null;
    ph.mfa_secret_enc = ph.mfa_pending_secret_enc;
    ph.mfa_pending_secret_enc = null;
    ph.mfa_enabled = true;
    return { ...ph };
  }

  static async getMfaSecrets(id) {
    await seed();
    const ph = store.get(String(id));
    if (!ph) return null;
    return {
      enabled: Boolean(ph.mfa_enabled && ph.mfa_secret_enc),
      secret: ph.mfa_secret_enc ? decryptFromStorage(ph.mfa_secret_enc) : null,
      pendingSecret: ph.mfa_pending_secret_enc ? decryptFromStorage(ph.mfa_pending_secret_enc) : null
    };
  }
}

module.exports = { Policyholder };

