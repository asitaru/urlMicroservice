const databaseController = require('./database-controller');

function redirectTo(res, linkObject){
    if(Object.is(linkObject, null)) {
        res.send(JSON.stringify({error: "This URL is not in DB"}, null, " "));
    } else if(linkObject instanceof Error){
        res.send(JSON.stringify({error: linkObject}, null, " "));
    } else {
        res.redirect(linkObject.original_url);
    }
}

module.exports = (req,res) => {

    if(isNaN(req.params.id)) {
        res.send(JSON.stringify({error: "This URL is not in DB"}, null, " "));
        return
    }

    const query = parseInt(req.params.id);

    databaseController.retrieveLink(query)
        .then( result => redirectTo(res, result))
}
