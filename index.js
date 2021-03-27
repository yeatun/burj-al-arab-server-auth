const express = require('express')

const cors = require ('cors')
const admin = require ('firebase-admin');
require('dotenv').config()
console.log(process.env.DB_PASS);
const port = 5000


const app = express()


app.use(cors());
app.use(express.json());




var serviceAccount = require("./configs/burj-al-arab-36e13-firebase-adminsdk-8plxj-e800cae7b2.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});




const MongoClient = require('mongodb').MongoClient;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ggzrw.mongodb.net/burjAlArab?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const bookings = client.db("burjAlArab").collection("bookings");
  console.log("db connected successfully");
  
  app.post ('/addBooking',(req,res)=>{
      const newBooking =req.body;
      bookings.insertOne(newBooking)
      .then (result =>{
        res.send(result.insertedCount > 0);

      })
      console.log(newBooking);
  })

app.get('/bookings', (req, res) => {
        const bearer = req.headers.authorization;
        if (bearer && bearer.startsWith('Bearer ')) {
            const idToken = bearer.split(' ')[1];
            admin.auth().verifyIdToken(idToken)
                .then(function (decodedToken) {
                    const tokenEmail = decodedToken.email;
                    const queryEmail = req.query.email;
                    if (tokenEmail == queryEmail) {
                        bookings.find({ email: queryEmail})
                            .toArray((err, documents) => {
                                res.status(200).send(documents);
                            })
                    }
                    else{
                        res.status(401).send('un-authorized access')
                    }
                }).catch(function (error) {
                    res.status(401).send('un-authorized access')
                });
        }
        else{
            res.status(401).send('un-authorized access')
        }
    })
});


app.get('/', (req, res) => {
  res.send('Hello World!')
})



app.listen(port)