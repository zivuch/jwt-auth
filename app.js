const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const userRouter = require("./routes/userRouter.js");
const path = require("path");
// const { db } = require("./config/db.js");

const app = express();
const { PORT } = process.env;
app.listen(PORT || 5001, () => {
  console.log(`run on ${PORT || 5001}`);
});

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    credentials: true,
    origin: ['http://localhost:5173']
  })
);

app.use("/api/user", userRouter);


// Have Node serve the files for our built React app
// app.use(express.static(path.resolve(__dirname, "./client/build")));
app.use(express.static(path.join(__dirname, "/client/dist")));

// All other GET requests not handled before will return our React app
app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "./client/dist", "index.html"));
});


// async function testConnection() {
//   try {
//     const response = await db.raw("select version()");
//     console.log(response.rows);
//   } catch (error) {
//     console.log(error);
//   }
// }
// testConnection()
