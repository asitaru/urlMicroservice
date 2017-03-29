const mongodb = require('mongodb').MongoClient;
const url = process.env.MONGOLAB_URI;

findUrl = async (db, query) => {
    try {
        return await db.collection('url').findOne(query, {_id: 0});
    }
    catch(error) {
        return error;
    }
}

module.exports.retrieveLink = async query => {
    let db = await mongodb.connect(url)
    try{
        return await findUrl(db, {short_url: query});
    } catch(e) {
        return new Error(e);
    } finally {
        db.close()
    }
}

module.exports.retriveInsertion = async query => {
    let db = await mongodb.connect(url)
    try {
        let returnedUrl = await findUrl(db, {original_url: query})
        //If the Url is already in db, it only returns it
        if(!Object.is(returnedUrl, null)) return returnedUrl;
        //Otherwise, inserts on the last entry and then returns it
        let lastEntry = await db.collection('url').find().sort({short_url: -1}).limit(-1).toArray();
        returnedUrl = { original_url: query, short_url: parseInt(lastEntry[0].short_url) + 1};
        await db.collection('url').insert(returnedUrl)
        delete returnedUrl._id;
        return returnedUrl;
    } catch(e) {
        return new Error(e);
    } finally {
        db.close()
    }
}
