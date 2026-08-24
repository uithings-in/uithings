const mongoose = require("mongoose");
const { Component } = require("./src/models/Component");
require("dotenv").config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected");
  
  const query = {
    $and: [
      {
        $or: [
          { status: "approved" },
          { status: { $exists: false } },
          { status: null },
        ],
      },
    ],
  };

  const designType = "UI Design";
  if (designType === "UI Design") {
    query.$and = [
      ...(query.$and || []),
      { $or: [{ designType: "UI Design" }, { designType: { $exists: false } }, { designType: null }] },
    ];
  }

  try {
    const items = await Component.find(query).limit(1).lean();
    console.log("Query success! Items found:", items.length);
  } catch (err) {
    console.error("Query Error:", err);
  }
  process.exit(0);
}
run();
