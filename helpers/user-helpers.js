var bcrypt = require('bcrypt')
var db = require('../config/connection')
var collection = require('../config/collection')
const { ObjectId, Db } = require('mongodb')
const { CART_COLLECION } = require('../config/collection')
const cookieParser = require('cookie-parser')
const { reject } = require('promise')
const { response } = require('express')
var objectId = require('mongodb').ObjectID
module.exports = {
    doSignup: (userData) => {
        return new Promise(async (resolve, reject) => {
            userData.Password = await bcrypt.hash(userData.Password, 10)
            db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((data) => {
                resolve(data.insertedId)
            })
        })


    },
    doLogin: (userData) => {
        return new Promise(async function (resolve, reject) {
            let loginStatus = false
            let response = {}
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ Email: userData.Email })
            if (user) {
                bcrypt.compare(userData.Password, user.Password).then((status) => {
                    if (status) {
                        console.log("login success");
                        response.user = user
                        response.status = true
                        resolve(response)
                    }
                    else {
                        console.log('login failed');
                        resolve({ status: false })
                    }
                })

            }
            else {
                console.log('login failed')
                resolve({ status: false })
            }
        })

    },





    addtoCart: (proId, userId) => {
        let proObj = {
            item: ObjectId(proId),
            quantity: 1

        }
        return new Promise(async (resolve, reject) => {
            let userCart = await db.get().collection(collection.CART_COLLECION).findOne({ user: ObjectId(userId) })
            if (userCart) {
                let proExist = userCart.products.findIndex(product => product.item == proId)
                console.log(proExist)

                if (proExist != -1) {
                    db.get().collection(collection.CART_COLLECION).updateOne({ user: ObjectId(userId), 'products.item': ObjectId(proId) }, {
                        $inc: { 'products.$.quantity': 1 }
                    })
                }
                else {

                    db.get().collection(collection.CART_COLLECION).
                        updateOne({ user: ObjectId(userId) },
                            {


                                $push: { products: proObj }


                            }).then((response) => {
                                resolve()
                            })
                }

            } else {

                let cartObj = {
                    user: ObjectId(userId),
                    products: [proObj]
                }
                db.get().collection(collection.CART_COLLECION).insertOne(cartObj).then((response) => {
                    resolve()
                })
            }

        })
    },












    getcartProducts: (userId) => {

        return new Promise(async (resolve, reject) => {
            let cartItems = await db.get().collection(collection.CART_COLLECION).aggregate([
                {
                    $match: { user: ObjectId(userId) }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
                    }
                }




            ]).toArray()

            console.log(cartItems)
            resolve(cartItems)
        })
    },
    getcartCount: (userId) => {
        return new Promise(async (resolve, reject) => {
            let count = 0
            let cart = await db.get().collection(collection.CART_COLLECION).findOne({ user: ObjectId(userId) })
            if (cart) {
                count = cart.products.length
            }
            resolve(count)
        })
    },





      changeProductQuantity: (details)=> {
        details.quantity = parseInt(details.quantity)
        details.count = parseInt(details.count)



        return new Promise( (resolve, reject) => {
            if ( details.quantity==1 && details.count==-1) {

                db.get().collection(collection.CART_COLLECION).updateOne({ _id: ObjectId(details.cart) },
                 {
                    $pull: { products: { item: ObjectId(details.product) } }

                }
                ).then((response) => {
                    resolve({removeproduct:true})
                })



            }
            else{
                db.get().collection(collection.CART_COLLECION).
                updateOne({_id:ObjectId(details.cart),'products.item':ObjectId(details.product)},{
                    $inc:{'products.$.quantity':details.count}

                }).then(function(response){
                    resolve({response:true})
                })

            }






        })

    },
    removeProduct:(details)=>{
        details.cart=details.cart
        
   
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.CART_COLLECION).updateOne({_id:ObjectId(details.cart)},{
                $pull:{products:{item:ObjectId(details.product)}}
            }).then((response)=>{
                resolve({removeproduct:true})
             
            })
        })
    },
    getTotalAmount:(userId)=>{

        return new Promise(async (resolve, reject) => {
            let total = await db.get().collection(collection.CART_COLLECION).aggregate([
                {
                    $match: { user: ObjectId(userId) }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
                    }
                },
                {
                    $group:{
                        _id:null,
                        total:{$sum:{$multiply:[{$toInt:'$quantity'},{$toInt:'$product.Price'}]}}
                    }
                }




            ]).toArray()

            console.log(total[0].total)
            resolve(total[0].total)
        })
    },

    placeOrder:(order,products,total,user)=>{
     return new Promise((resolve,reject)=>{

        let date=new Date()
        
       console.log('this is the order',order)
     

        
       let status=order['payment-method']==='COD'?'placed':'pending'
        let orderObj={

            deliveryDetails:{
                date:date,
              mobile:order.mobile,
              address:order.address,
              pincode:order.pincode
            },
            userId:ObjectId(user),
            paymentMethod:order['payment-method'],
            products:products,
            totalAmount:total,
            status:status

        }
        db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObj).then((response)=>{
            
           
            db.get().collection(collection.CART_COLLECION).deleteOne({user:ObjectId(user)})
            resolve()
            
        })
        
     })

    },


    getCartProductList:(userId)=>{
     
        return new Promise( async(resolve,reject)=>{
            let cart= await db.get().collection(collection.CART_COLLECION).findOne({user:ObjectId(userId)})
          
            resolve(cart.products)
        })

    },

    getOrderViewProducts:(userId)=>{
        return new Promise( async(resolve,reject)=>{
            let orderDetails=await db.get().collection(collection.ORDER_COLLECTION)
            .find({userId:ObjectId(userId)}).toArray()
            resolve(orderDetails)
            
        })
    },



    getOrderProducts:(orderId)=>{
        return new Promise(async (resolve, reject) => {
            let cartItems = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: { userId: ObjectId(orderId) }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
                    }
                }




            ]).toArray()

            console.log(cartItems)
            resolve(cartItems)
        })
        
    }






    


    

    


  





    
    
    




}
