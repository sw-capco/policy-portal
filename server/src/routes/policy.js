const express = require("express");
const { requireSessionToken } = require("../middleware/authMiddleware");
const { getPolicyDetails, getProofOfInsurance } = require("../controllers/policyController");

const policyRouter = express.Router();

policyRouter.get("/:policyNumber", requireSessionToken, getPolicyDetails);
policyRouter.get("/:policyNumber/proof-of-insurance", requireSessionToken, getProofOfInsurance);

module.exports = { policyRouter };

