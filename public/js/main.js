$(function(){

    if($('textarea#text_area').length){
        CKEDITOR.replace('text_area');
    }
    
    if ($("[data-fancybox]").length) {
        $("[data-fancybox]").fancybox();
    }
    
});
