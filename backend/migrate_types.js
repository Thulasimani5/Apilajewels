const mongoose = require('mongoose');
require('dotenv').config();

const Jewellery = require('./models/Jewellery');

mongoose.connect(process.env.MONGO_URI).then(async () => {
    console.log("Connected to DB for Migration");

    const allJewels = await Jewellery.find({});
    
    let updated = 0;
    for (let jewel of allJewels) {
        // Move any old 'type' values that are actually occasions into the 'occasion' array
        const oldOccasions = ["Bridal Set", "Bridal Maid", "Designer", "Reception", "Party Wear", "Small Jewel"];
        let needsUpdate = false;
        
        let newType = [...jewel.type];
        let newOccasion = [...jewel.occasion];
        
        // Check old 'type' array for occasion strings
        for (let oldT of jewel.type) {
            if (oldOccasions.includes(oldT)) {
                if (!newOccasion.includes(oldT)) {
                    newOccasion.push(oldT);
                }
                newType = newType.filter(t => t !== oldT);
                needsUpdate = true;
            }
        }
        
        // Also check if they had string instead of array in DB sometimes
        if (typeof jewel.type === 'string' && oldOccasions.includes(jewel.type)) {
             if (!newOccasion.includes(jewel.type)) {
                 newOccasion.push(jewel.type);
             }
             newType = [];
             needsUpdate = true;
        }

        if (needsUpdate) {
            await Jewellery.updateOne({ _id: jewel._id }, { $set: { type: newType, occasion: newOccasion } });
            updated++;
        }
    }
    
    console.log(`Migrated ${updated} jewellery items.`);
    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});
