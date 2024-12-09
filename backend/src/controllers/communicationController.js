const Message = require("../models/Message");
const Representative = require("../models/Representative");

const createMessage = async (req, res) => {
  try {
    const { title, content, type, audience, status } = req.body;

    const representative = await Representative.findOne({ user: req.user._id });
    if (!representative) {
      return res.status(404).json({ message: "Representative not found" });
    }

    const message = await Message.create({
      representative: representative._id,
      title,
      content,
      type,
      audience,
      status,
    });

    res.status(201).json({ message });
  } catch (error) {
    res.status(500).json({
      message: "Error creating message",
      error: error.message,
    });
  }
};

const getMessages = async (req, res) => {
  try {
    const { status, type } = req.query;
    const representative = await Representative.findOne({ user: req.user._id });

    if (!representative) {
      return res.status(404).json({ message: "Representative not found" });
    }

    const query = { representative: representative._id };
    if (status) query.status = status;
    if (type) query.type = type;

    const messages = await Message.find(query).sort({ createdAt: -1 });

    res.json({ messages });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching messages",
      error: error.message,
    });
  }
};

const updateMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const representative = await Representative.findOne({ user: req.user._id });

    if (!representative) {
      return res.status(404).json({ message: "Representative not found" });
    }

    const message = await Message.findOneAndUpdate(
      { _id: id, representative: representative._id },
      updates,
      { new: true }
    );

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    res.json({ message });
  } catch (error) {
    res.status(500).json({
      message: "Error updating message",
      error: error.message,
    });
  }
};

module.exports = {
  createMessage,
  getMessages,
  updateMessage,
};
