const mongoose = require('mongoose');
require('dotenv').config();

const Jewellery = require('./models/Jewellery');

mongoose.connect(process.env.MONGO_URI).then(async () => {
    console.log("Connected to DB");

    // Find all jewellery where category is a string (not array)
    const all = await Jewellery.find({});
    let updated = 0;

    for (const jewel of all) {
        if (typeof jewel.category === 'string') {
            await Jewellery.updateOne(
                { _id: jewel._id },
                { $set: { category: [jewel.category] } }
            );
            updated++;
        } else if (Array.isArray(jewel.category) && jewel.category.length === 0) {
            await Jewellery.updateOne(
                { _id: jewel._id },
                { $set: { category: ['victorian-moissinate'] } }
            );
            updated++;
        }
    }

    console.log(`Migrated ${updated} documents - category is now an array.`);
    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});
