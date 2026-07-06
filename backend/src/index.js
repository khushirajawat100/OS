import express from 'express';
import cors from 'cors';
import apiRouter from './routes/api.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Bind API Routes
app.use('/api', apiRouter);

// Start Server
app.listen(PORT, () => {
  console.log(`OS Express backend active on port ${PORT}`);
});
