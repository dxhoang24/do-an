exports.index = {
    json: async function(req, res) {
        res.json({
            code: 200
        })
    },
    html: async function(req, res) {
        var page = _.has(req.query, 'page') ? parseInt(req.query.page) : 1;
        var rows = _.has(req.query, 'rows') ? parseInt(req.query.rows) : 10;
        let agg = _User.aggregate([]);
        _User.aggregatePaginate(agg, { page: page, limit: rows }, function(error, results, node, count){
            console.log('user', results);
            res.render('admin/test', {
                title: 'Day la test',
                user: results
            })
        });
        
    }
}