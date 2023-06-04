var express = require('express');
var router = express.Router();
var productHelpers = require('../helpers/product-helpers')

/* GET users listing. */
router.get('/', function (req, res, next) {
  productHelpers.getAllproducts().then(function (products) {
    console.log(products)

    res.render('admin/view-products.hbs', { admin: true, products });
  });
})





router.get('/add-product', function (req, res) {
  res.render('admin/add-product')

})
router.post('/add-product', function (req, res) {
  console.log(req.body)
  console.log(req.files.Image);
  productHelpers.addProducts(req.body, function (id) {

    var image = req.files.Image



    image.mv('./public/product-images/' + id + '.jpg', (err, done) => {



      if (!err) {
        res.render('admin/add-product')

      }
      else { console.log(err) }
    })

  })

})

router.get('/delete-product', function (req, res) {
  var proId = req.query.id
  console.log(proId)
  productHelpers.deleteProduct(proId).then((response) => {
    res.redirect('/admin')

  })
})
router.get("/edit-product", async function (req, res) {
  await productHelpers.getproductDetails(req.query.id).then((product) => {
    console.log(product)
    res.render('admin/edit-product', { product })
  })



})
router.post('/edit-product/:id', function (req, res) {

  productHelpers.updateProduct(req.params.id, req.body).then(() => {
    res.redirect("/admin")

    if (req.files.Image) {

      let image=req.files.Image
      image.mv('./public/product-images/' + req.params.id + '.jpg')

    }
  })




})







module.exports = router;
