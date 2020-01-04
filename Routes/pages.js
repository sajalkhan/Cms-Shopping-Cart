var express = require('express');
var router = express.Router();
var page_model = require('../Models/page_model');
var category_model = require('../Models/category_model');

/**
 * Get all pages title
 */
router.get('/', async (req, res) => {
    try {

        var category = await category_model.find();        
        var homePageContent = await page_model.findOne({slug:'home'});
        await page_model.find({}).sort({ sorting: 1 }).exec((err, pages) => {
            if (err) return console.log(err);
            else {
                res.render('index', {
                    title: 'Home',
                    content: homePageContent.content,
                    pages: pages,
                    category:category
                });
            }

        });
    } catch (err) {

    }
});

/**
 * Get page content
 */
router.get('/:slug', async (req, res) => {
    try {
        
        var slug = req.params.slug;
        var category = await category_model.find();        
        var All_Pages = await page_model.find({}).sort({ sorting: 1 });

        await page_model.findOne({slug:slug}, (err, page)=>{

            if(err) return console.log(err);
            if(!page) res.redirect('/');
            else{
                res.render('index',{
                    pages:All_Pages,
                    title:page.title,
                    content: page.content,
                    category:category
                });
            }
        })
    } catch (err) {

    }
});


//exports
module.exports = router;