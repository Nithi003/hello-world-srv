const express = require('express')
const mongoose = require("mongoose");
// const dns = require('dns');
const app = express()
const port = 3000

app.use(express.json())

// Force Node DNS to use public resolvers if the local resolver blocks SRV queries.
// if (!process.env.SKIP_DNS_SERVER_OVERRIDE) {
//   dns.setServers(['8.8.8.8', '8.8.4.4']);
// }

// const mongoUri = "mongodb+srv://nitheshwaran_db_user:YNb5H61z2BTgchAE@nithiworkdb.zsmspqs.mongodb.net/SampleDb?retryWrites=true&w=majority";
const mongoUri = "mongodb://nitheshwaran_db_user:YNb5H61z2BTgchAE@ac-ychyavi-shard-00-00.zsmspqs.mongodb.net:27017,ac-ychyavi-shard-00-01.zsmspqs.mongodb.net:27017,ac-ychyavi-shard-00-02.zsmspqs.mongodb.net:27017/?ssl=true&replicaSet=atlas-4so0y7-shard-0&authSource=admin&appName=NithiWorkDB";
const mongoOptions = {
  serverSelectionTimeoutMS: 10000,
};

mongoose.connect(mongoUri, mongoOptions)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => {
    console.error("❌ DB Error:", err);
    if (err.code === 'ECONNREFUSED' || err.message.includes('querySrv')) {
      console.error('> This means the SRV DNS lookup was refused.');
      console.error('> Try disabling local resolver override with SKIP_DNS_SERVER_OVERRIDE=1 or set MONGODB_URI to a direct connection string.');
      console.error('> Also verify your Atlas IP access list and network DNS settings.');
    }
  });

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  age: { type: Number, required: false },
}, { collection: 'user', timestamps: true })

const User = mongoose.model('User', userSchema)

app.post('/users', async (req, res) => {
  try {
    const user = await User.create(req.body)
    res.status(201).json(user)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

app.get('/users', async (req, res) => {
  try {
    const users = await User.find()
    res.json(users)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) return res.status(404).json({ error: 'User not found' })
    res.json(user)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

app.put('/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    if (!user) return res.status(404).json({ error: 'User not found' })
    res.json(user)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

app.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id)
    if (!user) return res.status(404).json({ error: 'User not found' })
    res.json({ message: 'User deleted' })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/ping', (req, res) => {
  res.send('Pong 🎇 , 4/7/26')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
