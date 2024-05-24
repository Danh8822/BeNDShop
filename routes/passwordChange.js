const bcrypt = require("bcrypt");
const { User } = require("../models/user");
const Joi = require("joi");
const express = require("express");
const router = express.Router();

router.put("/:id/password", async (req, res) => {
  const schema = Joi.object({
    currentPassword: Joi.string().min(6).max(200).required(),
    newPassword: Joi.string().min(6).max(200).required(),
  });

  const { error } = schema.validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).send("User not found");

  const validPassword = await bcrypt.compare(req.body.currentPassword, user.password);
  if (!validPassword) return res.status(400).send("Current password is incorrect");

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(req.body.newPassword, salt);
  await user.save();

  res.send("Password updated successfully");
});

module.exports = router;
