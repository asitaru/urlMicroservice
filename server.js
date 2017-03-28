const express = require('express');
const validUrl = require('valid-url');
const mongodb = require('mongodb').MongoClient;
const url = process.env.MONGOLAB_URI;

let app=express();

app.set('port', (process.env.PORT || 5000));

app.use('/node_modules', express.static(__dirname + "/node_modules"));
app.use('/', express.static(__dirname));

app.get('/', (req,res) => {
    res.sendFile('index.html');
});

//Finds the URL in the database, if nothing found sends an error object to the response
app.get('/:id', (req,res) => {
    if(isNaN(req.params.id)) {
        res.send(JSON.stringify({error: "This URL is not in DB"}, null, " "));
    } else {
        var query = parseInt(req.params.id);
        mongodb.connect(url)
            .then( db => db.collection('url').find({short_url: query}).toArray())
            .then( result => {
                if(result.length){
                    res.redirect(result[0].original_url)
                } else throw "This URL is not in the database";
            })
            .catch(error => res.end(JSON.stringify({error: error})))
    }
});

function getResponseObject(result) {
    if (Array.isArray(result)) {
        return {
            original_url: result[0].original_url,
            short_url: "https://url-shorten-microservice.herokuapp.com/" + result[0].short_url
        }
    } else {
        return {
            original_url: result.original_url,
            short_url: "https://url-shorten-microservice.herokuapp.com/" + result.short_url
        }
    }
}

app.get('/new/*', (req, res) => {
    if (validUrl.isUri(req.params[0])) {
        mongodb.connect(url)
            .then(db => {
                //Checks if the URL is already in the database
                db.collection('url').find({original_url: req.params[0]}).toArray()
                    .then( result => {
                        if(result.length) {
                            res.send(JSON.stringify(getResponseObject(result), null, " "));
                        } else {
                            //If it's not, the URL will get inserted on the last position
                            db.collection('url').find().sort({short_url: -1}).limit(1).toArray()
                                .then( result => parseInt(result[0].short_url))
                                .then( maxValue => resultObject = {original_url: req.params[0], short_url: maxValue + 1})
                                .then( resultObject => {
                                            db.collection('url').insert(resultObject)
                                                .catch(error => res.send(JSON.stringify({error: error})))
                                            return resultObject
                                })
                                .then(resultObject => {
                                    res.send(JSON.stringify(getResponseObject(resultObject), null, " "));
                                })
                        }
                    })
            })
            .catch(error => res.end(JSON.stringify({error: error})))
    } else {
        res.send(JSON.stringify({
            error: "Wrong url format, make sure you have a valid protocol and real site."
        }, null, " "));
    }
});

app.listen(app.get('port'), () => console.log('App is running on port', app.get('port')));
