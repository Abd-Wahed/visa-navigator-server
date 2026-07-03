const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion } = require('mongodb');


app.use(cors());
app.use(express.json()); 


const uri =`mongodb+srv://mohammadwahed49_db_user:${process.env.DB_PASS}@cluster0.4j2kgvx.mongodb.net/?appName=Cluster0`;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});


async function run() {
  try {
    await client.connect(); 
    console.log("You successfully connected to MongoDB!");
    

    const visaCollection = client.db("visaNavigatorDB").collection("visas");


    app.post('/visas',async(req,res)=>{
        const newVisa = req.body;
        console.log(newVisa);
        if(newVisa.fee){
            newVisa.fee = Number(newVisa.fee);
        }
        if(newVisa.age_restriction){
            newVisa.age_restriction=Number(newVisa.age_restriction);
        }
        const result  = await visaCollection.insertOne(newVisa);
        res.send(result);
    })
   
    } catch (error) {
    console.error(error);
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Visa Navigator Server is running...');
});

app.listen(port,()=>{
    console.log(`server is running on port:${port}`)
} )