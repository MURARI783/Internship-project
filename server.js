const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sahrudaya';

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

const contactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const Contact = mongoose.model('Contact', contactSchema);

mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log('MongoDB connected:', MONGODB_URI))
  .catch((err) => console.error('MongoDB connection error:', err));

app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, message, captchaAnswer } = req.body;
    if (!name || !email || !message || !captchaAnswer) {
      return res.status(400).json({ status: 'error', message: 'Missing required fields' });
    }

    // Simple server-side fallback validation for captcha answer format
    if (!/^[0-9]+$/.test(captchaAnswer)) {
      return res.status(400).json({ status: 'error', message: 'Invalid captcha answer' });
    }

    const contact = new Contact({ name, email, message });
    await contact.save();

    return res.json({ status: 'ok' });
  } catch (error) {
    console.error('Contact submit error:', error);
    return res.status(500).json({ status: 'error', message: 'Server error' });
  }
});

app.get('/api/contacts', async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    return res.json(contacts);
  } catch (error) {
    console.error('Fetch contacts error:', error);
    return res.status(500).json({ status: 'error', message: 'Server error' });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});
