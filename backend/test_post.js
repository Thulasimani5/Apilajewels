const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

async function runTest() {
  const form = new FormData();
  form.append('jewelId', 'TEST-1234');
  form.append('name', 'Test Jewellery');
  form.append('category', 'Moissanite');
  form.append('type', 'Bridal Set');
  form.append('price', '1000');
  form.append('deposit', '500');
  form.append('colour', 'Gold');
  form.append('description', 'Test Description');

  // Let's create a dummy image file and append it
  const dummyFile = path.join(__dirname, 'dummy.png');
  fs.writeFileSync(dummyFile, 'dummy content');
  form.append('images', fs.createReadStream(dummyFile));

  try {
    const res = await axios.post('http://localhost:5001/api/jewellery', form, {
      headers: {
        ...form.getHeaders(),
        // Since we bypass auth protection or use a token, let's see what happens.
        // Wait, the route is protected by `protect, authorize('admin')`.
        // Let's perform a login first to get the token!
      }
    });
    console.log('Success:', res.data);
  } catch (error) {
    console.error('Error Status:', error.response ? error.response.status : error.message);
    console.error('Error Data:', error.response ? error.response.data : '');
  } finally {
    if (fs.existsSync(dummyFile)) {
      fs.unlinkSync(dummyFile);
    }
  }
}

// First login to get token
async function start() {
  try {
    const loginRes = await axios.post('http://localhost:5001/api/auth/login', {
      phone: '1234567890',
      password: 'apilajewels'
    });
    const token = loginRes.data.token;
    console.log('Got token:', token);

    const form = new FormData();
    form.append('jewelId', 'TEST-1234' + Math.floor(Math.random()*1000));
    form.append('name', 'Test Jewellery');
    form.append('category', 'Moissanite');
    form.append('type', 'Bridal Set');
    form.append('price', '1000');
    form.append('deposit', '500');
    form.append('colour', 'Gold');
    form.append('description', 'Test Description');

    const dummyFile = path.join(__dirname, 'dummy.png');
    fs.writeFileSync(dummyFile, 'dummy content');
    form.append('images', fs.createReadStream(dummyFile));

    const res = await axios.post('http://localhost:5001/api/jewellery', form, {
      headers: {
        ...form.getHeaders(),
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('Success:', res.data);
    if (fs.existsSync(dummyFile)) {
      fs.unlinkSync(dummyFile);
    }
  } catch (err) {
    console.error('Login/Post failed:', err.response ? err.response.data : err.message);
  }
}

start();
