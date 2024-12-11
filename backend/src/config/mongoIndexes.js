const createIndexes = async (mongoose) => {
  // Posts indexes - removing duplicate text index since it's defined in the model
  await mongoose
    .model("Post")
    .collection.createIndexes([
      { key: { author: 1 } },
      { key: { createdAt: -1 } },
      { key: { category: 1 } },
    ]);

  // Messages indexes
  await mongoose
    .model("Message")
    .collection.createIndexes([
      { key: { sender: 1, recipient: 1 } },
      { key: { createdAt: -1 } },
    ]);
};

module.exports = { createIndexes };
