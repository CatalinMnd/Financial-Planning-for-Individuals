const express = require('express');
const { 
    registerUser,
    fetchUsersCtrl,
    loginUserCtrl,
    updateProfileCtrl,
    changePasswordCtrl,
    deleteAccountCtrl
} = require('../../controllers/users/usersCtrl');
const authMiddleware = require('../../middlewares/authMiddleware');

const userRoute = express.Router();

// Public routes
userRoute.post('/register', registerUser);
userRoute.post('/login', loginUserCtrl);

// Protected routes (require authentication)
userRoute.get('/', authMiddleware, fetchUsersCtrl);
userRoute.put('/profile', authMiddleware, updateProfileCtrl);
userRoute.put('/password', authMiddleware, changePasswordCtrl);
userRoute.delete('/account', authMiddleware, deleteAccountCtrl);

module.exports = userRoute;