var MongoClient=require('mongodb').MongoClient
var state={db:null}
module.exports.connect=function(done){
    const url='mongodb://127.0.0.1:27017'
    const dbname='shopping'
    MongoClient.connect(url,function(err,data){
        if(err) done(err)
            state.db=data.db(dbname)
            
           done()
        
       
   
    })
}
module.exports.get=function(){
    return state.db
}
