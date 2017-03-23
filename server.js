const express = require('express');
const validUrl = require('valid-url');
const mongodb = require('mongodb').MongoClient;
const url = process.env.MONGOLAB_URI;

let app=express();

app.set('port', (process.env.PORT || 5000));

app.get('/:id', (req,res) => {
    if(isNaN(req.params.id)) {
        res.send(JSON.stringify({error: "This URL is not in DB"}, null, " "));
    } else {
        mongodb.connect(url, (err,db) => {
            if(err) {
                res.send(JSON.stringify({error: "Could not connect to DB, try again later!"}, null, " "));
            } else {
                res.send("Connection established to", url);
            }
            db.close((err) => {
                if(err) console.log(err);
            });
        });
    }
});

app.get('/new/*', (req,res) => {
    if (validUrl.isUri(req.params[0])){
        let output = {
            original_url: req.params[0],
            short_url: "https://url-shorten-microservice.herokuapp.com/"
        }
        res.send(JSON.stringify(output, null, " "));
    } else {
        res.send(JSON.stringify({error: "Wrong url format, make sure you have a valid protocol and real site."}, null, " "));
    }
});

app.listen(app.get('port'), () => console.log('App is running on port', app.get('port')));
