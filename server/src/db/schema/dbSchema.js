import mongoose from 'mongoose';

// Define the submission schema
const submissionSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    questionId: { type: String, required: true },
    code: { type: String, required: true },
    language: { type: String, required: true },
    submissionTime: { type: Date, default: Date.now },
    result: {
        status: { type: String },
        output: { type: String },
        error: { type: String }
    },
    testCaseResults: [
        {
            testCaseId: { type: String },
            status: { type: String },
            output: { type: String }
        }
    ]
});

// Create the Submission model
const Submission = mongoose.model('Submission', submissionSchema);

// Define the user schema
const userSchema = new mongoose.Schema({

    username: { type: String },
    email: { type: String },
    submissions: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Submission'
        }
    ],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Middleware to update the updatedAt field before saving
userSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

// Create the User model
const User = mongoose.model('User', userSchema);

// Define the question schema
const questionSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true },
    qName: { type: String, required: true },
    qDifficulty: { type: String, required: true, enum: ['Easy', 'Medium', 'Hard'] },
    qDescription: { type: String, required: true },
    qAssumptions: { type: String, default: '' },
    examples: [
        {
            input: { type: String },
            output: { type: String },
        },
    ],
    inputs: [
        {
            input: { type: String },
            expectedOutput: { type: String },
        },
    ],
    constraints: { type: String, default: '' },
    code: { type: String, required: true },
}, {
    timestamps: true,
    toJSON: {
        transform(doc, ret) {
            delete ret._id;
            delete ret.__v;
            return ret;
        },
    },
});

// Create the Question model
const Question = mongoose.model('Question', questionSchema);

// Compound text index for search — enables $text queries across name and description
questionSchema.index(
    { qName: 'text', qDescription: 'text' },
    { name: 'question_text_search' },
);

export { Submission, User, Question };


