exports.getErrorPage = (req, res, next) => {
    res.status(404).render('404', {pageTitle : 'Page not found',path:'/404',isAuthenticated : req.session});
}
//there has been changes here

exports.get500Error = (req, res, next) => {
    res.status(500).render('500', {pageTitle : 'Inter server error',path:'/500',isAuthenticated : req.session});
}