
var db=require('../config/connection')
var collection=require('../config/collection')
const { ObjectId } = require('mongodb')
var objectId =require('mongodb').ObjectID

module.exports={


    addProducts:(product,callback)=>{
        console.log(product)
        db.get().collection('product').insertOne(product).then((data)=>{
            console.log(data)
callback(data.insertedId)
        })
    },
    getAllproducts:()=>{
        return new Promise(async(resolve,reject)=>{
            let products=await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
          
            resolve(products)
        })
    },
    deleteProduct:(proId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).remove({_id:ObjectId(proId)}).then((response)=>{
                resolve(response)
            })

        })

    }
    ,
    getproductDetails:(proId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id:ObjectId(proId)}).then((product)=>{
                resolve(product)
         
            })
            
        })
    },
    updateProduct:(proId,proDetails)=>{
        
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:ObjectId(proId)},{$set:{
                Name:proDetails.Name,
                Category:proDetails.Category,
                Prise:proDetails.Prise,
                Description:proDetails.Description



            }}).then(()=>{
                resolve()
            
            })
        })
    }
    
}