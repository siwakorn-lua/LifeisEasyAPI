const axios = require('axios')
const express = require('express')
const app = express()
const port = process.env.PORT
require('dotenv').config()

app.get('/', (req, res) => res.send('Hello World!'))
app.get('/login', async (req,res) => {
    const ticket = req.query.ticket
    const result = await axios.get('https://account.it.chula.ac.th/serviceValidation',{
        headers:{
            DeeAppId:process.env.APP_ID,
            DeeAppSecret:process.env.APP_SECRET,
            DeeTicket:ticket
        }
    })
    return res.json(result.data)
})
app.listen(port, () => console.log(`Example app listening on port ${port}!`))
