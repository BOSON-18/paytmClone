const express = require("express");
const zod = require('zod');
const { User } = require("../db");
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require("../config");

const router = express.Router();

//* handle signup request -> schema + gateway
const signupSchema = zod.object({
    username: zod.string(),
    password: zod.string(),
    firstName: zod.string(),
    lastName: zod.string(),
})

router.post("signup", async (req, res) => {

    //? validating user input with zod
    const { success } = signupSchema.safeParse(req.body);
    if (!success) {
        return res.status(411).json({
            message: "Incorrect Inputs"
        })
    }

    //? Checking if the credentials already exist or not
    const existingUser = await User.findOne({
        username: req.body.username
    });

    if (existingUser) {
        return res.status(411).json({
            message: "Email already taken"
        })
    }

    //? creating a new user and sending a jwt token 
    const user = await User.create({
        username: req.body.username,
        password: req.body.password,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
    })

    const userId = user._id;

    const token = jwt.sign({
        userId
    }, JWT_SECRET);

    res.json({
        message: "User created successfully",
        token: token
    })
})

//* handle signin request -> schema + gateway
const signinSchema = zod.object({
    username: zod.string().email(),
    password: zod.string(),
})

router.post("/signin", async (req, res) => {

    //?validating user input with zod 
    const { success } = signinSchema.safeParse(req.body);
    if (!success) {
        return res.status(411).json({
            message: "Incorrect credentials"
        })
    }

    //?finding the user and sending a jwt token
    const user = await User.findOne({
        username: req.body.username,
        password: req.body.password
    });

    if (user) {
        const token = jwt.sign({
            userId: user._id
        }, JWT_SECRET);

        res.json({
            token: token
        })

        return;
    }

    //? Other error case handling 
    res.status(411).json({
        message: "Error while logging in"
    })

})

module.exports = router;