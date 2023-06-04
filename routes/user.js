const { response } = require('express');
const e = require('express');
var express = require('express');
var router = express.Router();
var productHelpers = require('../helpers/product-helpers')
var userHelpers = require('../helpers/user-helpers')
/* GET home page. */
router.get('/', async function (req, res, next) {
  let user = req.session.user
  console.log('user',req.session.user)
  let cartCount = null
  if (req.session.user) {
    cartCount = await userHelpers.getcartCount(req.session.user._id)
  }
  productHelpers.getAllproducts().then(function (products) {
console.log('no products',products)


    res.render('user/view-products.hbs', { products, user, cartCount });
  });

});





router.get('/login', function (req, res) {
  if (req.session.loggedIn) {
    res.redirect('/')
  } else {

    res.render('user/login', { loginErr: req.session.loginErr })
    req.session.loginErr = false
  }
})






router.get('/signup', function (req, res) {
  res.render('user/signup')
})
router.post('/signup', function (req, res) {
  userHelpers.doSignup(req.body).then((response) => {
    console.log(response)

    req.session.loggedIn = true
    req.session.user = response
    res.redirect('/')
  })

})





router.post('/login', function (req, res) {
  userHelpers.doLogin(req.body).then(function (response) {
    if (response.status) {
      req.session.loggedIn = true
      req.session.user = response.user
      res.redirect('/')
    }
    else {
      req.session.loginErr = true
      res.redirect('/login')
    }

  })

})







router.get('/logout', function (req, res) {
  req.session.destroy()
  res.redirect('/')
})








router.get("/cart", verifylogin, async function (req, res) {
  let products = await userHelpers.getcartProducts(req.session.user._id)
  console.log(products)
  let total = await userHelpers.getTotalAmount(req.session.user._id)


  res.render('user/cart', { products, user: req.session.user, total })
})







function verifylogin(req, res, next) {
  if (req.session.loggedIn) {
    next()
  }
  else { res.redirect('/login') }
}








router.get('/add-to-cart/:id', (req, res) => {
  console.log('api call');

  userHelpers.addtoCart(req.params.id, req.session.user._id).then(() => {

    res.json({ status: true })
  })
})





router.post('/change-product-quantity', (req, res, next) => {


  console.log(req.body)
  userHelpers.changeProductQuantity(req.body).then(async (response) => {

    response.total = await userHelpers.getTotalAmount(req.body.user)

    res.json(response)



  })
})


router.post('/remove-product', (req, res, next) => {


  userHelpers.removeProduct(req.body).then((response) => {
    console.log(response)

    res.json(response)
  })
})
router.get('/place-order', verifylogin, async function (req, res) {
  let total = await userHelpers.getTotalAmount(req.session.user._id)
 var user={user:req.session.user._id}

  res.render('user/placeorder', { total, user})
})








router.post('/place-order',async function (req, res) {



  let products= await userHelpers.getCartProductList(req.session.user._id)
 let totalPrice=await userHelpers.getTotalAmount(req.session.user._id)
 console.log(products,totalPrice)
 let user=req.session.user._id

  userHelpers.placeOrder(req.body,products,totalPrice,user).then((response)=>{
    res.json({status:true})
    

  })

console.log(req.body)
 

})


router.get('/order-success',(req,res)=>{
  res.render('user/order-success')
})

router.get('/order-view-products',async (req,res)=>{
  let details=await userHelpers.getOrderViewProducts(req.session.user._id)
  console.log('this is the order details',details)
 
  res.render('user/order-view-products',{details})
})


router.get('/view-order-products/:id',async function(req,res) {

  let products= await userHelpers.getOrderProducts(req.params.id)
  console.log('result of products of order',products)
  res.render('user/ordered-products',{products})
  

})


module.exports = router;
