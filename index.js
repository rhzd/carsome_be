require('dotenv').config()
const app = require("express")();
var mongoose = require("mongoose");
const http = require("http").createServer(app);
const cors = require("cors");
var Product = require("./product-model");
const io = require("socket.io")(http, {
  cors: {
    origins: [process.env.CLIENT_HOST],
  },
});
app.use(cors());
mongoose.connect(
  `mongodb+srv://${process.env.MONGODB_CONFIG}?retryWrites=true&w=majority`
); // connect to our database.

app.get("/", (req, res) => {
  res.send("200");
});

app.get("/product", (req, res) => {
  Product.find(function (err, product) {
    if (err) res.send(err);
    res.json(product);
  });
});

io.on("connection", (socket) => {
  console.log("a user connected");

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });

  socket.on("POST_REVIEW", (payload) => {
    //should be some payload validation here
    Product.findOne({ _id: payload.id }, function (err, product) {
      let index = product.reviews.findIndex((obj) => obj.user === payload.user);
      console.log(index);
      if (index < 0) {
        product.reviews.push({
          user: payload.user,
          message: payload.message,
          rating: payload.rating,
        });
      } else {
        product.reviews[index].message = payload.message;
        product.reviews[index].rating = payload.rating;
        console.log(product.reviews[index]);
        product.markModified("reviews");
      }
      product.save();
    });

    io.emit("GET_REVIEWS", payload);
  });
});

http.listen(3000, () => {
  console.log("listening on *:3000");
});
