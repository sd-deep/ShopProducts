const mongodb = require("mongodb");
const MongoClient = mongodb.MongoClient;

let _db;

const mongoConnect = (callBack) =>{
    MongoClient.connect("mongodb+srv://deep:xOe6p6SKJVHDY5Tx@cluster0-exmnw.mongodb.net/shop?retryWrites=true",{ useNewUrlParser: true })
  .then(client =>{
      console.log('Connected!');
      _db = client.db();
      callBack( )
      
  })
  .catch(err => {
    console.log(err);
    throw err;
    
  });
}

const getDb = () => {
    if(_db){
        return _db;
    }
    throw 'No database found'
}
exports.mongoConnect = mongoConnect;
exports.getDb = getDb;
