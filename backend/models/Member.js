const mongoose = require("mongoose");

const memberSchema = new mongoose.Schema({
  name: { type: String, required: [true, "Member name is required"] },
  email: { type: String, required: [true, "Email is required"], unique: true },
  phone: { type: String },
  department: { type: String, required: [true, "Department is required"] }
});

module.exports = mongoose.model("Member", memberSchema);
