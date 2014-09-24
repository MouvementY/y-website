var gzippo = require('gzippo'),
	express = require('express'),
	morgan = require('morgan'),
	app = express();
 
app.use(morgan('dev'));
app.use(gzippo.staticGzip("" + __dirname + "/dist"));
app.listen(process.env.PORT || 5000);
