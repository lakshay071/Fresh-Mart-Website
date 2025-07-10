const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Unified User List
let users = [
  { id: 1, username: 'user1', password: 'pass123', cart: [] },
  { id: 2, username: 'user2', password: 'word123', cart: [] }
];

// Product Data
let products = [
  { id: 1, name: 'Apple', price: 0.5, stock: 100 },
  { id: 2, name: 'Banana', price: 0.3, stock: 120 },
  { id: 3, name: 'Milk', price: 1.2, stock: 50 }
];

// Predefined OTPs
const otpList = ['4321', '5678', '9012', '3456', '7890'];
console.log("Stored OTPs:", otpList);

// Login Page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Login POST
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);

  if (user) {
    res.redirect('/home.html');
  } else {
    res.send('<h3 style="color:red; text-align:center;">Invalid credentials. Please <a href="/">try again</a>.</h3>');
  }
});

// Product APIs
app.get('/products', (req, res) => res.json(products));

app.get('/products/:id', (req, res) => {
  const product = products.find(p => p.id == req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json(product);
});

// Cart APIs
app.get('/users/:id/cart', (req, res) => {
  const user = users.find(u => u.id == req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user.cart);
});

app.post('/users/:id/cart', (req, res) => {
  const user = users.find(u => u.id == req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const { productId, quantity } = req.body;
  const product = products.find(p => p.id == productId);
  if (!product || product.stock < quantity) {
    return res.status(400).json({ error: 'Product unavailable or insufficient stock' });
  }

  const cartItem = user.cart.find(item => item.productId === productId);
  if (cartItem) {
    cartItem.quantity += quantity;
  } else {
    user.cart.push({ productId, quantity });
  }

  res.json({ message: 'Added to cart', cart: user.cart });
});

// Checkout
app.post('/users/:id/checkout', (req, res) => {
  const user = users.find(u => u.id == req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  let total = 0;
  for (const item of user.cart) {
    const product = products.find(p => p.id == item.productId);
    if (!product || product.stock < item.quantity) {
      return res.status(400).json({ error: 'Product unavailable or insufficient stock' });
    }
    total += product.price * item.quantity;
  }

  for (const item of user.cart) {
    const product = products.find(p => p.id == item.productId);
    product.stock -= item.quantity;
  }

  user.cart = [];
  res.json({ message: 'Checkout successful', total });
});

// Payment
app.post('/pay', (req, res) => {
  const { payment_method } = req.body;
  if (payment_method === "Cash on Delivery") {
    res.redirect('/thankyou.html');
  } else {
    res.redirect('/otp.html');
  }
});

// OTP Verification
app.post('/verify-otp', (req, res) => {
  const { otp } = req.body;
  console.log("Received OTP:", otp);

  if (otpList.includes(otp)) {
    res.redirect('/thankyou.html');
  } else {
    res.send('<h3 style="color:red; text-align:center;">Invalid OTP. Please go back and try again.</h3>');
  }
});

// 404 Fallback
app.use((req, res) => {
  res.status(404).send('<h2 style="text-align:center;">404 - Page Not Found</h2>');
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
