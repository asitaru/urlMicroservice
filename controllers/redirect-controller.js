const databaseController = require('./database-controller');

function redirectTo(res, linkObject){
    if(Object.is(linkObject, null)) {
        res.json({error: "This URL is not in DB"})
    } else if(linkObject instanceof Error){
        res.json({error: linkObject});
    } else {
        res.redirect(linkObject.original_url);
    }
}

module.exports = (req,res) => {

    if(isNaN(req.params.id)) {
        res.json({error: "This URL is not in DB"});
        return
    }

    const query = parseInt(req.params.id);

    databaseController.retrieveLink(query)
        .then( result => redirectTo(res, result))
}
