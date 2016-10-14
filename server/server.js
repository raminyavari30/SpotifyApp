var express = require('express'); 

var app = express();
require('dotenv').config();
require('./middleware.js')(app, express);
require('./routes.js')(app);

console.log('Listening on 8888');
app.listen(8888);
