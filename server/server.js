var express = require('express'); 

var app = express();
var port = process.env.PORT || 8888;
require('dotenv').config();
require('./middleware.js')(app, express);
require('./routes.js')(app);

app.listen(8888, function() {
  console.log('Listening on 8888');
});
