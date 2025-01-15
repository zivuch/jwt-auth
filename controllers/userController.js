const userModel = require("../models/userModel.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports = {
  registerUser: async (req, res) => {
    const { password, email } = req.body;

    try {
      const user = await userModel.createUser(password, email);
      res.status(201).json({
        message: "User registered successfully",
        user,
      });
    } catch (error) {
      console.log(error);
      if (error.code === "23505") {
        res.status(400).json({
          message: "Email already exists",
        });
        return;
      } else {
        res.status(500).json({
          message: "Internal server error",
        });
      }
    }
  },
  loginUser: async (req, res) => {
    const { password, email } = req.body;
    // console.log(password,email);

    try {
      const user = await userModel.getUserByEmail(email);
      //   console.log(user);
      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      const passwordMatch = await bcrypt.compare(password + "", user.password);
      //   console.log(passwordMatch);

      if (!passwordMatch) {
        res.status(404).json({ message: "Wrong password" });
        return;
      }
      const { ACCESS_TOKEN_SECRET } = process.env;
      /** generate a token */
      const accessToken = jwt.sign(
        { userid: user.id, email: user.email },
        ACCESS_TOKEN_SECRET,
        { expiresIn: "60s" }
      );

      /** set the token in httpOnly cookie */
      res.cookie("token", accessToken, {
        maxAge: 60 * 1000,
        httpOnly: true,
      });

      /** response to client */
      res.status(200).json({
        message: "Login Successfully",
        user: { userid: user.id, email: user.email },
        token: accessToken,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Internal server error",
      });
    }
  },
  getUsers: async (req, res) => {
    try {
      const users = await userModel.getUsers();
      res.json(users);
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Internal server error",
      });
    }
  },
  logoutUser: (req, res) => {
    res.clearCookie("token");
    req.cookies.token = null;
    delete req.cookies.token;
    /** set nul in db column */
    res.sendStatus(200);
  },
  verifyAuth: (req, res) => {
    const { userid, email } = req.user;
    const { ACCESS_TOKEN_SECRET } = process.env;
    const newAccessToken = jwt.sign({ userid, email }, ACCESS_TOKEN_SECRET, {
      expiresIn: "60s",
    });

    res.cookie("token", newAccessToken, {
      httpOnly: true,
      maxAge: 60 * 1000,
    });

    res.json({
      message: "verified",
      user: { userid, email },
      token: newAccessToken,
    });
    // res.sendStatus(200);
  },
};
