require("dotenv").config();
const http = require("http"); 
const express = require("express");
const sequelize = require("./db");
const PORT = process.env.PORT || 5000;
const cors = require("cors");
const fileUpload = require("express-fileupload");
const router = require("./routes/index");
const ErrorHandlingMiddleware = require("./middleware/ErrorHandlingMiddleware");
const path = require("path");
const { checkConvertVideo } = require("./service/checkConvertVideo");
const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/static", express.static(path.resolve(__dirname, "files", "images")));
app.use(fileUpload({
  defCharset: 'utf8',
  defParamCharset: 'utf8'
}));
app.use("/api", router); 
app.use(ErrorHandlingMiddleware);
 
const start = async () => {
  const httpServer = http.createServer(app);
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    httpServer.listen(PORT, () => console.log(`server started on port ${PORT}`));
    // await checkConvertVideo()
    // setInterval(async()=>{
    // }, 12 * 60 * 60 * 1000)

  } catch (error) {
    console.log(error);
  }
};  

start();

