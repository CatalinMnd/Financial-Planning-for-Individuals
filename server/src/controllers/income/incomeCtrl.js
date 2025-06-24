const expressAsyncHandler=require("express-async-handler");
const Income = require("../../model/Income");

//create
const createIncCtrl = expressAsyncHandler(async(req,res)=>{
    const {title, amount, description, isRecurring, recurrence, recurringEndDate, currency} =req.body;
    try {
        let nextOccurrence = undefined;
        if (isRecurring && recurrence) {
            // Calculate nextOccurrence based on recurrence
            const now = new Date();
            let date = new Date(now);
            switch (recurrence.type) {
                case 'daily':
                    date.setDate(date.getDate() + (recurrence.interval || 1));
                    break;
                case 'weekly':
                    date.setDate(date.getDate() + 7 * (recurrence.interval || 1));
                    break;
                case 'monthly':
                    date.setMonth(date.getMonth() + (recurrence.interval || 1));
                    break;
                case 'yearly':
                    date.setFullYear(date.getFullYear() + (recurrence.interval || 1));
                    break;
                case 'custom':
                    date.setDate(date.getDate() + (recurrence.interval || 1));
                    break;
                default:
                    date.setMonth(date.getMonth() + 1);
            }
            nextOccurrence = date;
        }
        const income = await Income.create({
            title,
            amount,
            description,
            user: req.user._id, // Get user from auth middleware
            isRecurring: !!isRecurring,
            recurrence: isRecurring ? recurrence : undefined,
            nextOccurrence: isRecurring ? nextOccurrence : undefined,
            recurringEndDate: isRecurring ? recurringEndDate : undefined,
            currency: currency || req.user.defaultCurrency || 'USD',
        });
        res.json(income)
    } catch (error) {
        res.json(error);
    }
});

//fetch all income
const fetchAllIncCtrl = expressAsyncHandler(async(req,res)=>{
    try {
        // Get pagination parameters from query string
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        //const skip = (page - 1) * limit;

        // Get total count for pagination metadata
        const totalIncome = await Income.countDocuments({ user: req.user._id });
        const totalPages = Math.ceil(totalIncome / limit);

        // Fetch paginated income data for the authenticated user
        const income = await Income.paginate({ user: req.user._id },{
            page:page,
            limit:limit,
            sort:{createdAt:-1},
            populate:{
                path:"user",
                select:"-password"
            }
        })      

        // Return paginated response with metadata
        res.json({
            income,
            pagination: {
                currentPage: page,
                totalPages,
                totalItems: totalIncome,
                itemsPerPage: limit,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            }
        });
    } catch (error) {
        res.json(error);
    }
});

//fetch single income
const fetchIncDetailsCtrl = expressAsyncHandler(async(req,res)=>{
    const{id}=req?.params;
    try {
        const income = await Income.findOne({ _id: id, user: req.user._id });
        res.json(income);
    } catch (error) {
        res.json(error);
    }
});

//update income
const updateIncCtrl = expressAsyncHandler(async(req,res)=>{
    const{id}=req?.params;
    const{title,amount,description,currency}=req?.body;
    try {
        const income = await Income.findOneAndUpdate(
            { _id: id, user: req.user._id },
            {
                title,
                amount,
                description,
                ...(currency && { currency })
            },
            {new:true}
        );
        res.json(income);
    } catch (error) {
        res.json(error);
    }
});

//delete income
const deleteIncCtrl = expressAsyncHandler(async(req,res)=>{
    const{id}=req?.params;
    try {
        const income = await Income.findOneAndDelete({ _id: id, user: req.user._id });
        res.json(income);
    } catch (error) {
        res.json(error);
    }
});

module.exports={createIncCtrl,fetchAllIncCtrl,fetchIncDetailsCtrl,updateIncCtrl,deleteIncCtrl};