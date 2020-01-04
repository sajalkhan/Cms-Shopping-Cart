exports.isUser = (req,res,next)=>{
    if(req.isAuthenticated()){
        next();
    }else{
        req.flash('danger','Please Log In');
        res.redirect('/user/login');
    }
}

exports.isAdmin = (req,res,next)=>{
    if(req.isAuthenticated() && res.locals.user.admin == 1){
        next();
    }else{
        req.flash('danger','Please LogIn as admin');
        res.redirect('/user/login');
    }
}