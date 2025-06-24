const mongoose=require("mongoose");
const bcrypt =require("bcryptjs");
//schema
const userSchema=mongoose.Schema({
    firstname:{
        required:[true,'First name is required'],
        type:String,
    },
    lastname:{
        required:[true,'Last name is required'],
        type:String,
    },
    email:{
        required:[true,'Email is required'],
        type:String,
        unique: true,
        lowercase: true,
        trim: true,
    },
    password:{
        required:[true,'Password is required'],
        type:String,
    },
    isAdmin:{
        type:Boolean,
        default:false,
    },
    settings: {
        emailNotifications: {
            type: Boolean,
            default: true
        },
        monthlyReports: {
            type: Boolean,
            default: true
        },
        securityAlerts: {
            type: Boolean,
            default: true
        }
    },
    defaultCurrency: {
        type: String,
        default: 'USD',
        required: true,
    }
},{
    timestamps:true,
});

//Hash password

userSchema.pre("save", async function(next){
if(!this.isModified("password")){
    next();
}
    const salt = await bcrypt.genSalt(10);
    this.password=await bcrypt.hash(this.password, salt);
    next();
});

//Verify password
userSchema.methods.isPasswordMatch = async function name(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

//compile schema into model
const User = mongoose.model('User',userSchema);
module.exports=User;
