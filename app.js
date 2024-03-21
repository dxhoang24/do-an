require('dotenv').config()
var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var cookieParser = require('cookie-parser');
var session = require('express-session')
var passport = require('passport');
require('mongoose-pagination');
var flash = require('connect-flash');
require('colors');
const { jobImportExcel } = require('./import_excel.js');
jobImportExcel();
global._ = require('underscore');
global._moment = require('moment');
var swal = require('sweetalert2')
global.fsx = require('fs.extra');
global.path = require('path');
global.__basedir = __dirname;
global._request = require('request');
global._rootPath = path.dirname(require.main.filename);
global._libsPath = path.normalize(path.join(__dirname, 'libs'));

const dotenv = require('dotenv')
dotenv.config()

global.moment = global._moment;

global._async = require('async');
global.mongoose = require('mongoose');
global.mongodb = require('mongodb');
global.pagination = require('pagination');

require(path.join(__dirname, 'libs', 'resource'));

var app = express();

// link router
var cate = require("./controllers/cate.js");
var view_user = require("./controllers/view_user.js");
var cart = require("./controllers/cart.js");
var detail_notifi = require("./controllers/detail-notifi.js");
var notifi = require("./controllers/notification.js");
var detail_product = require("./controllers/detail-product.js");
var router = require("./controllers/users.js")
var product = require('./controllers/product.js');
var client = require('./controllers/client.js');
var about = require('./controllers/about.js');
var contact = require('./controllers/contact.js');
var provider = require('./controllers/provider.js');
var size = require('./controllers/sizeproduct.js');
var color = require('./controllers/colorproduct.js');

//Link models
var products = require("./models/products.js");

// kết nối database
var config = require('./config/database.js');
var mongoose = require('mongoose');

mongoose.connect(config.url,{ useNewUrlParser: true , useUnifiedTopology: true });

require('./config/passport'); //vượt qua passport để config trang đăng nhâp/đăng ký
app.use(session({
  secret: 'adsa897adsa98bs',
  resave: false,
  saveUninitialized: false,
}))
app.use(flash());
app.use(passport.initialize())
app.use(passport.session());
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.get('/', function(req,res){
  if(!req.session.loggin){
   user =null;
   let perPage = 12; // số lượng sản phẩm xuất hiện trên 1 page
   let page = req.params.page || 1;

   products
     .find() // find tất cả các data
     .sort({ date: "descending" })
     .skip(perPage * page - perPage) // Trong page đầu tiên sẽ bỏ qua giá trị là 0
     .limit(perPage)
     .exec((err, data) => {
       products.countDocuments((err, count) => {
         // đếm để tính có bao nhiêu trang
         if (err) return next(err);
         res.render("user/index", {
           danhsach: data,
           
           current: page, // page hiện tại
           pages: Math.ceil(count / perPage),
         }); // Trả về dữ liệu các sản phẩm theo định dạng như JSON, XML,...
       });
     });
}else{
  user =req.user;
  let perPage = 12; // số lượng sản phẩm xuất hiện trên 1 page
  let page = req.params.page || 1;

  products
    .find() // find tất cả các data
    .sort({ date: "descending" })
    .skip(perPage * page - perPage) // Trong page đầu tiên sẽ bỏ qua giá trị là 0
    .limit(perPage)
    .exec((err, data) => {
      products.countDocuments((err, count) => {
        // đếm để tính có bao nhiêu trang
        if (err) return next(err);
        res.render("user/index", {
          danhsach: data,
       
          current: page, // page hiện tại
          pages: Math.ceil(count / perPage),
        }); // Trả về dữ liệu các sản phẩm theo định dạng như JSON, XML,...
      });
    });
}
})
app.set('view cache', false);
app.set('port', process.env.PORT || _config.app.port);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(require('cookie-parser')('dft.vn'));
app.use(require('express-session')({ secret: 'dft.vn', resave: false, saveUninitialized: true }));
// app.use(require('multer')({ dest: path.join(__dirname, 'temp') }).any());
app.use('/assets', express.static(path.join(__dirname, 'assets')));
require(path.join(_rootPath, 'libs', 'router.js'))(app);
//get router
app.use("/", detail_notifi);
app.use("/", notifi);
app.use("/", router);
app.use("/", contact);
app.use("/", about);
app.use("/", client);
app.use("/", cart);
app.use("/", view_user);
app.use("/", product);
app.use("/", cate);
app.use("/", color);
app.use("/", size);
app.use("/", detail_product);
app.use("/", provider);

app.use(function (req, res, next) {
  res.render('404', { title: '404 | Page not found' });
});

app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.render('500', { message: err.message });
});

var handleOnServerStart = function () {
  console.log(("Server is running at " + app.get('port')).magenta);
};

var server = app.listen(app.get('port'), handleOnServerStart);

// global.sio = require('socket.io').listen(server, { log: false });
// sio.on('connection', function (socket) {
//     require(path.join(_rootPath, 'socket', 'io.js'))(socket);
// });
