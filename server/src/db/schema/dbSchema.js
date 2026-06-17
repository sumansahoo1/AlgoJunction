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


export { Submission, User };


