const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const visitorRoutes = require('./routes/visitorRoutes');

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Visitor Access Management System API is running');
});
app.use('/api/visitors', visitorRoutes);

module.exports = app;