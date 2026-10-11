const { Plan } = require("../models/Plan");
const { asyncHandler } = require("../utils/asyncHandler");

const getAllPlans = asyncHandler(async (req, res) => {
  const plans = await Plan.find({ isActive: true }).sort({ sortOrder: 1 });

  res.status(200).json({
    success: true,
    data: plans,
  });
});

const getPlanById = asyncHandler(async (req, res) => {
  const plan = await Plan.findById(req.params.id);

  if (!plan) {
    return res.status(404).json({
      success: false,
      message: "Plan not found",
    });
  }

  res.status(200).json({
    success: true,
    data: plan,
  });
});

const createPlan = asyncHandler(async (req, res) => {
  const plan = await Plan.create(req.body);

  res.status(201).json({
    success: true,
    data: plan,
  });
});

const updatePlan = asyncHandler(async (req, res) => {
  const plan = await Plan.findByIdAndUpdate(req.params.id, req.body, {
    returnDocument: "after",
    runValidators: true,
  });

  if (!plan) {
    return res.status(404).json({
      success: false,
      message: "Plan not found",
    });
  }

  res.status(200).json({
    success: true,
    data: plan,
  });
});

const deletePlan = asyncHandler(async (req, res) => {
  const plan = await Plan.findByIdAndDelete(req.params.id);

  if (!plan) {
    return res.status(404).json({
      success: false,
      message: "Plan not found",
    });
  }

  res.status(200).json({
    success: true,
    message: "Plan deleted successfully",
  });
});

module.exports = {
  getAllPlans,
  getPlanById,
  createPlan,
  updatePlan,
  deletePlan,
};