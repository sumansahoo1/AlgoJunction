import 'dotenv/config';
import mongoose from 'mongoose';
import { questions } from '../db/data.js';
import { Question } from '../db/schema/dbSchema.js';

const uri = process.env.MONGODB_URI;

const seedQuestions = async () => {
    try {
        await mongoose.connect(uri, { dbName: 'algojunction' });
        console.log(`${new Date().toLocaleString()}: MongoDB connected for seeding`);

        for (const question of questions) {
            const doc = await Question.findOneAndUpdate(
                { id: question.id },
                question,
                { upsert: true, new: true },
            );
            console.log(`${new Date().toLocaleString()}: Seeded question id=${doc.id} — "${doc.qName}"`);
        }

        // Ensure text search index exists (schema declaration handles this
        // on app startup, but the seed script runs standalone)
        await Question.collection.createIndex(
            { qName: 'text', qDescription: 'text' },
            { name: 'question_text_search' },
        );
        console.log(`${new Date().toLocaleString()}: Text search index ensured`);

        console.log(`${new Date().toLocaleString()}: Seed complete — ${questions.length} questions migrated`);
    } catch (error) {
        console.error(`${new Date().toLocaleString()}: Seed failed —`, error);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log(`${new Date().toLocaleString()}: MongoDB connection closed`);
    }
};

seedQuestions();
