const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost/proyecto");
const multer = require("multer");
// const upload = multer({ dest: "public/" });

function randomID(){
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, __dirname + '/public')
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + randomID() + '.jpg')
  }
})
 
var upload = multer({ storage: storage })
app.use('/assets/', express.static(__dirname + '/public'))


let productModel = new mongoose.Schema({
  nombre: { type: String, required: true },
  precio: Number,
  descripcion: String,
  color: String,
  url: String,
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "comments"
  }]
});

let commentModel = new mongoose.Schema({
  comment: { type: String, required: true },
  puntaje: {type: Number, enum: [1,2,3,4,5]},
})

let Products = mongoose.model("products", productModel);
let Comments = mongoose.model("comments", commentModel);

app.set("view engine", "ejs");

app.get("/", function(req, res) {
  Products.find({}, (err, result) => {
    res.render("products.ejs", { listProduct: result });
  });
});

app.get("/item/:id", function(req, res) {
  Products.findById(req.params.id, (err, result) => {
    res.render("item", { item: result });
  });
});

app.get("/create", function(req, res) {
  const product = {
    _id: 0,
    nombre: "",
    precio: 0,
    descripcion: "",
    color: "",
    url: "",
  };
  res.render("form", { item: product });
});

app.get("/update/:id", function(req, res) {
  Products.findById(req.params.id, (err, result) => {
    res.render("form", { item: result });
  });
});

app.post("/createOrUpdate/:id", upload.single("imgProduct"), function(req, res) {
  let id = req.params.id;
  let product = Object.assign(req.body ,{url: 'assets/' +req.file.filename})
  if (id == 0) {
    Products.create(product, (err, result) => {
      res.redirect("/");
    });
  } else {
    Products.update({ _id: id }, product, (err, result) => {
      res.redirect("/");
    });
  }
});

app.get("/delete/:id", function(req, res) {
  Products.deleteOne({ _id: req.params.id }, (err, result) => {
    res.redirect("/");
  });
});

app.listen(3000, () => console.log("port 3000"));