var bodyParser = require('body-parser');
var path = require('path');
var cookieParser = require('cookie-parser');

module.exports = function(app, express) {

  app.use(express.static(path.join(__dirname, '../')));

  app.use(cookieParser());

  app.use(bodyParser.urlencoded({ extended: false }));

  app.use(bodyParser.json());
  
}
