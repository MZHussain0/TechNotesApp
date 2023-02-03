const User = require("../models/User");
const Note = require("../models/Note");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");

//@desc Get all users
//@route GET /user
//@access private

const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select("-password").lean();

  if (!users?.length) {
    return res.status(400).json({ message: "No users found" });
  }
  res.json(users);
});

//@desc Create a new user
//@route POST /user
//@access private

const createNewUser = asyncHandler(async (req, res) => {
  const { username, password, roles } = req.body;

  //confirm data
  if (!username || !password || !Array.isArray(roles) || !roles.length) {
    return res.status(400).json({ message: "All fields are required" });
  }

  //check for duplicates
  const duplicate = await User.findOne({ username }).lean().exec();

  if (duplicate) {
    return res
      .send(409)
      .json({ message: "Username already taken. choose a different one" });
  }

  // Hash the password
  const hashedPwd = await bcrypt.hash(password, 10); // salt rounds
  const userObject = { username, password: hashedPwd, roles };

  // create and store new user
  const user = User.create(userObject);

  if (user) {
    res.status(201).json({ message: "New user is created" });
  } else {
    res.status(400).json({ message: "Invalid user data recieved" });
  }
});

//@desc Update a user
//@route PATCH /user
//@access private

const updateUser = asyncHandler(async (req, res) => {
  const { id, username, roles, active, password } = req.body;

  //confirm data
  if (
    !id ||
    !username ||
    !password ||
    !Array.isArray(roles) ||
    !roles.length ||
    typeof active !== "boolean"
  ) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const user = await User.findById(id).exec();
  if (!user) {
    return res.status(400).json({ message: "user not found." });
  }

  // duplicate
  const duplicate = await User.findOne({ username }).lean().exec();

  //Allow update to original user
  if (duplicate && duplicate?._id.toString() !== id) {
    return res.status(409).json({ message: "Duplicate username" });
  }

  user.username = username;
  user.roles = roles;
  user.active = active;

  if (password) {
    user.password = await bcrypt.hash(password, 10);
  }

  const updatedUser = await user.save();
  res.json({ message: `${updateUser.username} updated` });
});

//@desc delete a user
//@route DELETE /user
//@access private

const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.body;
  if (!id) {
    return res.json(400).json({ message: "user ID is required " });
  }

  // dont delete users that has notes assigned
  const notes = await Note.findOne({ user: id }).lean().exec();
  if (notes) {
    return res.status(400).json({ message: "user has notes assigned to them" });
  }

  const user = await User.findById(id).exec();
  if (!user) {
    return res.status(400).json({ message: "user not found" });
  }

  const result = await User.deleteOne(user);
  const reply = `username ${result.username} with id ${result._id} is deleted`;
  res.json(reply);
});

module.exports = {
  getAllUsers,
  createNewUser,
  updateUser,
  deleteUser,
};
