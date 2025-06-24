const expressAsyncHandler=require("express-async-handler");
const Expense = require("../../model/Expense");

//create
const createExpCtrl = expressAsyncHandler(async(req,res)=>{
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
        const expense = await Expense.create({
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
        res.json(expense)
    } catch (error) {
        res.json(error);
    }
});

//fetch all expense
const fetchAllExpCtrl = expressAsyncHandler(async(req,res)=>{
    try {
        // Get pagination parameters from query string
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        //const skip = (page - 1) * limit;

        // Get total count for pagination metadata
        const totalExpense = await Expense.countDocuments({ user: req.user._id });
        const totalPages = Math.ceil(totalExpense / limit);

        // Fetch paginated expense data for the authenticated user
        const expense = await Expense.paginate({ user: req.user._id },{
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
            expense,
            pagination: {
                currentPage: page,
                totalPages,
                totalItems: totalExpense,
                itemsPerPage: limit,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            }
        });
    } catch (error) {
        res.json(error);
    }
});

//fetch single expense
const fetchExpDetailsCtrl = expressAsyncHandler(async(req,res)=>{   
    const{id}=req?.params;
    try {
        const expense = await Expense.findOne({ _id: id, user: req.user._id });
        res.json(expense);
    } catch (error) {
        res.json(error);
    }
});

//update expense
const updateExpCtrl = expressAsyncHandler(async(req,res)=>{
    const{id}=req?.params;
    const{title,amount,description,currency}=req?.body;
    try {
        const expense = await Expense.findOneAndUpdate(
            { _id: id, user: req.user._id },
            {
                title,
                amount,
                description,
                ...(currency && { currency })
            },
            {new:true}
        );
        res.json(expense);
    } catch (error) {
        res.json(error);
    }
});

//delete expense
const deleteExpCtrl = expressAsyncHandler(async(req,res)=>{
    const{id}=req?.params;
    try {
        const expense = await Expense.findOneAndDelete({ _id: id, user: req.user._id });
        res.json(expense);
    } catch (error) {
        res.json(error);
    }
});

module.exports={createExpCtrl,fetchAllExpCtrl,fetchExpDetailsCtrl,updateExpCtrl,deleteExpCtrl};