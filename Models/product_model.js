const mongooose = require('mongoose');

//product schema
const productSchema = mongooose.Schema({
    title:{
        type:String,
        require:true
    },
    slug:{
        type:String
    },
    description:{
        type:String,
        require:true
    },
    category:{
        type: String,
        require:true
    },
    price:{
        type: Number,
        require: true
    },
    images:{
        type: String
    }
});

const product = module.exports = mongooose.model('Product',productSchema);
