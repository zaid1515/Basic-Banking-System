
const express = require("express");
const app=express();
const mongoose = require("mongoose");
const dotenv=require('dotenv').config();
const ejs = require("ejs");
const bodyParser = require("body-parser");
const _ = require("lodash");
const database_conn=require('./db.js')
const {User,Transaction}=require('./schema.js')
const userData=require('./data.js')
const getDate=require('./datefunc.js')

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

database_conn();

User.find()
  .then((foundItems) => {
    if (foundItems.length == 0) {
      User.insertMany(userData)
        .then(() => console.log("Data inserted in Database"))
        .catch((err) => console.error(err));
    }
  })
  .catch((err) => console.error(err));

let result = false,isavailable = false,lessamount= false;

app.get("/", function (req, res) {
  res.render("home");
});

app.get("/customerlist", function (req, res) {
  User.find()
    .then((foundUsers) => {
      if (result === true) {
        result = false;
        res.render("customerlist", {
          customers: foundUsers,
          i: 1,
          message: "Welcome to VizBank",
        });
      }
      else if (isavailable === true) {
        isavailable = false;
        res.render("customerlist", {
          customers: foundUsers,
          i: 1,
          message: "User already exists!",
        });
      } else if (lessamount=== true) {
        lessamount= false;
        res.render("customerlist", {
          customers: foundUsers,
          i: 1,
          message: "Not present required money",
        });
      } else {
        res.render("customerlist", {
          customers: foundUsers,
          i: 1,
          message: null,
        });
      }
    })
    .catch((err) => console.error(err));
});


app.get("/transaction", function (req, res) {
  Transaction.find()
    .then((foundTransaction) => {
      res.render("transaction", { transactions: foundTransaction.reverse(), i: 1 });
    })
    .catch((err) => console.error(err));
});


app.get("/about", function (req, res) {
  res.render("about");
});


app.get("/payment", function (req, res) {
  User.find()
  .then((foundUsers) => {
    if (result === true) {
      result = false;
      res.render("payment", {
        customers: foundUsers,
        i: 1,
        message: "Welcome to SwissBank",
      });
    }
     else if (isavailable === true) {
      isavailable = false;
      res.render("payment", {
        customers: foundUsers,
        i: 1,
        message: "User already exist!",
      });
    } else if (lessamount=== true) {
      lessamount= false;
      res.render("payment", {
        customers: foundUsers,
        i: 1,
        message: "Not present required money",
      });
    } else {
      res.render("payment", {
        customers: foundUsers,
        i: 1,
        message: null,
      });
    }
  })
  .catch((err) => console.error(err));
});


app.get("/failed", function (req, res) {
  const message = req.query.message || "Payment Failed";
  res.render("failed", { message: message });
});

app.get("/successful", function (req, res) {
  const message = req.query.message || "Payment Successful";
  res.render("successful", { message: message });
});


app.post("/customerlist", async function (req, res) {
  try {
    const amount = parseInt(req.body.amount);
    const foundSender = await User.findOne({ name: req.body.sender });
    if (!foundSender || foundSender.balance <= amount) {
      const message = "Insufficient balance ";
      res.redirect(`/failed?message=${message}`);
      return;
    }

    const foundReceiver = await User.findOne({ name: req.body.receiver });
    if (!foundReceiver) {
      const message = "Invalid Receiver Name";
      res.redirect(`/failed?message=${message}`);
      return;
    }

    const transaction = new Transaction({
      sender: req.body.sender,
      receiver: req.body.receiver,
      amount: amount,
      date: getDate(),
    });
    await transaction.save();
    console.log("Transaction Successful!");

    const senderBalance = foundSender.balance - amount;
    await User.updateOne(
      { name: req.body.sender },
      { $set: { balance: senderBalance } }
    );

    const receiverBalance = foundReceiver.balance + amount;
    await User.updateOne(
      { name: req.body.receiver },
      { $set: { balance: receiverBalance } }
    );
    const sName=req.body.sender;
    const rName=req.body.receiver;
    const amt=req.body.amount
    const message =`${sName} has successfully transfered Rs.${amt} to ${rName}`;
    res.redirect(`/successful?message=${message}`);
  } catch (err) {
    console.error(err);
    const message = "An error occurred";
    res.redirect(`/failed?message=${message}`);
  }
});

app.listen(3000 || process.env.PORT, function () {
  console.log("Server started at port:3000");
});