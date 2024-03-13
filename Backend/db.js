
const mongoose = require('mongoose');

mongoose.connect("mongodb+srv://ckbtamaldipnew:v0wZ5g8j5Ee6LyEN@cluster0.pkptg4q.mongodb.net/");

const userSchema = mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        minLength: 3,
        maxLength: 30
    },
    password: {
        type: String,
        required: true,
        minLength: 6
    },
    firstName: {
        type: String,
        required: true,
        trim: true,
        maxLength: 50
    },
    lastName: {
        type: String,
        required: true,
        trim: true,
        maxLength: 50
    }
});

//? This schema reference to user model so that balance don't get initialize for any user that is not exist in database
const accountSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId, //* Reference to User model
        ref: 'User',
        required: true
    },
    balance: {
        type: Number,
        required: true
    }
});

const Account = mongoose.model('Account', accountSchema);
const User = mongoose.model("User", userSchema);

module.exports = {
    User
}


//! In the real world, you shouldn’t store `floats` for balances in the database.
//! You usually store an integer which represents the INR value with 
//! decimal places (for eg, if someone has 33.33 rs in their account, 
//! you store 3333 in the database).


//! There is a certain precision that you need to support (which for india is
//! 2/4 decimal places) and this allows you to get rid of precision
//! errors by storing integers in your DB