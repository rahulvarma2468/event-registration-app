require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const QRCode = require('qrcode');

const app = express();

// Middleware
app.use(express.json());
app.use(express.static('frontend'));
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
console.log("Connected to MongoDB");

// User Schema
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  uniqueId: String,
  qrCode: String,
  scanned: { type: Boolean, default: false }
});

const User = mongoose.model('User', userSchema);
// GET /users - Get list of all registered users
app.get('/users', async (req, res) => {
  try {
    const users = await User.find({}); // Get all users
    res.json(users); // Send as JSON response
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Registration Route
app.post('/register', async (req, res) => {
  const { name, email } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) return res.status(400).send("Already registered");

  const uniqueId = require('crypto').randomBytes(8).toString('hex');
  const qrDataUrl = await QRCode.toDataURL(uniqueId);

  const newUser = new User({ name, email, uniqueId, qrCode: qrDataUrl });
  await newUser.save();

  // ✅ Add the sendQRCodeEmail call right here:
  await sendQRCodeEmail(email, qrDataUrl);

  res.json({ success: true, qrCode: qrDataUrl });
});

// Scan Route
app.post('/scan', async (req, res) => {
  const { id } = req.body;
  const user = await User.findOne({ uniqueId: id });

  if (!user) return res.status(404).json({ found: false });

  if (!user.scanned) {
    user.scanned = true;
    await user.save();
  }

  res.json({ found: !!user, scanned: user.scanned });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));