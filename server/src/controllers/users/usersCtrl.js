const expressAsyncHandler = require('express-async-handler');
const generateToken = require('../../middlewares/generateToken');
const User = require("../../model/User");


//register
const registerUser=expressAsyncHandler(async(req, res)=>{
    try {
        const{email, firstname, lastname, password, defaultCurrency} = req?.body;
        
        // Validate required fields
        if (!email || !firstname || !lastname || !password) {
            res.status(400);
            throw new Error("All fields are required");
        }
        
        //check if user exists
        const userExists = await User.findOne({email});
        if(userExists) {
            res.status(400);
            throw new Error("User already exists");
        }
        
        const user = await User.create({email,firstname,lastname,password,defaultCurrency});
        res.status(201).json({
            _id: user._id,
            firstname: user.firstname,
            lastname: user.lastname,
            email: user.email,
            isAdmin: user.isAdmin,
            defaultCurrency: user.defaultCurrency,
            message: "User registered successfully"
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            message: error.message || "Registration failed",
            error: error.message
        });
    }
});

//fetch all users
const fetchUsersCtrl = expressAsyncHandler(async (req,res)=>{
    try {
        const users=await User.find({});
        res.json(users);
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch users",
            error: error.message
        });
    }
});

//login user
const loginUserCtrl = expressAsyncHandler(async (req, res)=>{
    try {
        const{email,password}=req?.body;
        
        // Validate required fields
        if (!email || !password) {
            res.status(400);
            throw new Error("Email and password are required");
        }
        
        //Find the user in db
        const userFound = await User.findOne({email});
        //Check if the user password matches
        if(userFound && (await userFound?.isPasswordMatch(password))){
            res.json({
                _id: userFound?._id,
                firstname: userFound?.firstname,
                lastname: userFound?.lastname,
                email: userFound?.email,
                isAdmin: userFound.isAdmin,
                defaultCurrency: userFound.defaultCurrency,
                token: generateToken(userFound?._id),
            });
        } else {
            res.status(401);
            throw new Error('Invalid login credentials');
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            message: error.message || "Login failed",
            error: error.message
        });
    }
});

// Update profile information
const updateProfileCtrl = expressAsyncHandler(async (req, res) => {
    try {
        const { firstname, lastname, email, defaultCurrency } = req.body;
        const userId = req.user._id;

        // Validate required fields
        if (!firstname || !lastname || !email) {
            res.status(400);
            throw new Error("All fields are required");
        }

        // Check if email is already taken by another user
        const existingUser = await User.findOne({ email, _id: { $ne: userId } });
        if (existingUser) {
            res.status(400);
            throw new Error("Email is already taken by another user");
        }

        // Prepare update object
        const updateObj = {
            firstname: firstname.trim(),
            lastname: lastname.trim(),
            email: email.toLowerCase()
        };
        if (defaultCurrency) {
            updateObj.defaultCurrency = defaultCurrency;
        }

        // Update user profile
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            updateObj,
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            res.status(404);
            throw new Error("User not found");
        }

        res.json({
            _id: updatedUser._id,
            firstname: updatedUser.firstname,
            lastname: updatedUser.lastname,
            email: updatedUser.email,
            isAdmin: updatedUser.isAdmin,
            defaultCurrency: updatedUser.defaultCurrency,
            message: "Profile updated successfully"
        });
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({
            message: error.message || "Failed to update profile",
            error: error.message
        });
    }
});

// Change password
const changePasswordCtrl = expressAsyncHandler(async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user._id;

        // Validate required fields
        if (!currentPassword || !newPassword) {
            res.status(400);
            throw new Error("Current password and new password are required");
        }

        // Validate new password length
        if (newPassword.length < 6) {
            res.status(400);
            throw new Error("New password must be at least 6 characters long");
        }

        // Find user
        const user = await User.findById(userId);
        if (!user) {
            res.status(404);
            throw new Error("User not found");
        }

        // Verify current password
        const isPasswordValid = await user.isPasswordMatch(currentPassword);
        if (!isPasswordValid) {
            res.status(401);
            throw new Error("Current password is incorrect");
        }

        // Update password
        user.password = newPassword;
        await user.save();

        res.json({
            message: "Password changed successfully"
        });
    } catch (error) {
        console.error('Password change error:', error);
        res.status(500).json({
            message: error.message || "Failed to change password",
            error: error.message
        });
    }
});

// Delete account
const deleteAccountCtrl = expressAsyncHandler(async (req, res) => {
    try {
        const userId = req.user._id;

        // Delete user
        const deletedUser = await User.findByIdAndDelete(userId);
        if (!deletedUser) {
            res.status(404);
            throw new Error("User not found");
        }

        res.json({
            message: "Account deleted successfully"
        });
    } catch (error) {
        console.error('Account deletion error:', error);
        res.status(500).json({
            message: error.message || "Failed to delete account",
            error: error.message
        });
    }
});

module.exports={
    registerUser, 
    fetchUsersCtrl, 
    loginUserCtrl,
    updateProfileCtrl,
    changePasswordCtrl,
    deleteAccountCtrl
};