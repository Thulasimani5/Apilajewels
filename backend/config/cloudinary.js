const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');

dotenv.config();

// Primary default Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_1_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_1_API_KEY || process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_1_API_SECRET || process.env.CLOUDINARY_API_SECRET
});

const accounts = {
  1: {
    cloud_name: process.env.CLOUDINARY_1_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_1_API_KEY,
    api_secret: process.env.CLOUDINARY_1_API_SECRET
  },
  2: {
    cloud_name: process.env.CLOUDINARY_2_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_2_API_KEY,
    api_secret: process.env.CLOUDINARY_2_API_SECRET
  },
  3: {
    cloud_name: process.env.CLOUDINARY_3_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_3_API_KEY,
    api_secret: process.env.CLOUDINARY_3_API_SECRET
  },
  4: {
    cloud_name: process.env.CLOUDINARY_4_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_4_API_KEY,
    api_secret: process.env.CLOUDINARY_4_API_SECRET
  },
  5: {
    cloud_name: process.env.CLOUDINARY_5_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_5_API_KEY,
    api_secret: process.env.CLOUDINARY_5_API_SECRET
  }
};

const cloudNames = {
  1: process.env.CLOUDINARY_1_CLOUD_NAME,
  2: process.env.CLOUDINARY_2_CLOUD_NAME,
  3: process.env.CLOUDINARY_3_CLOUD_NAME,
  4: process.env.CLOUDINARY_4_CLOUD_NAME,
  5: process.env.CLOUDINARY_5_CLOUD_NAME
};

const getCloudinaryAccount = (category, accessoryType) => {
  let cats = [];
  if (Array.isArray(category)) cats = category;
  else if (typeof category === 'string') {
    try {
      const parsed = JSON.parse(category);
      cats = Array.isArray(parsed) ? parsed : [category];
    } catch (e) {
      cats = [category];
    }
  }

  if (cats.includes('AD Jewels')) return { account: accounts[1], accountIndex: 1 };
  if (cats.includes('victorian-moissinate')) return { account: accounts[2], accountIndex: 2 };
  if (cats.includes('Gold Antique Jewels')) return { account: accounts[3], accountIndex: 3 };
  if (cats.includes('Kundan Jewels')) return { account: accounts[4], accountIndex: 4 };
  if (cats.includes('Bangles & Bracelets') || (accessoryType && accessoryType !== '' && accessoryType !== 'null')) {
    return { account: accounts[5], accountIndex: 5 };
  }

  return { account: accounts[5], accountIndex: 5 };
};

// Custom Storage Engine for Multer to upload directly to targeted Cloudinary account
class MultiCloudinaryStorage {
  _handleFile(req, file, cb) {
    const { category, accessoryType } = req.body;
    const { account } = getCloudinaryAccount(category, accessoryType);

    const isVideo = file.mimetype && file.mimetype.startsWith('video');
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        cloud_name: account.cloud_name,
        api_key: account.api_key,
        api_secret: account.api_secret,
        folder: 'apila_jewels',
        resource_type: isVideo ? 'video' : 'image'
      },
      (error, result) => {
        if (error) return cb(error);
        cb(null, {
          path: result.secure_url,
          size: result.bytes,
          filename: result.public_id,
          mimetype: file.mimetype
        });
      }
    );

    file.stream.pipe(uploadStream);
  }

  _removeFile(req, file, cb) {
    cb(null);
  }
}

const upload = multer({ storage: new MultiCloudinaryStorage() });

module.exports = {
  cloudinary,
  accounts,
  cloudNames,
  getCloudinaryAccount,
  upload
};
