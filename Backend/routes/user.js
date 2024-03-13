const express = require("express");
const zod = require('zod');
const { User, Account } = require("../db");
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require("../config");
const { authmiddleware } = require("../middleware");

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

    //? create new account for user and give them a random balance( 1 - 10000) to start with

    await Account.create({
        userId,
        balance: 1 + Math.random() * 10000
    })

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

//*handle update of user name -> they can update either of their there password , firstName or lastName

//? optional schema for choosing either one, if choose one then it should match the schema
const updateSchema = zod.object({
    password: zod.string().optional(),
    firstName: zod.string().optional(),
    lastName: zod.string().optional(),
});

router.put('/', authmiddleware, async (req, res) => {
    //? checking schema for request body
    const { success } = updateSchema.safeParse(req.body);
    if (!success) {
        res.status(411).json({
            message: "Error while updating information"
        })
    }

    //? update anything that in the request body
    await User.updateOne({ _id: req.userId }, req.body);

    res.json({
        message: "Update successfully"
    })
})

//* handle searching for other users -> will get a query parameter from the user

router.get("/bulk", async (req, res) => {

    //? getting the query given by user
    const filter = req.query.filter || "";

    //? finding other users that have the filter string in their firstName "or" lastName. users gonna contain one or more than one users
    const users = await User.find({
        $or: [{
            firstName: {
                "$regex": filter
            }
        }, {
            lastName: {
                "$regex": filter
            }
        }]
    })

    //? getting all the users from the user and sending all of their information one by id mapping
    res.json({
        user: users.map(user => ({
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            _id: user._id,
        }))
    })

})


module.exports = router; 