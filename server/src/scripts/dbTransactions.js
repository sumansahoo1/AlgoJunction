import 'dotenv/config';
import mongoose from 'mongoose';

const uri = process.env.MONGODB_URI;
if (!uri) {
    console.error('Missing MONGODB_URI. Copy .env.example to .env and set your Atlas connection string.');
    process.exit(1);
}

mongoose.connect(uri, { dbName: 'algojunction' })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// Define a schema
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    age: { type: Number, required: true },
    email: { type: String, required: true }
});

// Create a model based on the schema
const User = mongoose.model('User', userSchema);

async function run() {
    try {
        // Create a document to insert
        const doc1 = new User({
            name: 'John Doe',
            age: 30,
            email: 'john.doe@example.com'
        });

        // Insert the first document into the collection
        const result1 = await doc1.save();
        console.log(`New listing created with the following id: ${result1._id}`);

        // Create another document to insert
        const doc2 = new User({
            name: 'Jane Smith',
            age: 25,
            email: 'jane.smith@example.com'
        });

        // Insert the second document into the collection
        const result2 = await doc2.save();
        console.log(`New listing created with the following id: ${result2._id}`);
    } catch (error) {
        console.error('Error connecting to MongoDB or inserting data:', error);
    } finally {
        // Close the connection
        await mongoose.connection.close();
    }
}

run().catch(console.error);
