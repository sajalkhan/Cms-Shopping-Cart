var express = require('express');
var router = express.Router();
const { check, validationResult } = require('express-validator');
const pagemodel = require('../Models/page_model');

var auth = require('../config/auth');
var isAdmin = auth.isAdmin;

/**
 * Get pages Index
 */
router.get('/', isAdmin, async (req,res)=>{
    try{
        const getData = await pagemodel.find({}).sort({sorting:1}).exec((err,pages)=>{
            res.render('admin/pages',{
                pages:pages,
                title:pages.title
            })
        });
    }catch(err){

    }
});

/**
 * Get pages 
 */
router.get('/add-page', isAdmin, (req,res)=>{
    
    const title = "";
    const slug = "";
    const content = "";
    res.render('admin/add_page',{
        title:'',
        slug:slug,
        content:content
    });
});

/**
 * Get Edit pages 
 */
router.get('/EditPage/:id', isAdmin, async (req,res)=>{
    try{
        await pagemodel.findById(req.params.id,(err,page)=>{
            if(err)return console.log(err);
            
            res.render('admin/edit_page',{
                title:page.title,
                slug:page.slug,
                content:page.content,
                id:page._id
            });
        });
    }catch(err){

    }
});


/**
 * Get Delete pages 
 */
router.get('/DeletePage/:id', isAdmin, async (req,res)=>{
    try{
        await pagemodel.findByIdAndDelete(req.params.id,(err)=>{
            if(err) return console.log(err);

            req.flash('success','Page Deleted');
            res.redirect('/admin/pages');
        });
    }catch(err){

    }
});


/**
 * Post add pages 
 */
router.post('/add-page', [
    check('title','Title must have a value').not().isEmpty(),     //check validation
    check('content','Content must have a value').not().isEmpty()
], (req,res)=>{

    var title = req.body.title;
    var slug = req.body.slug.toLowerCase().replace('/\s+/g','-');
    if(slug=='')slug = title.toLowerCase().replace('/\s+/g','-');
    const content = req.body.content;

    const errors = validationResult(req);
    
    if(!errors.isEmpty()){
        //return res.status(422).json({ errors: errors.array()});
        res.render('admin/add_page',{
            errors:errors.array(),
            title:title,
            slug:slug,
            content:content
        });
    }
    else {
    
        pagemodel.findOne({slug:slug}, (err,page)=>{
          if(page){
              req.flash('danger',`${slug} Slug exists, choose another`); // this is show a message using  <%- messages('messages', locals) %>
              res.render('admin/add_page',{
                  title:title,
                  slug:slug,
                  content:content
              });
          }
          else{
              //create a new pagemodel and save it 
              var page = new pagemodel({
                  title:title,
                  slug:slug,
                  content:content,
                  sorting:100
              });

              page.save((err)=>{
                  if(err) return console.log(err);
                  req.flash('success','Page Added');
                  res.redirect('/admin/pages');
              })
          }
      })  
    }
});


/**
 * Post edit pages 
 */
router.post('/EditPage/:id', [
    check('title', 'Title must have a value').not().isEmpty(),     //check validation
    check('content', 'Content must have a value').not().isEmpty()
], async (req, res) => {

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
            await pagemodel.findOne({ id: id, _id: { '$ne': id } }, (err, page) => {
                if (page) {
                    req.flash('danger', `${slug} Slug exists, choose another`); // this is show a message using  <%- messages('messages', locals) %>
                    res.render('admin/edit_page', {
                        title: title,
                        slug: slug,
                        content: content,
                        id: id
                    });
                }
                else {
                    try {
                        pagemodel.findById(id, (err, page) => {

                            if (err) return console.log(err);

                            // just assign value so it will update
                            page.title = title;
                            page.slug = slug;
                            page.content = content;

                            page.save((err) => {
                                if (err) return console.log(err);
                                req.flash('success', 'Page Edited!');
                                res.redirect('/admin/pages/EditPage/'+id);
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

router.post('/reorder-pages', async (req,res)=>{

    var ids = req.body['id[]'];

    var count = 0;
    for (var i = 0; i < ids.length; i++) {
        var id = ids[i];
        count++;
        await pagemodel.findById(id, (err, page) => {
            page.sorting = count;
            page.save((err) => {
                if (err) console.log(err);
            });
        });
    }
});

//exports
module.exports = router;