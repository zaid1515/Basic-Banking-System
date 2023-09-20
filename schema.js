const mongoose=require('mongoose')

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    balance: Number,
  });
const User = mongoose.model("User", userSchema);


const transactionSchema = new mongoose.Schema({
    sender: String,
    receiver: String,
    amount: Number,
    date: String,
  });
  
  const Transaction = mongoose.model("Transaction", transactionSchema);

module.exports={User,Transaction};