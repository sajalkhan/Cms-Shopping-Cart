const mongooose = require('mongoose');

//user schema
const userSchema = mongooose.Schema({
    name:{
        type:String,
        require:true
    },
    email:{
        type:String
    },
    username:{
        type:String,
        require:true
    },
    password:{
        type:String,
        require:true
    },
    admin:{
        type:Number
    }
});

const user = module.exports = mongooose.model('Users',userSchema);
