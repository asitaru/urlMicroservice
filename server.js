const express = require('express');

let app=express();

const redirectController = require('./controllers/redirect-controller');
const insertionController = require('./controllers/insertion-controller')

app.set('port', (process.env.PORT || 5000));

app.use('/node_modules', express.static(__dirname + "/node_modules"));
app.use('/', express.static(__dirname));

//Landing Page
app.get('/', (req,res) => {
    res.sendFile('index.html');
});

//Redirect route
app.get('/:id', redirectController);

//Link insertion route
app.get('/new/*', insertionController);

app.listen(app.get('port'), () => console.log('App is running on port', app.get('port')));
