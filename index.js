let mongoose = require('mongoose');
let app = require('./app');
const PORT = process.env.PORT || 3977;

mongoose.Promise = global.Promise;

mongoose.connect('mongodb://localhost:27017/barber', {useNewUrlParser: true}, (err, res)=>{
    if(err){

    }else{
        console.log('Connected to DB Server');
        app.listen(PORT, function(){
            console.log('API Listening on ' + PORT);
        });
    }
});