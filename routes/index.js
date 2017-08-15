var emotiondatajs  = require('../models/emotiondata.js');


function router(app) {
	app.get('/', function (req, res) {
		res.render('index', {
			title: 'Home'
		});
	});

	app.post('/api/addemotiondata', function (req, res) {
		var data = req.body;
		emotiondatajs(data,function(err){
			if (err) res.send(err);
			else res.json({ code: 200, message: 'Insert successfully' });
		});

	});

}

module.exports = router;
