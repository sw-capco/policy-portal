// Minimal in-memory policy model for selected issues (#56/#59).

const policies = [
  {
    policy_number: "ON-123-456-789",
    status: "active",
    effective_date: "2026-01-01",
    expiry_date: "2027-01-01",
    policyholder_id: "1",
    policyholder: {
      name: "Demo Policyholder",
      address: "123 King St W, Toronto, ON"
    },
    coverages: [
      { type: "liability", limit: 1000000, deductible: 0 },
      { type: "collision", limit: 50000, deductible: 1000 },
      { type: "comprehensive", limit: 50000, deductible: 500 }
    ],
    vehicle: {
      make: "Toyota",
      model: "Camry",
      year: 2022,
      vin: "2T1BURHE0JC123456",
      use_description: "Pleasure"
    }
  }
];

class Policy {
  static async findByNumber(policyNumber) {
    const normalized = String(policyNumber);
    const found = policies.find((p) => p.policy_number === normalized);
    return found ? JSON.parse(JSON.stringify(found)) : null;
  }
}

module.exports = { Policy };

