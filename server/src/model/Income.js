const mongoose=require("mongoose");
const mongoosePaginate=require("mongoose-paginate-v2");
//schema
const incomeSchema=mongoose.Schema({
    title:{
        required:[true,'Title is required'],
        type:String,
    },
    description:{
        required:[true,'Description is required'],
        type:String,
    },
    type:{
        type:String,
        default:'income'
    },
    amount:{
        required:[true,'Amount is required'],
        type:Number,
    },
    user:{
        type: mongoose.Schema.Types.ObjectId,//Must be MongoDB ID
        ref: "User",
        required: [true,"User ID is required"],
    },
    isRecurring: {
        type: Boolean,
        default: false
    },
    recurrence: {
        type: {
            type: String, // daily, weekly, monthly, yearly, custom
            enum: ['daily', 'weekly', 'monthly', 'yearly', 'custom'],
            default: 'monthly'
        },
        interval: {
            type: Number, // e.g., every 2 weeks
            default: 1
        }
    },
    nextOccurrence: {
        type: Date
    },
    recurringEndDate: {
        type: Date
    },
    currency: {
        type: String,
        default: 'USD',
        required: true,
    },
},{
    timestamp:true,
    toJSON:{
        virtuals:true,
    },
    toObject:{
        virtuals:true,
    }
});

incomeSchema.plugin(mongoosePaginate);

const Income = mongoose.model("Income", incomeSchema);

module.exports = Income;