var express = require('express');
var router = express.Router();
const { check, validationResult } = require('express-validator');
const category_model = require('../Models/category_model');

var auth = require('../config/auth');
var isAdmin = auth.isAdmin;

/**
 * Get pages Index
 */
router.get('/', isAdmin, async (req,res)=>{

    try {
        await category_model.find({}).exec((err, category) => {
            if (err) return console.log(err);
            res.render('admin/category', {
                category: category,
                title:'category'
            });
        });
    } catch (err) {

    }
});

/**
 * Get pages 
 */
router.get('/addCategory',isAdmin, (req,res)=>{
    
    const title = '';
    const slug = '';

    res.render('admin/add_category',{
        title:title,
        slug:slug
    });
});

/**
 * Get Edit pages 
 */
router.get('/EditCategory/:id',isAdmin, async (req,res)=>{

    try {

        await category_model.findById(req.params.id, (err, category) => {
            if (err) return console.log(err);

            res.render('admin/edit_category', {
                title: category.title,
                slug: category.slug,
                id: category._id
            });
        });
    } catch (err) {

    }
});


/**
 * Get Delete pages 
 */
router.get('/DeleteCategory/:id',isAdmin, async (req,res)=>{
    try{
        await category_model.findByIdAndDelete(req.params.id,(err)=>{
            if(err) return console.log(err);

            req.flash('success','Category Deleted');
            res.redirect('/admin/category');
        });
    }catch(err){

    }
});


/**
 * Post add pages 
 */
router.post('/addCategory',[
    check('title','Title must have a value').not().isEmpty()     //check validation
] ,isAdmin, (req,res)=>{

    var title = req.body.title;
    var slug = req.body.slug.toLowerCase().replace('/\s+/g','-');
    if(slug=='')slug = title.toLowerCase().replace('/\s+/g','-');

    const errors = validationResult(req);
    
    if(!errors.isEmpty()){
        //return res.status(422).json({ errors: errors.array()});
        res.render('admin/add_category',{
            errors:errors.array(),
            title:title,
            slug:slug
        });
    }
    else {
    
        category_model.findOne({slug:slug}, (err,category)=>{
          if(category){
              req.flash('danger',`${slug} Slug exists, choose another`); // this is show a message using  <%- messages('messages', locals) %>
              res.render('admin/add_category',{
                  title:title,
                  slug:slug
              });
          }
          else{
              //create a new category model and save it 
              var category = new category_model({
                  title:title,
                  slug:slug
              });

              category.save((err)=>{
                  if(err) return console.log(err);
                  req.flash('success','Category Added');
                  res.redirect('/admin/category');
              })
          }
      })  
    }
});


/**
 * Post edit pages 
 */
router.post('/EditCategory/:id', [
    check('title', 'Title must have a value').not().isEmpty()     //check validation
],isAdmin, async (req, res) => {

    var title = req.body.title;
    var slug = req.body.slug.toLowerCase().replace('/\s+/g', '-');
    if (slug == '') slug = title.toLowerCase().replace('/\s+/g', '-');
    const content = req.body.content;
    const id = req.body.id;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        //return res.status(422).json({ errors: errors.array()});
        res.render('admin/edit_page', {
            errors: errors.array(),
            title: title,
            slug: slug,
            content: content,
            id: id
        });
    }
    else {

        try {
            await category_model.findOne({ id: id, _id: { '$ne': id } }, (err, page) => {
                if (page) {
                    req.flash('danger', `${slug} Slug exists, choose another`); // this is show a message using  <%- messages('messages', locals) %>
                    res.render('admin/edit_page', {
                        title: title,
                        slug: slug,
                        id: id
                    });
                }
                else {
                    try {
                        category_model.findById(id, (err, page) => {

                            if (err) return console.log(err);

                            // just assign value so it will update
                            page.title = title;
                            page.slug = slug;

                            page.save((err) => {
                                if (err) return console.log(err);
                                req.flash('success', 'Page Edited!');
                                res.redirect('/admin/category/EditCategory/'+id);
                            });

                        });
                    } catch (err) {

                    }
                }
            });
        } catch (err) {

        }
    }
});


//exports
module.exports = router;