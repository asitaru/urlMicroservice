const validUrl = require('valid-url');
const databaseController = require('./database-controller');

function getResponseObject(result) {
    if (result instanceof Error) return {
        error: result
    }
    result.short_url = "https://url-shorten-microservice.herokuapp.com/" + result.short_url;
    return result;
}

module.exports = (req, res) => {

    if (!validUrl.isUri(req.params[0])) {
        res.json({error: "Wrong url format, make sure you have a valid protocol and real site."});
        return
    }

    databaseController.retriveInsertion(req.params[0])
        .then(result => resjson(getResponseObject(result)))
}
