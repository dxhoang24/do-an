var express = require("express");
var product = express.Router();
const products = require("../models/products.js");
var multer = require("multer");
const { response } = require("express");
var cates = require("../models/Cate.js");
var colors = require("../models/colorProduct.js");
var sizes = require("../models/sizeProduct.js");
var providers = require("../models/provider.js");
const cate = require("./cate");
const exportExcel = require("../libs/export.js");

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/upload");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
var upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    console.log(file);
    if (
      file.mimetype == "image/jpg" ||
      file.mimetype == "image/PNG" ||
      file.mimetype == "image/jpeg" ||
      file.mimetype == "image/png" ||
      file.mimetype == "image/gif"
    ) {
      cb(null, true);
    } else {
      return cb(new Error("Only image are allowed!"));
    }
  },
}).single("image");

product.get("/product", (req, res) => {
  if (req.session.loggin) {
    user = req.user;

    let perPage = 8; // số lượng sản phẩm xuất hiện trên 1 page
    let page = req.params.page || 1;
    cates.find().then(function (data) {
      item = data;

      products
        .find() // find tất cả các data
        .sort({ date: "descending" })
        .skip(perPage * page - perPage) // Trong page đầu tiên sẽ bỏ qua giá trị là 0
        .limit(perPage)
        .exec((err, data) => {
          products.countDocuments((err, count) => {
            // đếm để tính có bao nhiêu trang
            if (err) return next(err);
            res.render("user/product", {
              danhsach: data,
              current: page, // page hiện tại
              pages: Math.ceil(count / perPage),
            }); // Trả về dữ liệu các sản phẩm theo định dạng như JSON, XML,...
          });
        });
    });
  } else {
    user = null;

    let perPage = 8; // số lượng sản phẩm xuất hiện trên 1 page
    let page = req.params.page || 1;
    cates.find().then(function (data) {
      item = data;

      products
        .find() // find tất cả các data
        .sort({ date: "descending" })
        .skip(perPage * page - perPage) // Trong page đầu tiên sẽ bỏ qua giá trị là 0
        .limit(perPage)
        .exec((err, data) => {
          products.countDocuments((err, count) => {
            // đếm để tính có bao nhiêu trang
            if (err) return next(err);
            res.render("user/product", {
              danhsach: data,
              current: page, // page hiện tại
              pages: Math.ceil(count / perPage),
            }); // Trả về dữ liệu các sản phẩm theo định dạng như JSON, XML,...
          });
        });
    });
  }
});
product.get("/product/:page", (req, res) => {
  if (req.session.loggin) {
    user = req.user;

    let perPage = 8; // số lượng sản phẩm xuất hiện trên 1 page
    let page = req.params.page || 1;
    Promise.all([cates.find(), colors.find(), sizes.find(), providers.find()])
      .then(function (results) {
        // results là một mảng chứa kết quả của cả ba truy vấn
        const [catesData, colorsData, sizesData, providersData] = results;
        const cates = catesData;
        const colors = colorsData;
        const sizes = sizesData;
        const providers = providersData;
        products
          .find() // find tất cả các data
          .sort({ date: "descending" })
          .skip(perPage * page - perPage) // Trong page đầu tiên sẽ bỏ qua giá trị là 0
          .limit(perPage)
          .exec((err, data) => {
            products.countDocuments((err, count) => {
              // đếm để tính có bao nhiêu trang
              if (err) return next(err);
              res.render("user/product", {
                danhsach: data,
                cates: cates, // Chuyển dữ liệu đã xử lý vào template
                colors: colors,
                sizes: sizes,
                providers: providers,
                current: page, // page hiện tại
                pages: Math.ceil(count / perPage),
              }); // Trả về dữ liệu các sản phẩm theo định dạng như JSON, XML,...
            });
          });
      })
      .catch(function (error) {
        console.error("Error:", error);
        // Xử lý lỗi nếu có
        res.status(500).send("Internal Server Error");
      });
  } else {
    user = null;
    let perPage = 8; // số lượng sản phẩm xuất hiện trên 1 page
    let page = req.params.page || 1;
    Promise.all([cates.find(), colors.find(), sizes.find(), providers.find()])
      .then(function (results) {
        // results là một mảng chứa kết quả của cả ba truy vấn
        const [catesData, colorsData, sizesData, providersData] = results;
        const cates = catesData;
        const colors = colorsData;
        const sizes = sizesData;
        const providers = providersData;
        products
          .find() // find tất cả các data
          .sort({ date: "descending" })
          .skip(perPage * page - perPage) // Trong page đầu tiên sẽ bỏ qua giá trị là 0
          .limit(perPage)
          .exec((err, data) => {
            products.countDocuments((err, count) => {
              // đếm để tính có bao nhiêu trang
              if (err) return next(err);
              res.render("user/product", {
                danhsach: data,
                cates: cates, // Chuyển dữ liệu đã xử lý vào template
                colors: colors,
                sizes: sizes,
                providers: providers,
                current: page, // page hiện tại
                pages: Math.ceil(count / perPage),
              }); // Trả về dữ liệu các sản phẩm theo định dạng như JSON, XML,...
            });
          });
      })
      .catch(function (error) {
        console.error("Error:", error);
        // Xử lý lỗi nếu có
        res.status(500).send("Internal Server Error");
      });
  }
});

product.get("/admin/list-product", (req, res) => {
  if (req.session.loggin) {
    user = req.user;
    if (user.role == "admin") {
      let perPage = 8; // số lượng sản phẩm xuất hiện trên 1 page
      let page = req.params.page || 1;
      var message = req.flash("error");

      Promise.all([cates.find(), colors.find(), sizes.find(), providers.find()])
        .then(function (results) {
          // results là một mảng chứa kết quả của cả ba truy vấn
          const [catesData, colorsData, sizesData, providersData] = results;
          const cates = catesData;
          const colors = colorsData;
          const sizes = sizesData;
          const providers = providersData;
          products
            .find() // find tất cả các data
            .sort({ date: "descending" })
            .skip(perPage * page - perPage) // Trong page đầu tiên sẽ bỏ qua giá trị là 0
            .limit(perPage)
            .exec((err, data) => {
              products.countDocuments((err, count) => {
                // đếm để tính có bao nhiêu trang
                if (err) return next(err);
                res.render("admin/list-product", {
                  danhsach: data,
                  cates: cates, // Chuyển dữ liệu đã xử lý vào template
                  colors: colors,
                  sizes: sizes,
                  providers: providers,
                  message: message,
                  current: page, // page hiện tại
                  pages: Math.ceil(count / perPage),
                }); // Trả về dữ liệu các sản phẩm theo định dạng như JSON, XML,...
              });
            });
        })
        .catch(function (error) {
          console.error("Error:", error);
          // Xử lý lỗi nếu có
          res.status(500).send("Internal Server Error");
        });
    } else {
      res.redirect("/home");
    }
  } else {
    res.redirect("/home");
  }
});
product.get("/admin/list-product/:page", (req, res) => {
  if (req.session.loggin) {
    user = req.user;
    if (user.role == "admin") {
      let perPage = 8; // số lượng sản phẩm xuất hiện trên 1 page
      let page = req.params.page || 1;
      var message = req.flash("error");
      Promise.all([cates.find(), colors.find(), sizes.find(), providers.find()])
        .then(function (results) {
          // results là một mảng chứa kết quả của cả ba truy vấn
          const [catesData, colorsData, sizesData, providersData] = results;
          const cates = catesData;
          const colors = colorsData;
          const sizes = sizesData;
          const providers = providersData;
          products
            .find() // find tất cả các data
            .sort({ date: "descending" })
            .skip(perPage * page - perPage) // Trong page đầu tiên sẽ bỏ qua giá trị là 0
            .limit(perPage)
            .exec((err, data) => {
              products.countDocuments((err, count) => {
                // đếm để tính có bao nhiêu trang
                if (err) return next(err);
                res.render("admin/list-product", {
                  danhsach: data,
                  message: message,
                  cates: cates, // Chuyển dữ liệu đã xử lý vào template
                  colors: colors,
                  sizes: sizes,
                  providers: providers,
                  current: page, // page hiện tại
                  pages: Math.ceil(count / perPage),
                }); // Trả về dữ liệu các sản phẩm theo định dạng như JSON, XML,...
              });
            });
        })
        .catch(function (error) {
          console.error("Error:", error);
          // Xử lý lỗi nếu có
          res.status(500).send("Internal Server Error");
        });
    } else {
      res.redirect("/home");
    }
  } else {
    res.redirect("/home");
  }
});

product.get("/admin/insert-product", (req, res) => {
  if (req.session.loggin) {
    user = req.user;
    if (user.role == "admin") {
      var message = req.flash("error");
      Promise.all([cates.find(), colors.find(), sizes.find(), providers.find()])
        .then(function (results) {
          // results là một mảng chứa kết quả của cả ba truy vấn
          const [catesData, colorsData, sizesData, providersData] = results;
          res.render("admin/insert-product", {
            cates: catesData,
            colors: colorsData,
            sizes: sizesData,
            providers: providersData,
            message: message,
            hasErrors: message.length > 0,
          });
        })
        .catch(function (error) {
          console.error("Error:", error);
          // Xử lý lỗi nếu có
          res.status(500).send("Internal Server Error");
        });
    } else {
      res.redirect("/home");
    }
  } else {
    res.redirect("/home");
  }
});
product.post("/insert", (req, res) => {
  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      res.render("admin/insert-product", {
        message: "Không thể tải lên!!!",
      });
    } else if (err) {
      res.render("admin/insert-product", {
        message: "Định dạng file tải lên không hỗ trợ!!!",
      });
    } else {
      var product = products({
        image: req.file.filename,
        name: req.body.name,
        cateID: req.body.cateID,
        providerID: req.body.providerID,
        sizeId: req.body.sizeId,
        colorId: req.body.colorId,
        quantity: req.body.quantity,
        note: req.body.note,
        price: req.body.price,
        date: Date.now(),
      });
      product.save(function (err) {
        if (err) {
          res.render("admin/insert-product", { message: "Lỗi tải lên!!!" });
        } else {
          // res.redirect("/admin/list-product",);
          let perPage = 8; // số lượng sản phẩm xuất hiện trên 1 page
          let page = req.params.page || 1;
          Promise.all([
            cates.find(),
            colors.find(),
            sizes.find(),
            providers.find(),
          ])
            .then(function (results) {
              // results là một mảng chứa kết quả của cả ba truy vấn
              const [catesData, colorsData, sizesData, providersData] = results;
              const cates = catesData;
              const colors = colorsData;
              const sizes = sizesData;
              const providers = providersData;
              products
                .find() // find tất cả các data
                .sort({ date: "descending" })
                .skip(perPage * page - perPage) // Trong page đầu tiên sẽ bỏ qua giá trị là 0
                .limit(perPage)
                .exec((err, data) => {
                  products.countDocuments((err, count) => {
                    // đếm để tính có bao nhiêu trang
                    if (err) return next(err);
                    res.render("admin/list-product", {
                      danhsach: data,
                      message: "Thêm mới thành công",
                      cates: cates, // Chuyển dữ liệu đã xử lý vào template
                      colors: colors,
                      sizes: sizes,
                      providers: providers,
                      current: page, // page hiện tại
                      pages: Math.ceil(count / perPage),
                    }); // Trả về dữ liệu các sản phẩm theo định dạng như JSON, XML,...
                  });
                });
            })
            .catch(function (error) {
              console.error("Error:", error);
              // Xử lý lỗi nếu có
              res.status(500).send("Internal Server Error");
            });
        }
      });
    }
  });
});
product.get("/admin/edit-product/:id", (req, res) => {
  if (req.session.loggin) {
    user = req.user;
    if (user.role == "admin") {
      var message = req.flash("error");
      Promise.all([cates.find(), colors.find(), sizes.find(), providers.find()])
        .then(function (results) {
          // results là một mảng chứa kết quả của cả bốn truy vấn
          const [catesData, colorsData, sizesData, providersData] = results;
          const cates = catesData;
          const colors = colorsData;
          const sizes = sizesData;
          const providers = providersData;

          // Sau khi xử lý dữ liệu từ các truy vấn, bạn có thể tiếp tục xử lý hoặc gọi res.render()
          products.findById(req.params.id, function (err, data) {
            res.render("admin/edit-product", {
              danhsach: data,
              cates: cates, // Chuyển dữ liệu đã xử lý vào template
              colors: colors,
              sizes: sizes,
              providers: providers,
              message: message,
              hasErrors: message.length > 0,
            });
          });
        })
        .catch(function (error) {
          console.error("Error:", error);
          // Xử lý lỗi nếu có
          res.status(500).send("Internal Server Error");
        });
    } else {
      res.redirect("/home");
    }
  } else {
    res.redirect("/home");
  }
});

product.post("/edit-product", (req, res) => {
  if (req.session.loggin) {
    user = req.user;
    if (user.role == "admin") {
      upload(req, res, function (err) {
        if (!req.file) {
          products.updateOne(
            { _id: req.body.id },
            {
              $set: {
                name: req.body.name,
                cateID: req.body.cateID,
                providerID: req.body.providerID,
                sizeId: req.body.sizeId,
                colorId: req.body.colorId,
                quantity: req.body.quantity,
                note: req.body.note,
                price: req.body.price,
                date: Date.now(),
              },
            },
            function (err) {
              if (err) {
                res.redirect("/admin/edit-product");
              } else {
                let perPage = 8; // số lượng sản phẩm xuất hiện trên 1 page
                let page = req.params.page || 1;
                Promise.all([
                  cates.find(),
                  colors.find(),
                  sizes.find(),
                  providers.find(),
                ])
                  .then(function (results) {
                    // results là một mảng chứa kết quả của cả ba truy vấn
                    const [catesData, colorsData, sizesData, providersData] =
                      results;
                    const cates = catesData;
                    const colors = colorsData;
                    const sizes = sizesData;
                    const providers = providersData;
                    products
                      .find() // find tất cả các data
                      .sort({ date: "descending" })
                      .skip(perPage * page - perPage) // Trong page đầu tiên sẽ bỏ qua giá trị là 0
                      .limit(perPage)
                      .exec((err, data) => {
                        products.countDocuments((err, count) => {
                          // đếm để tính có bao nhiêu trang
                          if (err) return next(err);
                          res.render("admin/list-product", {
                            danhsach: data,
                            message: "Cập nhật thành công",
                            cates: cates, // Chuyển dữ liệu đã xử lý vào template
                            colors: colors,
                            sizes: sizes,
                            providers: providers,
                            current: page, // page hiện tại
                            pages: Math.ceil(count / perPage),
                          }); // Trả về dữ liệu các sản phẩm theo định dạng như JSON, XML,...
                        });
                      });
                  })
                  .catch(function (error) {
                    console.error("Error:", error);
                    // Xử lý lỗi nếu có
                    res.status(500).send("Internal Server Error");
                  });
              }
            }
          );
        } else {
          if (err instanceof multer.MulterError) {
            res.json({ kq: 0, errMsg: "aaaaa" });
          } else {
            products.updateOne(
              { _id: req.body.id },
              {
                image: req.file.filename,
                name: req.body.name,
                cateID: req.body.cateID,
                providerID: req.body.providerID,
                sizeId: req.body.sizeId,
                colorId: req.body.colorId,
                quantity: req.body.quantity,
                note: req.body.note,
                price: req.body.price,
                date: Date.now(),
              },
              function (err) {
                if (err) {
                  res.redirect("/admin/edit-product");
                } else {
                  let perPage = 8; // số lượng sản phẩm xuất hiện trên 1 page
                  let page = req.params.page || 1;

                  Promise.all([
                    cates.find(),
                    colors.find(),
                    sizes.find(),
                    providers.find(),
                  ])
                    .then(function (results) {
                      // results là một mảng chứa kết quả của cả ba truy vấn
                      const [catesData, colorsData, sizesData, providersData] =
                        results;
                      const cates = catesData;
                      const colors = colorsData;
                      const sizes = sizesData;
                      const providers = providersData;
                      products
                        .find() // find tất cả các data
                        .sort({ date: "descending" })
                        .skip(perPage * page - perPage) // Trong page đầu tiên sẽ bỏ qua giá trị là 0
                        .limit(perPage)
                        .exec((err, data) => {
                          products.countDocuments((err, count) => {
                            // đếm để tính có bao nhiêu trang
                            if (err) return next(err);
                            res.render("admin/list-product", {
                              danhsach: data,
                              message: "Cập nhật thành công",
                              cates: cates, // Chuyển dữ liệu đã xử lý vào template
                              colors: colors,
                              sizes: sizes,
                              providers: providers,
                              current: page, // page hiện tại
                              pages: Math.ceil(count / perPage),
                            }); // Trả về dữ liệu các sản phẩm theo định dạng như JSON, XML,...
                          });
                        });
                    })
                    .catch(function (error) {
                      console.error("Error:", error);
                      // Xử lý lỗi nếu có
                      res.status(500).send("Internal Server Error");
                    });
                }
              }
            );
          }
        }
      });
    } else {
      res.redirect("/home");
    }
  } else {
    res.redirect("/home");
  }
});
product.get("/delete-product/:id", (req, res) => {
  if (req.session.loggin) {
    products.deleteOne({ _id: req.params.id }, function (err) {
      if (err) {
        res.redirect("/admin/list-product");
      } else {
        let perPage = 8; // số lượng sản phẩm xuất hiện trên 1 page
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
              res.render("admin/list-product", {
                danhsach: data,
                message: "Xóa thành công",
                current: page, // page hiện tại
                pages: Math.ceil(count / perPage),
              }); // Trả về dữ liệu các sản phẩm theo định dạng như JSON, XML,...
            });
          });
      }
    });
  } else {
    res.redirect("/home");
  }
});
//tìm kiếm//
product.post("/Search", (req, res) => {
  if (req.session.loggin) {
    user = req.user;
    if (user.role == "admin") {
      let name = new RegExp(req.body.name, "i");
      Promise.all([cates.find(), colors.find(), sizes.find(), providers.find()])
        .then(function (results) {
          // results là một mảng chứa kết quả của cả ba truy vấn
          const [catesData, colorsData, sizesData, providersData] = results;
          const cates = catesData;
          const colors = colorsData;
          const sizes = sizesData;
          const providers = providersData;
          products
            .find({
              name: name,
            })
            .limit(8)
            .then((data) => {
              res.render("admin/Search_product", {
                danhsach: data,
                cates: cates, // Chuyển dữ liệu đã xử lý vào template
                colors: colors,
                sizes: sizes,
                providers: providers,
              });
              // console.log(data)
            })
            .catch((err) => {
              console.log(err);
            });
        })
        .catch(function (error) {
          console.error("Error:", error);
          // Xử lý lỗi nếu có
          res.status(500).send("Internal Server Error");
        });
    } else {
      let name = new RegExp(req.body.name, "i");

      Promise.all([cates.find(), colors.find(), sizes.find(), providers.find()])
        .then(function (results) {
          // results là một mảng chứa kết quả của cả ba truy vấn
          const [catesData, colorsData, sizesData, providersData] = results;
          const cates = catesData;
          const colors = colorsData;
          const sizes = sizesData;
          const providers = providersData;
          products
            .find({
              name: name,
            })
            .limit(8)
            .then((data) => {
              res.render("user/Search_product", {
                danhsach: data,
                cates: cates, // Chuyển dữ liệu đã xử lý vào template
                colors: colors,
                sizes: sizes,
                providers: providers,
              });
              // console.log(data)
            })
            .catch((err) => {
              console.log(err);
            });
        })
        .catch(function (error) {
          console.error("Error:", error);
          // Xử lý lỗi nếu có
          res.status(500).send("Internal Server Error");
        });
    }
  } else {
    let name = req.body.name;
    Promise.all([cates.find(), colors.find(), sizes.find(), providers.find()])
      .then(function (results) {
        // results là một mảng chứa kết quả của cả ba truy vấn
        const [catesData, colorsData, sizesData, providersData] = results;
        const cates = catesData;
        const colors = colorsData;
        const sizes = sizesData;
        const providers = providersData;
        products
          .find({
            name: name,
          })
          .limit(8)
          .then((data) => {
            res.render("user/Search_product", {
              danhsach: data,
              cates: cates, // Chuyển dữ liệu đã xử lý vào template
              colors: colors,
              sizes: sizes,
              providers: providers,
            });
            // console.log(data)
          })
          .catch((err) => {
            console.log(err);
          });
      })
      .catch(function (error) {
        console.error("Error:", error);
        // Xử lý lỗi nếu có
        res.status(500).send("Internal Server Error");
      });
  }
});

product.get("/download", async (req, res) => {
  try {
    let [cates, colors, sizes] = await Promise.all([
      cates.find(),
      colors.find(),
      sizes.find(),
    ]);

    const productsData = await products.find();

    const data = productsData.map(function (product) {
      let cateName;
      cates.forEach(function (cate) {
        if (product.cateID == cate._id) {
          cateName = cate.namecate;
        }
      });

      let colorNames = [];
      colors.forEach(function (color) {
        if (product.colorId.includes(color._id)) {
          colorNames.push(color.color);
        }
      });

      let sizeNames = [];
      sizes.forEach(function (size) {
        if (product.sizeId.includes(size._id)) {
          sizeNames.push(size.size);
        }
      });

      return {
        cate: cateName,
        name: product.name,
        color: colorNames.length > 0 ? colorNames.join() : "",
        size: sizeNames.length > 0 ? sizeNames.join() : "",
        note: product.note,
        quantity: product.quantity,
        price: product.price,
      };
    });

    let excel = {
      fileName: "Danhsachsanpham_",
      title: "Danh sách sản phẩm",
      titleHeadTable: [
        { key: "cate", value: "Loại sản phẩm" },
        { key: "name", value: "Tên sản phẩm" },
        { key: "color", value: "Màu sắc" },
        { key: "size", value: "Size" },
        { key: "note", value: "Mô tả" },
        { key: "quantity", value: "Số lượng" },
        { key: "price", value: "Đơn giá" },
      ],
      valueWidthColumn: [50, 100, 50, 50, 100, 50, 50],
    };

    exportExcel.exportExcel(data, excel, res, req);
  } catch (error) {
    console.error("Error:", error);
    // Xử lý lỗi nếu có
  }
});

module.exports = product;
