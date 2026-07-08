const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

app.use(cors());
app.use(express.json()); 

const uri = `mongodb+srv://mohammadwahed49_db_user:${process.env.DB_PASS}@cluster0.4j2kgvx.mongodb.net/?appName=Cluster0`;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// কালেকশন ভ্যারিয়েবলগুলো গ্লোবালি ডিক্লেয়ার করে রাখা
// let visaCollection;
// let applicatinCollection;


const db = client.db("visaNavigatorDB");

// async function run() {
//   try {
//     // সার্ভারলেস এনভায়রনমেন্টে প্রতি রিকোয়েস্টে যেন নতুন কানেকশন ডেডলক না হয়
//     await client.connect(); 
//     console.log("You successfully connected to MongoDB!");
    
//     // ডাটাবেজ ও কালেকশন অ্যাসাইন করা
//     // visaCollection = client.db("visaNavigatorDB").collection("visas");
//     // applicatinCollection = client.db("visaNavigatorDB").collection("applications");

//   } catch (error) {
//     console.error(error);
//   }
// }
// run().catch(console.dir);

// 🌐 সব এপিআই রাউট থাকবে run() ফাংশনের বাইরে, নিচে সরাসরি app স্কোপে:

app.get('/latest-visa', async (req, res) => {
    try {
        const visaCollection = db.collection("visas");
        const result = await visaCollection.find().sort({ _id: -1 }).limit(6).toArray();
        res.send(result);
    } catch (err) { res.status(500).send(err); }
});

app.get('/visas', async (req, res) => {
    try {
        const visaCollection = db.collection("visas");
        const visaType = req.query.visaType; 
        let query = {};
        if (visaType) {
            query = { visa_type: visaType };
        }
        const result = await visaCollection.find(query).toArray();
        res.send(result);
    } catch (err) { res.status(500).send(err); }
});

app.get('/my-added-visas', async (req, res) => {
    try {
        const visaCollection = db.collection("visas");
        const email = req.query.email;
        if (!email) return res.status(400).send({ message: "Email parameter needed" });
        const query = { user_email: email };
        const result = await visaCollection.find(query).toArray();
        res.send(result);
    } catch (err) { res.status(500).send(err); }
});

app.delete('/visas/:id', async (req, res) => {
    try {
        const visaCollection = db.collection("visas");
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await visaCollection.deleteOne(query);
        if (result.deletedCount === 0) return res.status(400).send({ message: "not found any data for delete" });
        res.send(result);
    } catch (err) { res.status(500).send(err); }
});

app.get('/visas/:id', async (req, res) => {
    try {
        const visaCollection = db.collection("visas");
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await visaCollection.findOne(query);
        res.send(result);
    } catch (err) { res.status(500).send(err); }
});

app.put('/visas/:id', async (req, res) => {
    try {
        const visaCollection = db.collection("visas");
        const id = req.params.id;
        const updatedVisaData = req.body;
        const filter = { _id: new ObjectId(id) };

        if (updatedVisaData.fee) updatedVisaData.fee = Number(updatedVisaData.fee);
        if (updatedVisaData.age_restriction) updatedVisaData.age_restriction = Number(updatedVisaData.age_restriction);

        const updateDoc = { $set: updatedVisaData };
        const result = await visaCollection.updateOne(filter, updateDoc);
        res.send(result);
    } catch (err) { res.status(500).send(err); }
});

app.post('/visas', async (req, res) => {
    try {
        const visaCollection = db.collection("visas");
        const newVisa = req.body;
        if (newVisa.fee) newVisa.fee = Number(newVisa.fee);
        if (newVisa.age_restriction) newVisa.age_restriction = Number(newVisa.age_restriction);
        const result = await visaCollection.insertOne(newVisa);
        res.send(result);
    } catch (err) { res.status(500).send(err); }
});

app.post('/application', async (req, res) => {
    try {
        const applicatinCollection = db.collection("applications");
        const application = req.body;
        const result = await applicatinCollection.insertOne(application);
        res.send(result);
    } catch (err) { res.status(500).send(err); }
});

app.get('/application', async (req, res) => {
    try {
        const applicatinCollection = db.collection("applications");
        const email = req.query.email;
        const searchCountry = req.query.search;
        let query = { email: email };
        if (searchCountry) {
            query.country_name = { $regex: searchCountry, $options: 'i' };
        }
        const result = await applicatinCollection.find(query).toArray();
        res.send(result);
    } catch (err) { res.status(500).send(err); }
});

app.delete('/applications/:id', async (req, res) => {
    try {
        const applicatinCollection = db.collection("applications");
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await applicatinCollection.deleteOne(query);
        res.send(result);
    } catch (err) { res.status(500).send(err); }
});

app.get('/', (req, res) => {
  res.send('Visa Navigator Server is running...');
});

app.listen(port, () => {
    console.log(`server is running on port:${port}`);
});