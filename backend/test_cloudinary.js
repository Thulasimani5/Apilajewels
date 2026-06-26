const cloudinary = require('cloudinary').v2;
require('dotenv').config({ path: '.env' });
cloudinary.config({ cloud_name: process.env.CLOUDINARY_CLOUD_NAME, api_key: process.env.CLOUDINARY_API_KEY, api_secret: process.env.CLOUDINARY_API_SECRET });
cloudinary.api.root_folders().then(res => console.log(res)).catch(err => console.error(err));