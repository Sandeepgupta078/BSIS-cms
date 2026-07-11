// Reusable pagination + filtering helper for list endpoints
const paginate = async (Model, query = {}, options = {}) => {
  const page = Math.max(parseInt(options.page) || 1, 1);
  const limit = Math.min(Math.max(parseInt(options.limit) || 20, 1), 100);
  const skip = (page - 1) * limit;
  const sort = options.sort || "-createdAt";

  const [items, total] = await Promise.all([
    Model.find(query).sort(sort).skip(skip).limit(limit),
    Model.countDocuments(query),
  ]);

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    },
  };
};

export { paginate };
