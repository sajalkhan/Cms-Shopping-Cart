var express = require('express');
var router = express.Router();
var fs = require('fs-extra');
var page_model = require('../Models/page_model');
var product_model = require('../Models/product_model');
var category_model = require('../Models/category_model');

var auth = require('../config/auth');
var isUser = auth.isUser;

/**
 * Get all product
 */
router.get('/', isUser, async (req, res) => {
    try {
        
        var category = await category_model.find();        
        var pages = await page_model.find({}).sort({ sorting: 1 });
        //var homePageContent = await page_model.findOne({slug:'home'}); // when we add more page in that case it will help us to avoid error

        await product_model.find((err, product) => {
            if (err) return console.log(err);
            else {
                res.render('view_product', {
                    title: product.title,
                    pages: pages,
                    category: category,
                    product: product
                });
            }

        });
    } catch (err) {

    }
});

/**
 * Get product by category
 */
router.get('/:category', async (req, res) => {
    try {
        
        var allCategory = await category_model.find();
        var pages = await page_model.find({}).sort({ sorting: 1 });      

        await product_model.find({category:req.params.category}, (err, product) => {

            if (err) return console.log(err);
            else {
                res.render('view_product', {
                    title: product.title,
                    pages: pages,
                    category: allCategory,
                    product: product
                });
            }

        });
    } catch (err) {

    }
});


/**
 * Get product details
 */
router.get('/:category/:product', async (req, res) => {
    
    var galleryImages = null;
    var allCategory = await category_model.find();
    var pages = await page_model.find({}).sort({ sorting: 1 });
    var loggedIn = (req.isAuthenticated()) ? true : false;
    
    product_model.findOne({slug: req.params.product}, (err, products)=>{
        if(err) return console.log(err);
        else{
            var galleryDir = 'public/product_images/'+products._id+'/gallery';

            fs.readdir(galleryDir, (err, files)=> {
                if(err) return console.log(err);

                galleryImages = files;
                res.render('view_product_details',{
                    title: products.title,
                    pages: pages,
                    category:allCategory,
                    product: products,
                    loggedIn: loggedIn,
                    galleryImages: galleryImages
                });
            });
        }
    });
});

//exports
module.exports = router;