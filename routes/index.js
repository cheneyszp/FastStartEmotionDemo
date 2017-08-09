function router (app) {
	app.get('/', function (req, res) {
		res.render('index', {
			title : 'Home'
		});
	});

	app.get('/f', function (req, res) {
		res.render('face', {
			title : 'Face'
		});
	});
}

module.exports = router;
