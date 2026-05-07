const { z } = require("zod");
const { getPolicyByNumberForPolicyholder, getProofPdfForPolicy } = require("../services/policyService");

const paramsSchema = z.object({
  policyNumber: z.string().min(1)
});

async function getPolicyDetails(req, res, next) {
  try {
    const { policyNumber } = paramsSchema.parse(req.params);
    const { policyholder_id } = req.auth;

    const result = await getPolicyByNumberForPolicyholder({ policyNumber, policyholderId: policyholder_id });
    if (result.status === "forbidden") return res.status(403).json({ error: { code: "FORBIDDEN", message: "Policy not owned by policyholder" } });
    if (result.status === "not_found") return res.status(404).json({ error: { code: "NOT_FOUND", message: "Policy not found or inactive" } });

    return res.json(result.policy);
  } catch (err) {
    return next(err);
  }
}

async function getProofOfInsurance(req, res, next) {
  try {
    const { policyNumber } = paramsSchema.parse(req.params);
    const { policyholder_id } = req.auth;

    const result = await getPolicyByNumberForPolicyholder({ policyNumber, policyholderId: policyholder_id });
    if (result.status === "forbidden") return res.status(403).json({ error: { code: "FORBIDDEN", message: "Policy not owned by policyholder" } });
    if (result.status === "not_found") return res.status(404).json({ error: { code: "NOT_FOUND", message: "Policy not found or inactive" } });

    const pdf = await getProofPdfForPolicy(result.policy);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=\"proof-of-insurance-${policyNumber}.pdf\"`);
    return res.status(200).send(pdf);
  } catch (err) {
    return next(err);
  }
}

module.exports = { getPolicyDetails, getProofOfInsurance };

