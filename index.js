const express = require("express");
const app = express();
const route=require("./route/account");

 

app.use(express.json())
app.get("/",(req,res)=>{
    res.status(200).json({"status":200,"message":"System is connected"})
})
app.use("/test",route)
app.listen(1000, () => {
    console.log("server is running");

  });
  
  