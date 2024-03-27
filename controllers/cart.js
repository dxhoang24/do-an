var express = require("express");
var cart = express.Router();
var GioHang = require("../models/giohang.js");
var Cart = require("../models/Cart.js");
var products = require("../models/products.js");
var userData = require("../models/user.js");
var nodemailer = require("nodemailer");
const exportExcel = require("../libs/export.js");
const { v4: uuidv4 } = require("uuid");
const mongoose = require("mongoose");

var countJson = function (json) {
  var count = 0;
  for (var id in json) {
    count++;
  }

  return count;
};

cart.get("/shopping-cart", function (req, res) {
  if (req.session.loggin) {
    user = req.user;
  } else {
    user = null;
  }
  var giohang = new GioHang(
    req.session.cart ? req.session.cart : { items: {} }
  );
  var data = giohang.convertArray();
  res.render("user/cart", { data: data });
});

cart.post("/add-to-cart/:id", function (req, res) {
  var id = req.params.id;
  let type = req.body;
  let productId = `${id}_${type.size}_${type.color}`;
  var giohang = new GioHang(
    req.session.cart ? req.session.cart : { items: {} }
  );
  products.findById(id).then(function (data) {
    giohang.add(id, data, type, productId);
    req.session.cart = giohang;
    res.redirect("/shopping-cart");
  });
});
cart.get("/order", function (req, res) {
  var giohang = new GioHang(
    req.session.cart ? req.session.cart : { items: {} }
  );

  //var data = giohang.convertArray();

  if (req.session.cart) {
    if (countJson(req.session.cart.items) > 0) {
      res.render("user/order", { errors: null });
    } else res.redirect("/");
  } else {
    res.redirect("/");
  }
});

cart.get("/xemhang/:id", (req, res) => {
  var id = req.params.id;
  Cart.findById(id).then(function (data) {
    console.log(data);
    res.render("user/view_order", { cart: data });
  });
});
cart.get("/checkout", (req, res) => {
  if (req.session.loggin) {
    userID = req.user.id;
    Cart.find({ userID }).then(function (data) {
      res.render("user/List_order", { data: data });
    });
  } else {
    res.redirect("/");
  }
});
cart.post("/updateCart", function (req, res) {
  var id = req.body.id;
  var soluong = req.body.soluong;
  var giohang = new GioHang(
    req.session.cart ? req.session.cart : { items: {} }
  );

  giohang.updateCart(id, soluong);
  req.session.cart = giohang;
  res.json({ st: 1 });
});

cart.post("/updateCart2", function (req, res) {
  let data = req.body;
  var giohang = new GioHang(
    req.session.cart ? req.session.cart : { items: {} }
  );
  giohang.updateCart2(data);
  req.session.cart = giohang;
  res.json({ st: 1 });
});
cart.post("/delCart", function (req, res) {
  var id = req.body.id;
  var giohang = new GioHang(
    req.session.cart ? req.session.cart : { items: {} }
  );

  giohang.delCart(id);
  req.session.cart = giohang;
  res.json({ st: 1 });
});
cart.get("/delCart2/:id", function (req, res) {
  let id = req.params.id;
  var giohang = new GioHang(
    req.session.cart ? req.session.cart : { items: {} }
  );
  giohang.delCart(id);
  req.session.cart = giohang;
  res.redirect("/shopping-cart");
});
cart.get("/list_order", (req, res) => {
  if (req.session.loggin) {
    user = req.user;
    if (user.role == "admin") {
      let perPage = 10; // số lượng sản phẩm xuất hiện trên 1 page
      let page = req.params.page || 1;
      var message = req.flash("error");
      Cart.find() // find tất cả các data
        .sort({ date: -1 })
        .skip(perPage * page - perPage) // Trong page đầu tiên sẽ bỏ qua giá trị là 0
        .limit(perPage)
        .exec((err, data) => {
          Cart.countDocuments((err, count) => {
            // đếm để tính có bao nhiêu trang
            if (err) return next(err);
            res.render("admin/list-order", {
              data: data,
              message: message,
              current: page, // page hiện tại
              pages: Math.ceil(count / perPage),
            }); // Trả về dữ liệu các sản phẩm theo định dạng như JSON, XML,...
          });
        });
    } else {
      res.redirect("/");
    }
  } else {
    res.redirect("/");
  }
});
cart.get("/list_order/:page", (req, res) => {
  if (req.session.loggin) {
    user = req.user;
    if (user.role == "admin") {
      let perPage = 10; // số lượng sản phẩm xuất hiện trên 1 page
      let page = req.params.page || 1;
      var message = req.flash("error");
      Cart.find() // find tất cả các data
        .sort({ date: -1 })
        .skip(perPage * page - perPage) // Trong page đầu tiên sẽ bỏ qua giá trị là 0
        .limit(perPage)
        .exec((err, data) => {
          Cart.countDocuments((err, count) => {
            // đếm để tính có bao nhiêu trang
            if (err) return next(err);
            res.render("admin/list-order", {
              data: data,
              message: message,
              current: page, // page hiện tại
              pages: Math.ceil(count / perPage),
            }); // Trả về dữ liệu các sản phẩm theo định dạng như JSON, XML,...
          });
        });
    } else {
      res.redirect("/");
    }
  } else {
    res.redirect("/");
  }
});
cart.get("/order/download/:id", (req, res) => {
  let id = req.params.id;
  let agg = [
    {
      $match: {
        _id: new mongoose.Types.ObjectId(id),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "userID",
        foreignField: "_id",
        as: "users",
      },
    },
    { $unwind: { path: "$users", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        name: 1,
        phone: "$sdt",
        address: 1,
        date: 1,
        cart: 1,
      },
    },
  ];
  let allMount = 0; // tổng tiền
  // Thực hiện truy vấn MongoDB
  return new Promise((resolve, reject) => {
    Cart.aggregate(agg).then((rs) => {
      let data = {};
      data.name = rs[0] ? rs[0].name : "";
      data.phone = rs[0] ? "0" + rs[0].phone : "";
      data.address = rs[0] ? rs[0].address : "";
      data.date =
        rs[0] && rs[0].date
          ? moment(rs[0].date).format("DD/MM/YYYY HH:mm:ss")
          : "";
      data.cart = [];
      rs[0].cart.forEach((item) => {
        allMount += (item.qty || 0) * (item.price || 0);
        data.cart.push({
          name: item.item ? item.item.name : "",
          size: item.size || "",
          color: item.color || "",
          price: item.price || 0,
          quantity: item.qty || 0,
          mount: (item.qty || 0) * (item.price || 0),
        });
      });
      data.allMount = allMount;
      let excel = {
        fileName: `OrderDetail_${id}_${data.name}`,
        title: `HÓA ĐƠN MUA HÀNG`,
        titleHeadTable: [
          { key: "name", value: "Tên sản phẩm" },
          { key: "size", value: "Size" },
          { key: "color", value: "Màu sắc" },
          { key: "price", value: "Đơn giá" },
          { key: "quantity", value: "Số lượng" },
          { key: "mount", value: "Thành tiền" },
        ],
        valueWidthColumn: [50, 20, 30, 30, 30, 30],
      };
      exportExcel.exportExcelCart(data, excel, res, req);
    });
  });
});
cart.get("/view/:id", (req, res) => {
  var id = req.params.id;
  Cart.findById(id).then(function (data) {
    res.render("admin/view-order", { cart: data });
  });
});
cart.get("/xacnhan/:id", async function (req, res, next) {
  var id = req.params.id;
  Cart.findById(id, function (err, data) {
    data.st = 1;
    updateProductQuantities(data.cart);
    sendMail(data.userID);
    data.save();
    req.flash("success_msg", "Đã Thêm Thành Công");
    res.render("admin/view-order", { cart: data });
  });
});
cart.post("/menu", function (req, res) {
  if (req.session.loggin) {
    user = req.user;

    var giohang = new GioHang(
      req.session.cart ? req.session.cart : { items: {} }
    );
    var data = giohang.convertArray();

    var cart = new Cart({
      userID: user.id,
      name: req.body.name,
      address: req.body.address,
      sdt: req.body.phone,
      msg: req.body.message,
      cart: data,
      st: 0,

      date: Date.now(),
    });
    console.log(cart);
    cart.save().then(function () {
      req.session.cart = { items: {} };
      res.redirect("/");
    });
  }
});
cart.get("/delete-order/:id", function (req, res) {
  var id = req.params.id;
  Cart.findOneAndRemove({ _id: id }, function (err, offer) {
    if (err) {
      console.log(err);
    } else {
      req.flash("success_msg", "Đã Xóa Thành Công");
      res.redirect("/checkout");
    }
  });
});
cart.get("/xoa/:id", function (req, res) {
  var id = req.params.id;
  Cart.findOneAndRemove({ _id: id }, function (err, offer) {
    if (err) {
      console.log(err);
    } else {
      req.flash("success_msg", "Đã Xóa Thành Công");
      res.redirect("/list_order");
    }
  });
});
async function updateProductQuantities(data) {
  try {
    const quantityById = {};
    data.forEach((product) => {
      if (quantityById[product.item._id]) {
        quantityById[product.item._id] += Number(product.qty);
      } else {
        quantityById[product.item._id] = Number(product.qty);
      }
    });
    const result = Object.entries(quantityById).map(([id, quantity]) => ({
      id: id,
      quantity,
    }));
    for (const el of result) {
      let num = Number(el.quantity);
      await products.findByIdAndUpdate(el.id, { $inc: { quantity: -num } });
    }
    console.log("Update successful!");
  } catch (error) {
    console.error("Error updating product quantities:", error);
  }
}

async function sendMail(id, type) {
  userData.findById(id, function (err, data) {
    if (err) {
      console.log(err);
    } else {
      var transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "daohoang240620@gmail.com",
          pass: "fzot ftdy sxsz qsjy",
        },
      });

      var mailOptions = {
        from: "daohoang240620@gmail.com",
        to: data.email,
        subject: "Thông báo đặt hàng",
        text: "Đơn hàng của bạn đã được đặt thành công !",
      };

      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
        } else {
          console.log("Email sent success");
        }
      });
    }
  });
}
module.exports = cart;
