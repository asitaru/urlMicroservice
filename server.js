const express = require('express');
const validUrl = require('valid-url');
const mongodb = require('mongodb').MongoClient;
const url = process.env.MONGOLAB_URI;

let app=express();

app.set('port', (process.env.PORT || 5000));

app.get('/', (req,res) => {
    res.end('Working as intended');
});

app.listen(app.get('port'), () => console.log('App is running on port', app.get('port')));
