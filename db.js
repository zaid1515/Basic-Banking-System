
const mongoose=require('mongoose')


const database_conn=async function() {
    try {
      await mongoose.connect(process.env.MongoURL);
      console.log("Connection successful");
    } catch (err) {
      console.error('ERROR OCCURED...........\n',err);
    }
  };
  
  module.exports=database_conn;