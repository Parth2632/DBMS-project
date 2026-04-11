const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { errorHandler, notFound } = require('./middlewares/errorHandler');

dotenv.config();

const app = express();

const visitorRoutes = require('./routes/visitorRoutes');
const hostRoutes = require('./routes/hostRoutes');
const visitRequestRoutes = require('./routes/visitRequestRoutes');
const entryExitRoutes = require('./routes/entryExitRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL || '*' 
    : ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
  res.send('Visitor Access Management System API is running');
});

app.use('/api/visitors', visitorRoutes);
app.use('/api/hosts', hostRoutes);
app.use('/api/visit-requests', visitRequestRoutes);
app.use('/api/entry-exit', entryExitRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;