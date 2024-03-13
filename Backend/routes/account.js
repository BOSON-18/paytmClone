const express = require('express');
const { authMiddleware } = require('../middleware');
const { Account } = require('../db');
const { default: mongoose } = require('mongoose');

const router = express.json();

//* Find a user and sent their balance 
router.get("/balance", authMiddleware, async (req, res) => {
    const account = await Account.findOne({
        userId: req.userId,
    });

    res.json({
        balance: account.balance
    })
})

//* handle secure transactions between users 
router.post("/transfer", authMiddleware, async (req, res) => {

    //? session ensure that all the code after this run together  
    const session = await mongoose.startSession();

    //? starting block
    session.startTransaction();
    const { amount, to } = req.body;

    //? Finding the sending user account and wrapping it with transaction 
    const account = await Account.findOne({ userId: req.userId }).session(session);

    if (!account || account.balance < amount) {
        await session.abortTransaction(); //? will cancel the process if no account or balance is less then sending amount 
        return res.status(400).json({
            message: "Insufficient balance"
        })
    }

    //? Finding the receiving user account and wrapping it with transaction
    const toAccount = await Account.findOne({ userId: to }).session(session);

    if (!toAccount) {
        await session.abortTransaction(); //? will cancel the process if no account 
        return res.status(400).json({
            message: "Invalid account"
        })
    }

    //? cutting from the sender and debiting in receiver within transaction
    await Account.updateOne({ userId: req.userId }, { $inc: { balance: -amount } }).session(session);
    await Account.updateOne({ userId: to }, { $inc: { balance: amount } }).session(session);

    //? Commit the transaction -> end of process
    await session.commitTransaction();

    res.json({
        message: "Transfer successful"
    })
});

module.exports = router;