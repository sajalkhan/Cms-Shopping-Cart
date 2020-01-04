const mongoose = require('mongoose');
const dotenv = require('dotenv');
const app = require('./app');

dotenv.config({path: './config.env'}); // here will pass an object to env so it will understand where the configuration file is located

const DB = process.env.DATABASE.replace('<PASSWORD>',process.env.DATABASE_PASSWORD);

try{
    mongoose.connect(DB,{
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology:true,
        useFindAndModify:false
    })
    .then(()=> console.log('Db Connection Successful!') );
}catch(err){
    console.log(err);
}


const port = process.env.PORT || 8080;

app.listen(port, ()=>{
    console.log(`App running on port ${port}..`);
});