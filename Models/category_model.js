const mongooose = require('mongoose');

//category schema
const categorySchema = mongooose.Schema({
    title:{
        type:String,
        require:true
    },
    slug:{
        type:String
    }
});

const Category = module.exports = mongooose.model('Category',categorySchema);
