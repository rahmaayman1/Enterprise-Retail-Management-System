const allowedOrigins=require("./allowedOrigins");

const corsOptions = {
  origin: true,
  credentials: true,
  optionsSuccessStatus: 200
};
module.exports=corsOptions;