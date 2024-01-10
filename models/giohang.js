function GioHang(oldCart) {
  this.items = oldCart.items || {};
  this.TotalPrice = oldCart.TotalPrice || 0;
  this.TotalQty = oldCart.TotalQty || 0;

  this.add = function (id, item) {
    var giohang = this.items[id];

    if (!giohang) {
      giohang = this.items[id] = { item: item, qty: 0, price: 0 };
    }
    giohang.qty++;
    giohang.price = giohang.qty * giohang.item.price;
    this.TotalPrice += parseFloat(giohang.price);
    this.TotalQty++;
  };

  this.convertArray = function () {
    var arr = [];
    for (var id in this.items) {
      arr.push(this.items[id]);
    }

    return arr;
  };

  this.updateCart = function (id, qty) {
    var giohang = this.items[id];
    giohang.qty = qty;
    giohang.price = giohang.item.price * qty;
    this.TotalPrice += parseFloat(giohang.price);
    //console.log(giohang);
  };
  this.updateCart2 = function (data) {
    let total = 0
    data.forEach(element => {
      var giohang = this.items[element.item._id]
      giohang.qty = element.qty;
      giohang.price = element.price;
      total += parseFloat(giohang.price);
      this.TotalPrice= total
    });
    // var giohang = this.items[id];
    // giohang.qty = qty;
    // giohang.price = giohang.item.price * qty;
    // this.TotalPrice += parseFloat(giohang.price);
    //console.log(giohang);
  };

  this.delCart = function (id) {
    delete this.items[id];
  };
}

module.exports = GioHang;
