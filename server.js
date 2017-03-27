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

let handleError = error => {
    res.send(JSON.stringify({error: error}));
}

app.get('/:id', (req,res) => {
    if(isNaN(req.params.id)) {
        res.send(JSON.stringify({error: "This URL is not in DB"}, null, " "));
    } else {
        // mongodb.connect(url, (err,db) => {
        //     if(err) handleError();
        //     else {
        //         db.collection('url')
        //             .find({
        //                 short_url: parseInt(req.params.id)
        //             })
        //             .toArray((err,result) => {
        //                 if(err) {
        //                     handleError()
        //                     db.close();
        //                 } else if (result.length) {
        //                     console.log(result);
        //                     res.redirect(result[0].original_url);
        //                     db.close();
        //                 }else {
        //                     res.end(JSON.stringify({error: "This URL is not in the DB"}));
        //                 }
        //             })
        //     }
        // });
        let query = parseInt(req.params.id);
        mongodb.connect(url)
            .then( db => db.collection('url').find({short_url: query}).toArray())
            .then( result => result[0].original_url)
            .then(res.redirect())
            .catch(console.log)
    }
});

app.get('/new/*', (req, res) => {
    if (validUrl.isUri(req.params[0])) {
        mongodb.connect(url, (err, db) => {
            if (err) handleError();
            db.collection('url')
                .find({
                    original_url: req.params[0]
                })
                .toArray((err, result) => {
                    if (err) handleError()
                    else if (result.length) {
                        result[0].short_url = "https://url-shorten-microservice.herokuapp.com/" +
                            result[0].short_url;
                        res.send(JSON.stringify({
                            original_url: result[0].original_url,
                            short_url: result[0].short_url
                        }, null, " "));
                        db.close();
                    } else {
                        var max;
                        db.collection('url')
                            .find()
                            .sort({
                                short_url: -1
                            })
                            .limit(1)
                            .toArray((err, result) => {
                                if (err) handleError()
                                else{
                                    console.log(result[0].short_url)
                                    max = parseInt(result[0].short_url);
                                    var obj = {
                                        original_url: req.params[0],
                                        short_url: max + 1
                                    }
                                };
                                db.collection('url')
                                    .insert(obj, (err, data) => {
                                        if (err) handleError()
                                        res.send(JSON.stringify({
                                            original_url: obj.original_url,
                                            short_url: "https://url-shorten-microservice.herokuapp.com/" + obj.short_url
                                        }, null, " "));
                                        db.close();
                                    });
                            })

                    }
                });
        });
    } else {
        res.send(JSON.stringify({
            error: "Wrong url format, make sure you have a valid protocol and real site."
        }, null, " "));
    }
});

app.listen(app.get('port'), () => console.log('App is running on port', app.get('port')));
