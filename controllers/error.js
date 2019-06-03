exports.getErrorPage = (req, res, next) => {
    res.status(404).render('404', {pageTitle : 'Page not found',path:'/404',isAuthenticated : req.session});
}
//there has been changes here
