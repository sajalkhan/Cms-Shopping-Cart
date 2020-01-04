const express = require('express');
const router = express.Router();
const mkdirp = require('mkdirp');
const fs = require('fs-extra');
const resizeImage = require('resize-img');
const { check, validationResult } = require('express-validator');

var auth = require('../config/auth');
var isAdmin = auth.isAdmin;

const product_model = require('../Models/product_model');
const category_model = require('../Models/category_model');

/**
 * Get pages Index
 */
router.get('/',isAdmin, async (req, res) => {

    try {
        var count = await product_model.countDocuments();

        await product_model.find((err, products) => {
            res.render('admin/products', {
                products: products,
                count: count,
                title: 'product'
            });
        });
    } catch (err) {

    }

});

/**
 * Get add product 
 */
router.get('/addProduct',isAdmin, async (req, res) => {

    const title = '';
    const desc = '';
    const price = '';
    const image = '';
    try {
        var category = await category_model.find();

        res.render('admin/add_product', {
            title: title,
            desc: desc,
            category: category,
            price: price,
            image: image
        });

    } catch (err) {

    }
});

/**
 * Get Edit Product
 */
router.get('/EditProduct/:id', isAdmin, async (req, res) => {

    var category = await category_model.find();
    await product_model.findById(req.params.id, (err, product) => {

        if (err) {
            console.log(err);
            res.redirect('/admin/products');
        }
        else {
            var galleryDir = 'public/product_images/' + product._id + '/gallery';
            var galleryImages = null;

            fs.readdir(galleryDir, (err, files) => {
                if (err) return console.log(err);
                galleryImages = files;

                res.render('admin/edit_product', {
                    title: product.title,
                    slug: product.slug,
                    desc: product.description,
                    categories: category,
                    category: product.category.toLowerCase().replace('/\s+/g','-'),
                    price: parseFloat(product.price).toFixed(2),
                    image: product.images,
                    galleryImages: galleryImages,
                    id: product._id
                });
            });

        }
    });

});


/**
 * Get Delete products
 */
router.get('/DeleteProduct/:id', isAdmin, async (req, res) => {
    
    var id = req.params.id;
    var path = 'public/product_images/'+id;
    fs.remove(path, (err)=>{
        if(err) return console.log(err);
        else{
            product_model.findByIdAndRemove(id, (err)=>{
                if(err) return console.log(err);
                else{
                    req.flash('success', 'Product Deleted!');
                    res.redirect('/admin/product');
                }
            })
        }
    })
});

/**
 * Delete Gallery product images
 */
router.get('/deleteProduct/:image', isAdmin, (req, res) => {

    var id = req.query.product_id;

    var originalImage = 'public/product_images/'+id+'/gallery/'+req.params.image;
    var thumbsImage = 'public/product_images/'+id+'/gallery/thumbs/'+req.params.image;

    fs.remove(originalImage, (err)=>{
        if(err) return console.log(err);
        else{
            fs.remove(thumbsImage,(err)=>{
                if(err) return console.log(err);
                else{
                    req.flash('success', 'Image Deleted!');
                    res.redirect('/admin/product/EditProduct/'+id);
                }
            })
        }
    })

});

/**
 * Post add products
 */
router.post('/addProduct', [
    check('title', 'Title must have a value').not().isEmpty(),
    check('description', 'Description must have a value').not().isEmpty(),
    check('price', 'Price must have a value').isDecimal()     //check validation
], isAdmin, async (req, res) => {

    var title = req.body.title;
    var desc = req.body.description;
    var price = req.body.price;
    var category = req.body.category;
    var slug = title.toLowerCase().replace('/\s+/g', '-');
    var imageFile;
    if(req.files==null) imageFile = "";
    else imageFile = req.files.image != "undefined" ? req.files.image.name : "";

    console.log(req.body);

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        //return res.status(422).json({ errors: errors.array()});
        try {

            var category = await category_model.find();

            res.render('admin/add_product', {
                errors: errors.array(),
                title: title,
                desc: desc,
                category: category,
                price: price,
                image: imageFile
            });

        } catch (err) {

        }
    }
    else {

        product_model.findOne({ slug: slug }, (err, product) => {
            if (product) {
                req.flash('danger', `${slug} product exists, choose another`); // this is show a message using  <%- messages('messages', locals) %>

                category_model.find((err, data) => {
                    res.render('admin/add_product', {
                        errors: errors.array(),
                        title: title,
                        desc: desc,
                        category: data,
                        price: price
                    });
                });

            }
            else {

                //create a new category model and save it 
                var product = new product_model({
                    title: title,
                    slug: slug,
                    description: desc,
                    category: category,
                    price: parseFloat(price).toFixed(2),
                    images: imageFile
                });

                product.save((err) => {
                    if (err) return console.log(err);

                    //---- create image directory -----
                    mkdirp('public/product_images/' + product.id, (err) => {
                        return console.log(err);
                    });
                    mkdirp('public/product_images/' + product.id + '/gallery', (err) => {
                        return console.log(err);
                    });
                    mkdirp('public/product_images/' + product.id + '/gallery/thumbs', (err) => {
                        return console.log(err);
                    });
                    //---- create image directory -----

                    //save image file
                    if (imageFile != "") {
                        var productImage = req.files.image;
                        var path = 'public/product_images/' + product.id + '/' + imageFile;

                        productImage.mv(path, (err) => {
                            console.log(err);
                        });
                    }

                    req.flash('success', 'Product Added');
                    res.redirect('/admin/product');
                })
            }
        })
    }
});


/**
 * Post edit product
 */
router.post('/EditProduct/:id', [
    check('title', 'Title must have a value').not().isEmpty(),
    check('description', 'Description must have a value').not().isEmpty(),
    check('price', 'Price must have a value').isDecimal()     //check validation
], isAdmin, async (req, res) => {

    var id = req.params.id;
    var title = req.body.title;
    var desc = req.body.description;
    var price = req.body.price;
    var category = req.body.category;
    var slug = title.toLowerCase().replace('/\s+/g', '-');
    var pimage = req.body.pimage;
    var imageFile;
    if(req.files == null) imageFile = "";
    else imageFile = req.files.image != "undefined" ? req.files.image.name : "";

    const errors = validationResult(req);

    if(!errors.isEmpty())
    {
        var galleryDir = 'public/product_images/' + id + '/gallery';
        var galleryImages = null;

        fs.readdir(galleryDir, (err, files) => {
            if (err) return console.log(err);
            galleryImages = files;

            res.render('admin/edit_product', {
                errors: errors.array(),
                title: title,
                slug: slug,
                desc: desc,
                categories: category,
                category: category.toLowerCase().replace('/\s+/g','-'),
                price: parseFloat(price).toFixed(2),
                image: pimage,
                galleryImages: galleryImages,
                id: id
            });
        });
    }
    else{
         product_model.findOne({slug: slug, _id: {'$ne':id} }, (err, product)=>{
            if(err) return console.log(err);

            if(product){
                req.flash('danger','product title exists choose another!');
                res.redirect('/admin/product/EditProduct/'+id);
            }
            else{
                product_model.findById(id, (err, p)=>{
                    if(err) return console.log(err);

                    p.title = title;
                    p.slug = slug;
                    p.description = desc;
                    p.price = parseFloat(price).toFixed(2);
                    p.category = category;

                    if(imageFile!="") p.images = imageFile;

                    p.save((err)=>{
                        if(err) return console.log(err);

                        if(imageFile!="")
                        {
                            //first remove previous image 
                            if(pimage!="")
                            {
                                fs.remove('public/product_images/'+id+'/'+pimage, (err)=>{
                                    if(err) return console.log(err);
                                });
                            }

                            // save new image
                            var productImage = req.files.image;
                            var path = 'public/product_images/' + id + '/' + imageFile;
    
                            productImage.mv(path, (err) => {
                                console.log(err);
                            });
                        }

                        req.flash('success', 'Product Edited');
                        res.redirect('/admin/product/EditProduct/'+id);

                    })
                });
            }
        });
    }

});

/**
 * Post Gallery images
 */
router.post('/productGallery/:id', isAdmin, (req, res) => {

    var id = req.params.id;
    var productImage = req.files.file;
    var path = 'public/product_images/'+id+'/gallery/'+req.files.file.name;
    var thumbsPath = 'public/product_images/'+id+'/gallery/thumbs/'+req.files.file.name;

    productImage.mv(path, (err) => {
        if(err) return console.log(err);

        resizeImage(fs.readFileSync(path), {width:100, height:100}).then((buf)=>{
            fs.writeFileSync(thumbsPath, buf);
        });
    });

    res.sendStatus(200);
});



//exports
module.exports = router;