const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');

dotenv.config();

// Default fallback credentials (Account 1: AD Jewels) if env vars are missing
const defaultAccount = {
  cloud_name: process.env.CLOUDINARY_1_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME || 'l1taixkl',
  api_key: process.env.CLOUDINARY_1_API_KEY || process.env.CLOUDINARY_API_KEY || '152397527562413',
  api_secret: process.env.CLOUDINARY_1_API_SECRET || process.env.CLOUDINARY_API_SECRET || 'ld8Ka4QG7KSc7anWSwFRcZRlSmU'
};

cloudinary.config(defaultAccount);

const accounts = {
  1: {
    cloud_name: process.env.CLOUDINARY_1_CLOUD_NAME || 'l1taixkl',
    api_key: process.env.CLOUDINARY_1_API_KEY || '152397527562413',
    api_secret: process.env.CLOUDINARY_1_API_SECRET || 'ld8Ka4QG7KSc7anWSwFRcZRlSmU'
  },
  2: {
    cloud_name: process.env.CLOUDINARY_2_CLOUD_NAME || 'wz6zmdta',
    api_key: process.env.CLOUDINARY_2_API_KEY || '699777414828683',
    api_secret: process.env.CLOUDINARY_2_API_SECRET || '4i_cjHgr-ETgBdFqh0YUnfHwzTE'
  },
  3: {
    cloud_name: process.env.CLOUDINARY_3_CLOUD_NAME || 'ibt4lpq6',
    api_key: process.env.CLOUDINARY_3_API_KEY || '664525671552765',
    api_secret: process.env.CLOUDINARY_3_API_SECRET || 'mIJyaiM-Qwq6LMqiRONPFBHin8A'
  },
  4: {
    cloud_name: process.env.CLOUDINARY_4_CLOUD_NAME || 'ay9ixzta',
    api_key: process.env.CLOUDINARY_4_API_KEY || '571649416998459',
    api_secret: process.env.CLOUDINARY_4_API_SECRET || 'uY13UzUhsQQLziPxwapYqhtPVBY'
  },
  5: {
    cloud_name: process.env.CLOUDINARY_5_CLOUD_NAME || 'x10uudea',
    api_key: process.env.CLOUDINARY_5_API_KEY || '653951454214127',
    api_secret: process.env.CLOUDINARY_5_API_SECRET || 'pBGUM2eh_g0bA4q3Y5z9lu_jQE4'
  }
};

const cloudNames = {
  1: accounts[1].cloud_name,
  2: accounts[2].cloud_name,
  3: accounts[3].cloud_name,
  4: accounts[4].cloud_name,
  5: accounts[5].cloud_name
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

  let selected = { account: accounts[5], accountIndex: 5 };

  if (cats.includes('AD Jewels')) selected = { account: accounts[1], accountIndex: 1 };
  else if (cats.includes('victorian-moissinate')) selected = { account: accounts[2], accountIndex: 2 };
  else if (cats.includes('Gold Antique Jewels')) selected = { account: accounts[3], accountIndex: 3 };
  else if (cats.includes('Kundan Jewels')) selected = { account: accounts[4], accountIndex: 4 };
  else if (cats.includes('Bangles') || (accessoryType && accessoryType !== '' && accessoryType !== 'null')) {
    selected = { account: accounts[5], accountIndex: 5 };
  }

  // Safety check to ensure we never return a disabled cloud_name ('apilajewels') or undefined
  if (!selected.account || !selected.account.cloud_name || selected.account.cloud_name === 'apilajewels') {
    selected = { account: accounts[1], accountIndex: 1 };
  }

  return selected;
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
