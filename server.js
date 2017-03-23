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
        mongodb.connect(url, (err,db) => {
            if(err) console.log(err);
            db.collection('url')
                .find({original_url: req.params[0]})
                .toArray((err,result) => {
                    if(err) throw err
                    if(result.length){
                        result[0].short_url =  "https://url-shorten-microservice.herokuapp.com/" + result[0].short_url;
                        res.send(JSON.stringify(result[0], null, " "));
                    } else {
                        let max = db.collection('url').find().sort({short_url: -1}).limit(1).pretty().short_url || 0;
                        let obj = {
                            original_url: req.params[0],
                            short_url: parseInt(max) + 1
                        };
                        db.collection('url')
                            .insert(obj, (err,data) => {
                                if(err) console.log(err);
                                res.send(JSON.stringify(obj, null, " "));
                            });
                    }
                });
            db.close();
        });
    } else {
        res.send(JSON.stringify({error: "Wrong url format, make sure you have a valid protocol and real site."}, null, " "));
    }
});

app.listen(app.get('port'), () => console.log('App is running on port', app.get('port')));
