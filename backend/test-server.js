import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

// Load environment variables
dotenv.config();

const app = express();
const PORT = 5001;

// Middlewares
app.use(cors());
app.use(express.json());

// Basic test routes
app.get('/test', (req, res) => {
  res.json({ success: true, message: 'Test endpoint is working' });
});

app.post('/chat/query', (req, res) => {
  const { message } = req.body;
  console.log('Received chat query:', message);
  
  // Echo back the message
  res.json({
    success: true,
    originalMessage: message,
    sqlQuery: 'SELECT * FROM test',
    results: [],
    response: `You said: "${message}"`
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Test server is running on port ${PORT}`);
}); 