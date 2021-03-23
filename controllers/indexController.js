exports.index_get = function(req, res) {
    if (req.session.isAuthorized) {
        res.redirect('/panels');
        return;
    }

    res.redirect('/users/authorize');
}

exports.favicon_get = function(req, res) {
    res.redirect('/public/images/favicon.png');
}