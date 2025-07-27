const KycKybVerification = require("../models/KycKybVerification");

exports.getKycStatus = async (req, res) => {
  try {
    // In a real app, you'd get userId from authenticated session
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const kycVerification = await KycKybVerification.findOne({ userId });

    if (!kycVerification) {
      return res.status(200).json({ status: "unverified" });
    }

    res.status(200).json({
      status: kycVerification.status,
      submittedAt: kycVerification.submittedAt,
      verifiedAt: kycVerification.verifiedAt,
      denialReason: kycVerification.denialReason,
      cooldownUntil: kycVerification.cooldownUntil,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching KYC status", error });
  }
};
