const mongoose = require('mongoose');
require('dotenv').config();

const Jewellery = require('./models/Jewellery');
const Category = require('./models/Category'); // assuming this exists

mongoose.connect(process.env.MONGO_URI).then(async () => {
    console.log("Connected to DB");
    
    // Update Jewellery collection categories
    const res1 = await Jewellery.updateMany(
        { category: { $in: ['moissinate', 'Moissinate Jewels', 'Moissanite'] } },
        { $set: { category: 'victorian-moissinate' } }
    );
    console.log('Updated Jewellery categories:', res1.modifiedCount);

    // Delete removed categories
    if (Category) {
        const res2 = await Category.deleteMany({
            name: { $in: ['AD Bangles', 'Gold Bangles', 'Accessories', 'AD bangles', 'Gold bangles', 'Bangles'] }
        });
        console.log('Deleted categories:', res2.deletedCount);

        // Rename Moissinate Jewels to victorian-moissinate in Category collection
        const res3 = await Category.updateOne(
            { name: { $in: ['Moissinate Jewels', 'Moissanite', 'moissinate'] } },
            { $set: { name: 'victorian-moissinate' } }
        );
        console.log('Renamed category to victorian-moissinate:', res3.modifiedCount);
    }

    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});
