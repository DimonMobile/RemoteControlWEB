exports.index_get = function(req, res) {
    res.render('panels/index', {req: req});
}