const axios = require('axios')
const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const app = express()
const port = process.env.PORT
require('dotenv').config()
mongoose.connect('mongodb://localhost/test', {useNewUrlParser: true})
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', function() {
  console.log('mongodb connected')
  app.listen(port, () => console.log(`LIE is listening on port ${port}!`))
})


const UserSchema = new mongoose.Schema({
    "uid" : String,
    "username" : String,
    "gecos" : String,
    "email" : String,
    "ticket": String
})
const User = mongoose.model('User', UserSchema);
const JobSchema = new mongoose.Schema({
    "name": String,
    "price": Number,
    "date": Date,
    "provider":String,
    "customer":String
})
JobSchema.index({ name: 1, date: 1 })
const Job = mongoose.model('Job', JobSchema)


app.use(bodyParser.json())
app.get('/', (req, res) => res.send('Hello World!'))
app.get('/login', async (req,res) => {
    const ticket = req.query.ticket
    console.log('Received ticket',ticket)
    try {
        const result = await axios.get('https://account.it.chula.ac.th/serviceValidation',{
            headers:{
                DeeAppId:process.env.APP_ID,
                DeeAppSecret:process.env.APP_SECRET,
                DeeTicket:ticket
            }
        })
        const userInfo = result.data
        const {uid,username,gecos,email} = userInfo
        User.findOneAndUpdate(
            {uid},
            {uid,username,gecos,email,ticket}, 
            {upsert:true,useFindAndModify:true}, 
            function(err, doc){
                if (err) return res.send(500, { error: err })
                return res.json(doc)
            })
    } catch (error) {
        console.log(error)
    }  
})
app.use((req,res,next)=>{
    const ticket = req.query.ticket
    User.findOne({ticket},(err,doc)=>{
        if (err) return res.send(500, { error: err })
        req.user = doc
        next()
    })
})
app.get('/job', (req,res) => {
    Job.find({customer:null},(err,doc)=>{
        if (err) return res.send(500, { error: err })
        res.json(doc)
    })
})
app.post('/job', (req,res) => {
    const {name,price,date} = req.body
    const job = new Job({name,price,date,provider:req.user.name,customer:null})
    job.save(err => {
        if (err) return res.send(500, { error: err })
        return res.json({ok:true})
    })
})