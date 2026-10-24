require("dotenv").config();
const { connectDatabase } = require("../config/database");
const { Plan } = require("../models/Plan");

const seedPlans = async () => {
  await connectDatabase();

  const commonFeatures = [
    "Figma variables",
    "Dark mode variables",
    "Component properties",
    "Interactive components",
    "Auto Layout 5.0",
    "Single user license",
    "Design System",
  ];

  const plans = [
    {
      name: "pro_starter",
      displayName: "Basic",
      description: "Ideal for individuals who need quick access to basic features.",
      price: 29900,
      durationDays: 90,
      componentLimit: 100,
      features: [
        "100 Components",
        ...commonFeatures,
      ],
      sortOrder: 1,
      isActive: true,
    },
    {
      name: "pro_ultimate",
      displayName: "Advance",
      description: "Ideal for individuals who need advanced features and tools for client work.",
      price: 49900,
      durationDays: 180,
      componentLimit: 250,
      features: [
        "250 Components",
        ...commonFeatures,
      ],
      sortOrder: 2,
      isActive: true,
    },
    {
      name: "pro_annual",
      displayName: "Premium",
      description: "Ideal for businesses and pros who need full access and unlimited components.",
      price: 59900,
      durationDays: 365,
      componentLimit: 999999,
      isPremiumPlus: true,
      features: [
        "Unlimited Components",
        ...commonFeatures,
      ],
      sortOrder: 3,
      isActive: true,
    },
  ];

  for (const planData of plans) {
    await Plan.findOneAndUpdate(
      { name: planData.name },
      planData,
      { upsert: true, returnDocument: "after" }
    );
    console.log(`Seeded/Updated plan: ${planData.displayName}`);
  }

  console.log("Seed completed!");
  process.exit(0);
};

seedPlans().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});