const { asyncHandler } = require("../utils/asyncHandler");
const { Component } = require("../models/Component");
const { User } = require("../models/User");
const { Subscription } = require("../models/Subscription");
const { Tag } = require("../models/Tag");
const { autoActivateNextQueued } = require("./paymentController");
const {
  cacheGet,
  cacheSet,
  cacheInvalidate,
  bumpListVersion,
  getListVersion,
  listKey,
  componentKey,
  myListKey,
  TTL_LIST,
  TTL_SINGLE,
  TTL_MY,
} = require("../utils/cache");

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// ─── GET /api/components ──────────────────────────────────────────────────────
const listComponents = asyncHandler(async (req, res) => {
  const {
    q = "",
    tag = "",
    page = 1,
    limit = 20,
    skip: skipQuery = "",
    includeData = "false",
    designType = "",
    pricingType = "",
  } = req.query;
  const pageNumber = Math.max(Number(page) || 1, 1);
  const perPage = Math.min(Math.max(Number(limit) || 20, 1), 100);
  const skip = skipQuery !== "" ? Math.max(Number(skipQuery) || 0, 0) : (pageNumber - 1) * perPage;
  const shouldIncludeData = String(includeData).toLowerCase() === "true";

  // ── Cache read ──────────────────────────────────────────────────────────────
  const version = await getListVersion();
  const cacheKey = await listKey(
    version,
    q,
    tag,
    pageNumber,
    perPage,
    shouldIncludeData,
    designType,
    pricingType,
    skip
  );
  const cached = await cacheGet(cacheKey);
  if (cached) {
    res.set("X-Cache", "HIT");
    return res.json(cached);
  }

  // ── MongoDB query ───────────────────────────────────────────────────────────
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
  if (q) {
    const safeSearch = escapeRegex(q);
    query.$or = [
      { name: { $regex: safeSearch, $options: "i" } },
      { tags: { $regex: safeSearch, $options: "i" } },
    ];
  }
  if (tag) {
    query.tags = { $regex: `^${escapeRegex(tag)}$`, $options: "i" };
  }
  if (designType === "Wireframe") {
    query.designType = "Wireframe";
  } else if (designType === "UI Design") {
    query.$and = [
      ...(query.$and || []),
      { $or: [{ designType: "UI Design" }, { designType: { $exists: false } }, { designType: null }] },
    ];
  }
  if (pricingType === "Pro") {
    query.$and = [
      ...(query.$and || []),
      { $or: [{ pricingType: "Pro" }, { tags: { $regex: "pro", $options: "i" } }] },
    ];
  } else if (pricingType === "Free") {
    query.$and = [
      ...(query.$and || []),
      {
        $and: [
          { $or: [{ pricingType: { $ne: "Pro" } }, { pricingType: { $exists: false } }] },
          { tags: { $not: /pro/i } },
        ],
      },
    ];
  }

  const select = shouldIncludeData ? "" : "-figmaDataBase64";

  const [items, total] = await Promise.all([
    Component.find(query)
      .sort({ tagOrder: 1, createdAt: -1 })
      .skip(skip)
      .limit(perPage)
      .select(select)
      .populate({ path: "createdBy", select: "name email" })
      .lean(),
    Component.countDocuments(query),
  ]);

  const responseBody = {
    success: true,
    data: {
      items,
      pagination: {
        page: pageNumber,
        limit: perPage,
        total,
        totalPages: Math.ceil(total / perPage),
      },
    },
  };

  // ── Cache write ─────────────────────────────────────────────────────────────
  await cacheSet(cacheKey, responseBody, TTL_LIST);
  res.set("X-Cache", "MISS");
  res.json(responseBody);
});

// ─── GET /api/components/my ───────────────────────────────────────────────────
const listMyComponents = asyncHandler(async (req, res) => {
  const { q = "", tag = "", page = 1, limit = 20, skip: skipQuery = "" } = req.query;
  const pageNumber = Math.max(Number(page) || 1, 1);
  const perPage = Math.min(Math.max(Number(limit) || 20, 1), 100);
  const skip = skipQuery !== "" ? Math.max(Number(skipQuery) || 0, 0) : (pageNumber - 1) * perPage;

  // ── Cache read ──────────────────────────────────────────────────────────────
  const version = await getListVersion();
  const cacheKey = await myListKey(version, req.user.userId, q, tag, pageNumber, perPage, skip);
  const cached = await cacheGet(cacheKey);
  if (cached) {
    res.set("X-Cache", "HIT");
    return res.json(cached);
  }

  // ── MongoDB query ───────────────────────────────────────────────────────────
  const query = { createdBy: req.user.userId };
  if (q) {
    const safeSearch = escapeRegex(q);
    query.$or = [
      { name: { $regex: safeSearch, $options: "i" } },
      { tags: { $regex: safeSearch, $options: "i" } },
    ];
  }
  if (tag) {
    query.tags = { $regex: `^${escapeRegex(tag)}$`, $options: "i" };
  }

  const [items, total] = await Promise.all([
    Component.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(perPage)
      .select("-figmaDataBase64")
      .lean(),
    Component.countDocuments(query),
  ]);

  const responseBody = {
    success: true,
    data: {
      items,
      pagination: {
        page: pageNumber,
        limit: perPage,
        total,
        totalPages: Math.ceil(total / perPage),
      },
    },
  };

  // ── Cache write ─────────────────────────────────────────────────────────────
  await cacheSet(cacheKey, responseBody, TTL_MY);
  res.set("X-Cache", "MISS");
  res.json(responseBody);
});

// GET /api/components/favorites
const listFavoriteComponents = asyncHandler(async (req, res) => {
  const { q = "", page = 1, limit = 20, skip: skipQuery = "" } = req.query;
  const pageNumber = Math.max(Number(page) || 1, 1);
  const perPage = Math.min(Math.max(Number(limit) || 20, 1), 100);
  const skip = skipQuery !== "" ? Math.max(Number(skipQuery) || 0, 0) : (pageNumber - 1) * perPage;

  const user = await User.findById(req.user.userId).select("favoriteComponents").lean();
  const favoriteIds = user?.favoriteComponents || [];

  if (favoriteIds.length === 0) {
    return res.json({
      success: true,
      data: {
        items: [],
        pagination: {
          page: pageNumber,
          limit: perPage,
          total: 0,
          totalPages: 0,
        },
      },
    });
  }

  const query = {
    _id: { $in: favoriteIds },
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

  if (q) {
    const safeSearch = escapeRegex(q);
    query.$or = [
      { name: { $regex: safeSearch, $options: "i" } },
      { tags: { $regex: safeSearch, $options: "i" } },
    ];
  }

  const [items, total] = await Promise.all([
    Component.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(perPage)
      .select("-figmaDataBase64")
      .populate({ path: "createdBy", select: "name email" })
      .lean(),
    Component.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: {
      items: items.map((item) => ({ ...item, isFavorite: true })),
      pagination: {
        page: pageNumber,
        limit: perPage,
        total,
        totalPages: Math.ceil(total / perPage),
      },
    },
  });
});

// GET /api/components/favorites/ids
const listFavoriteComponentIds = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.userId).select("favoriteComponents").lean();

  res.json({
    success: true,
    data: {
      ids: (user?.favoriteComponents || []).map((id) => id.toString()),
    },
  });
});

// PATCH /api/components/:id/favorite
const toggleFavoriteComponent = asyncHandler(async (req, res) => {
  const component = await Component.findById(req.params.id).select("_id").lean();

  if (!component) {
    res.status(404);
    throw new Error("Component not found");
  }

  const user = await User.findById(req.user.userId).select("favoriteComponents");
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const componentId = component._id.toString();
  const isAlreadyFavorite = user.favoriteComponents.some(
    (id) => id.toString() === componentId
  );

  if (isAlreadyFavorite) {
    user.favoriteComponents.pull(component._id);
  } else {
    user.favoriteComponents.addToSet(component._id);
  }

  await user.save();

  res.json({
    success: true,
    data: {
      componentId,
      isFavorite: !isAlreadyFavorite,
    },
  });
});

// ─── GET /api/components/admin ────────────────────────────────────────────────
const listComponentsAdmin = asyncHandler(async (req, res) => {
  if (req.user.role !== "admin") {
    res.status(403);
    throw new Error("Admin access required");
  }

  const { page = 1, limit = 50 } = req.query;
  const pageNumber = Math.max(Number(page) || 1, 1);
  const perPage = Math.min(Math.max(Number(limit) || 50, 1), 100);
  const skip = (pageNumber - 1) * perPage;

  const [items, total] = await Promise.all([
    Component.find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(perPage)
      .populate({ path: "createdBy", select: "name email" })
      .lean(),
    Component.countDocuments({}),
  ]);

  res.json({
    success: true,
    data: {
      items,
      pagination: {
        page: pageNumber,
        limit: perPage,
        total,
        totalPages: Math.ceil(total / perPage),
      },
    },
  });
});

// ─── POST /api/components ─────────────────────────────────────────────────────
const createComponent = asyncHandler(async (req, res) => {
  const { name, description = "", tags = [], previewImageUrl, figmaDataBase64, designType, pricingType } = req.body;
  const userRole = req.user.role || "user";

  if (!name || !previewImageUrl || !figmaDataBase64) {
    res.status(400);
    throw new Error("name, previewImageUrl, and figmaDataBase64 are required");
  }

  // Logic: normal people can post free components only no pro.
  if (pricingType === "Pro" && userRole !== "admin") {
    res.status(403);
    throw new Error("Only admins can post Pro components");
  }

  // Logic: normal people can post atmost 20 components.
  if (userRole !== "admin") {
    const userComponentCount = await Component.countDocuments({ createdBy: req.user.userId });
    if (userComponentCount >= 20) {
      res.status(403);
      throw new Error("You have reached the limit of 20 components");
    }
  }

  let tagOrder = 999999;
  const activeTags = Array.isArray(tags) ? tags : [];
  if (activeTags.length > 0) {
    const matchedTags = await Tag.find({ name: { $in: activeTags } });
    if (matchedTags.length > 0) {
      tagOrder = Math.min(...matchedTags.map(t => t.order));
    }
  }

  const component = await Component.create({
    name,
    description,
    tags: activeTags,
    tagOrder,
    previewImageUrl,
    figmaDataBase64,
    designType,
    pricingType: userRole === "admin" ? pricingType : "Free",
    createdBy: req.user.userId,
    status: userRole === "admin" ? "approved" : "pending",
  });

  // Invalidate all list caches (bump version)
  await bumpListVersion();

  res.status(201).json({
    success: true,
    data: component,
  });
});

// ─── PATCH /api/components/:id/status ─────────────────────────────────────────
const updateComponentStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const userRole = req.user.role || "user";

  if (userRole !== "admin") {
    res.status(403);
    throw new Error("Only admins can update component status");
  }

  if (!["approved", "rejected", "pending"].includes(status)) {
    res.status(400);
    throw new Error("Invalid status");
  }

  const component = await Component.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true }
  );

  if (!component) {
    res.status(404);
    throw new Error("Component not found");
  }

  // Invalidate this component's cache + all list caches
  await Promise.all([
    cacheInvalidate(componentKey(req.params.id)),
    bumpListVersion(),
  ]);

  res.json({ success: true, data: component });
});

// ─── GET /api/components/:id ──────────────────────────────────────────────────
const getComponent = asyncHandler(async (req, res) => {
  const cacheKey = componentKey(req.params.id);

  // ── Cache read ──────────────────────────────────────────────────────────────
  const cached = await cacheGet(cacheKey);
  if (cached) {
    res.set("X-Cache", "HIT");
    return res.json(cached);
  }

  // ── MongoDB query ───────────────────────────────────────────────────────────
  const component = await Component.findById(req.params.id)
    .populate("createdBy", "name email")
    .lean();

  if (!component) {
    res.status(404);
    throw new Error("Component not found");
  }

  // For Pro components, don't include figmaDataBase64 in the cached response
  // The user needs to request it separately with authentication
  const componentToReturn = { ...component };
  if (component.pricingType === "Pro") {
    delete componentToReturn.figmaDataBase64;
  }

  const responseBody = { success: true, data: componentToReturn };

  // ── Cache write ─────────────────────────────────────────────────────────────
  await cacheSet(cacheKey, responseBody, TTL_SINGLE);
  res.set("X-Cache", "MISS");
  res.json(responseBody);
});

// ─── GET /api/components/:id/data ─────────────────────────────────────────────
// This endpoint returns the figma data for Pro components after subscription check
const getComponentData = asyncHandler(async (req, res) => {
  const component = await Component.findById(req.params.id);

  if (!component) {
    res.status(404);
    throw new Error("Component not found");
  }

  // If component is free, return the data directly
  if (component.pricingType !== "Pro") {
    return res.json({
      success: true,
      data: {
        figmaDataBase64: component.figmaDataBase64,
      },
    });
  }

  // For Pro components, check subscription
  if (!req.user) {
    return res.status(403).json({
      success: false,
      message: "PRO_SUBSCRIPTION_REQUIRED",
    });
  }

  await autoActivateNextQueued(req.user.userId);

  const user = await User.findById(req.user.userId);

  if (!user || !user.isProUser || !user.activeSubscription) {
    return res.status(403).json({
      success: false,
      message: "PRO_SUBSCRIPTION_REQUIRED",
    });
  }

  const subscription = await Subscription.findById(user.activeSubscription);

  if (!subscription || subscription.status !== "active") {
    return res.status(403).json({
      success: false,
      message: "PRO_SUBSCRIPTION_REQUIRED",
    });
  }

  // Check if subscription is still valid
  if (new Date(subscription.endDate) < new Date()) {
    subscription.status = "expired";
    await subscription.save();

    await autoActivateNextQueued(req.user.userId);

    return res.status(403).json({
      success: false,
      message: "PRO_SUBSCRIPTION_EXPIRED",
    });
  }

  // Check component limit
  if (subscription.componentCountUsed >= subscription.maxComponents) {
    return res.status(403).json({
      success: false,
      message: "COMPONENT_LIMIT_REACHED",
    });
  }

  // Increment component usage
  subscription.componentCountUsed += 1;
  await subscription.save();

  return res.json({
    success: true,
    data: {
      figmaDataBase64: component.figmaDataBase64,
      remainingComponents: subscription.maxComponents - subscription.componentCountUsed,
    },
  });
});

// ─── PATCH /api/components/:id ────────────────────────────────────────────────
// POST /api/components/:id/download
const recordComponentDownload = asyncHandler(async (req, res) => {
  const component = await Component.findByIdAndUpdate(
    req.params.id,
    { $inc: { downloadCount: 1 } },
    { new: true, select: "downloadCount" }
  ).lean();

  if (!component) {
    res.status(404);
    throw new Error("Component not found");
  }

  await Promise.all([
    cacheInvalidate(componentKey(req.params.id)),
    bumpListVersion(),
  ]);

  res.json({
    success: true,
    data: {
      componentId: req.params.id,
      downloadCount: component.downloadCount || 0,
    },
  });
});

const updateComponent = asyncHandler(async (req, res) => {
  const component = await Component.findById(req.params.id);
  if (!component) {
    res.status(404);
    throw new Error("Component not found");
  }

  if (component.createdBy.toString() !== req.user.userId) {
    res.status(403);
    throw new Error("You can only edit your own components");
  }

  const updates = {
    name: req.body.name ?? component.name,
    description: req.body.description ?? component.description,
    previewImageUrl: req.body.previewImageUrl ?? component.previewImageUrl,
    figmaDataBase64: req.body.figmaDataBase64 ?? component.figmaDataBase64,
    designType: req.body.designType ?? component.designType,
    pricingType: req.body.pricingType ?? component.pricingType,
  };

  if (req.body.tags !== undefined) {
    updates.tags = req.body.tags;
    const matchedTags = await Tag.find({ name: { $in: req.body.tags } });
    updates.tagOrder = matchedTags.length > 0 ? Math.min(...matchedTags.map(t => t.order)) : 999999;
  }

  const updated = await Component.findByIdAndUpdate(req.params.id, updates, { new: true });

  // Invalidate this component's cache + all list caches
  await Promise.all([
    cacheInvalidate(componentKey(req.params.id)),
    bumpListVersion(),
  ]);

  res.json({ success: true, data: updated });
});

// ─── DELETE /api/components/:id ───────────────────────────────────────────────
const deleteComponent = asyncHandler(async (req, res) => {
  const component = await Component.findById(req.params.id);
  if (!component) {
    res.status(404);
    throw new Error("Component not found");
  }

  const userRole = req.user.role || "user";
  if (component.createdBy.toString() !== req.user.userId && userRole !== "admin") {
    res.status(403);
    throw new Error("You can only delete your own components");
  }

  await component.deleteOne();

  // Invalidate this component's cache + all list caches
  await Promise.all([
    cacheInvalidate(componentKey(req.params.id)),
    bumpListVersion(),
  ]);

  res.json({
    success: true,
    message: "Component deleted",
  });
});

// ─── GET /api/components/top-creators ─────────────────────────────────────────
const getTopCreators = asyncHandler(async (req, res) => {
  // Use aggregation to find the top 2 creators based on component count
  const topCreators = await Component.aggregate([
    {
      $group: {
        _id: "$createdBy",
        count: { $sum: 1 },
      },
    },
    {
      $sort: { count: -1 },
    },
    {
      $limit: 2,
    },
    {
      $lookup: {
        from: "users", // The users collection name in MongoDB
        localField: "_id",
        foreignField: "_id",
        as: "user",
      },
    },
    {
      $unwind: "$user",
    },
    {
      $project: {
        _id: "$user._id",
        name: "$user.name",
        profilePicture: "$user.profilePicture",
        componentCount: "$count",
      },
    },
  ]);

  res.json({
    success: true,
    data: topCreators,
  });
});

// ─── GET /api/components/tags ─────────────────────────────────────────────────
const getApprovedTags = asyncHandler(async (req, res) => {
  const tagCount = await Tag.countDocuments();
  
  if (tagCount === 0) {
    const query = {
      $or: [
        { status: "approved" },
        { status: { $exists: false } },
        { status: null },
      ],
    };

    const tags = await Component.distinct("tags", query);

    // Format and filter tags
    const formattedTags = tags
      .map((tag) => {
        if (!tag) return "";
        const trimmed = tag.trim();
        const lower = trimmed.toLowerCase();
        if (lower === "cta") return "CTA";
        if (lower === "faq") return "FAQ";
        return trimmed
          .split(/\s+/)
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");
      })
      .filter((tag) => tag.length > 0);

    // De-duplicate using a Set
    const uniqueTags = Array.from(new Set(formattedTags));

    // Sort alphabetically (case-insensitive)
    uniqueTags.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
    
    if (uniqueTags.length > 0) {
      const tagDocs = uniqueTags.map((name, index) => ({ name, order: index + 1 }));
      await Tag.insertMany(tagDocs);
    }
  }

  const tags = await Tag.find({}).sort({ order: 1 });
  const tagNames = tags.map(t => t.name);

  res.json({
    success: true,
    data: tagNames,
  });
});

module.exports = {
  listComponents,
  listMyComponents,
  createComponent,
  getComponent,
  getComponentData,
  recordComponentDownload,
  updateComponent,
  deleteComponent,
  listFavoriteComponents,
  listFavoriteComponentIds,
  toggleFavoriteComponent,
  getTopCreators,
  updateComponentStatus,
  listComponentsAdmin,
  getApprovedTags,
};

