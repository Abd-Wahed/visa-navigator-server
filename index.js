const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


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
    const applicatinCollection = client.db("visaNavigatorDB").collection("applications");

    app.get('/latest-visa',async(req,res)=>{
        const result = await visaCollection
            .find()
            .sort({ _id: -1 })
            .limit(6)
            .toArray();
        res.send(result)
    })

    app.get('/visas',async(req,res)=>{
        const visaType = req.query.visaType; 
        let query = {};

        if (visaType) {
            query = { visa_type: visaType };
        }

        const result = await visaCollection.find(query).toArray();
        res.send(result);
    })

    app.get('/my-added-visas',async(req,res)=>{
        const email = req.query.email;

        if(!email){
            return res.status(400).send({message:"Email parameter needed"});
        }
        const query = {user_email : email}
        
        const result = await visaCollection.find(query).toArray();
        res.send(result);
    })

   

    app.delete('/visas/:id',async(req,res)=>{
        const id = req.params.id;

        const query = {_id:new ObjectId(id)};

        const result = await visaCollection.deleteOne(query);

        if(result.deletedCount === 0){
            return res.status(400).send({message:"not found any data for delete"})
        }
        res.send(result);
    })

    app.get('/visas/:id',async(req,res)=>{
       const id = req.params.id;
       const query = { _id: new ObjectId(id) };
       const result = await visaCollection.findOne(query);
    //    if (!result) {
    //         return res.status(404).send({ message: "There is no Visa" });
    //     }
        res.send(result);
    })

    // add visa theke pawa card e update er jnn
    app.put('/visas/:id',async(req,res)=>{
        const id = req.params.id;
        const updatedVisaData = req.body;

        const filter = {_id : new ObjectId(id)};

        if(updatedVisaData.fee){
            updatedVisaData.fee = Number(updatedVisaData.fee);
        }
        if(updatedVisaData.age_restriction){
            updatedVisaData.age_restriction=Number(updatedVisaData.age_restriction);
        }

        const updateDoc = {
            $set:updatedVisaData
        }

        const result = await visaCollection.updateOne(filter,updateDoc);
        res.send(result);
    })

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

    // post application abedon joma dewa
    // abedon joma newa
    app.post('/application',async(req,res)=>{
        const application = req.body;
        const result = await applicatinCollection.insertOne(application);
        res.send(result);
    })

    // nijer abedon dekha r search  er jnne
    app.get('/application',async(req,res)=>{
        const email = req.query.email;
        const searchCountry = req.query.search;

        let query = {email:email};
        if(searchCountry){
            query.country_name = {
                $regex:searchCountry,
                $option:'i'
            };
        }
        const result = await applicatinCollection.find(query).toArray();
        res.send(result);
    })

    app.delete('/applications/:id',async(req,res)=>{
        const id = req.params.id;
        const query = {_id : new ObjectId(id)};

        const result = await applicatinCollection.deleteOne(query);
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