const express = require("express");
const app = express();
const morgan = require("morgan");
require("dotenv").config();

// routes

const Landmarks=require('./routes/Landmarks')
// error handlers

const notFound=require('./middleware/notFound');
//middleware
app.use(express.json());
app.use(morgan('tiny'));
app.get('/',(req,res)=>{
  res.send('Hello world');
})
app.use('/api/v1/Landmarks',Landmarks)

app.use(notFound)

const port = process.env.PORT || 3000;
app.listen(port, () =>
  console.log(`Server is listening on port ${port}...`)
);