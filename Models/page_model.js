const mongooose = require('mongoose');

//page schema
const pageSchema = mongooose.Schema({
    title:{
        type:String,
        require:true
    },
    slug:{
        type:String
    },
    content:{
        type:String,
        require:true
    },
    sorting:{
        type:Number
    }
});

const page = module.exports = mongooose.model('Pages',pageSchema);
