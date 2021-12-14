require("dotenv").config();
const express = require("express");
const app = express();
const server = require("http").createServer(app);
const cors = require("cors");
var ProductModel = require("./models/product");
const product = require("./api/product");

const io = require("socket.io")(server, {
  cors: {
    origins: [process.env.CLIENT_HOST],
  },
});
app.use(cors());

app.use(express.json({ extended: false }));

app.use("/api/product", product);
io.on("connection", (socket) => {
  console.log("a user connected");

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });

  socket.on("POST_REVIEW", (payload) => {
    //should be some payload validation here
    ProductModel.findOne({ _id: payload.id }, function (err, product) {
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
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server is running in port ${PORT}`));
