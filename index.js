const cluster = require('cluster');
const mongoose = require('mongoose');
const app = require('./app');
const PORT = process.env.PORT || 3977;
const ENV = require('dotenv').config();

mongoose.Promise = global.Promise;

if (cluster.isMaster) {
    // Count the machine's CPUs
    var cpuCount = require('os').cpus().length;

    // Create a worker for each CPU
    for (var i = 0; i < cpuCount; i += 1) {
        cluster.fork();
    }

    // Listen for dying workers
    cluster.on('exit', function (worker) {
        // Replace the dead worker,
        // we're not sentimental
        console.log('Worker %d died :(', worker.id);
        cluster.fork();
    });
    
} else {
    mongoose.connect('mongodb://localhost:27017/dali', {useNewUrlParser: true}, (err)=>{
        if(err){
            console.log('Server error.');
        }else{
            console.log('Connected to DB Server');
            app.listen(PORT, () => console.log('API Listening on ' + PORT));
        }
    });
}