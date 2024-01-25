const { Router } = require("express");
const { User } = require("../db")
const zod = require("zod");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config");

//zod validation 

const signupBody = zod.object({
    username: zod.string().email(),
    firstName: zod.string(),
    lastName: zod.string(),
    password: zod.string(),
});

const signinBody = zod.object({
    username: zod.string().email(),
    password: zod.string()
});

const router = Router();

//* routes

//? signup route

router.post("/signup", async (req, res) => {
    const { success } = signupBody.safeParse(req.body);

    //validation checkpoint
    if (!success) {
        return res.status(411).json({
            message: "Email already taken / Incorrect inputs"
        })
    }

    const existingUser = await User.findOne({
        username: req.body.username
    })

    //Database checkpoint
    if (existingUser) {
        return res.status(411).json({
            message: "Email already taken / Incorrect inputs"
        })
    }

    //Data creation
    const user = await User.create({
        username: req.body.username,
        password: req.body.password,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
    })

    const userId = user._id;

    //Token createion
    const token = jwt.sign({
        userId
    }, JWT_SECRET);

    //response of all
    res.json({
        message: "User created successfully",
        token: token
    })

})

//? signin route
router.post("/signin", async (req, res) => {
    const { success } = signinBody.safeParse(req.body);

    //validatoin checkpoint
    if (!success) {
        return res.status(411).json({
            message: "incorrect Inputs"
        })
    }

    //user checkpoint
    const user = await User.findOne({
        username: req.body.username,
        password: req.body.password
    });

    //token creation
    if (user) {
        const token = jwt.sign({
            userId: user._id
        }, JWT_SECRET);

        res.json({
            token: token
        })
        return;
    }

    res.status(411).json({
        message: "Error while logging in"
    })

})


module.exports = router;