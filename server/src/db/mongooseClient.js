import { Submission, User } from "./schema/dbSchema.js";

export async function insertNew(userId, questionId, code, language, result, testCaseResults) {
    try {
        const submissionTime = new Date();

        // Example: Create a new submission document
        const submission = new Submission({
            userId,
            questionId,
            code,
            language,
            submissionTime,
            result,
            testCaseResults
        });

        // Save the submission document
        const response = await submission.save();
        console.log(`${new Date().toLocaleString()}: Submission saved, id:`, response._id);
        return response._id;
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

export async function addOrUpdateUser(username, email, submissionId) {
    try {
        let user = await User.findOne({ email });

        if (user) {

            user.username = username || user.username;
            user.email = email || user.email;
            if (submissionId) {
                user.submissions.push(submissionId);
            }
            user.updatedAt = Date.now();
        } else {
            user = new User({
                username,
                email,
                submissions: submissionId ? [submissionId] : []
            });
        }

        const response = await user.save();
        console.log(`${new Date().toLocaleString()}: User saved/updated, id:`, response._id);
    } catch (error) {
        console.error('Error:', error);
    }
}

export async function getUserByUsernameAndEmail(username, email) {
    try {
        let users = await User.find({ email });

        if (users.length === 1) {
            return users[0];
        } else if (users.length > 1) {
            users = users.filter(user => user.username === username);
            if (users.length === 1) {
                return users[0];
            } else {
                return null;
            }
        } else {
            return null;
        }
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

export async function getSubmissionsDetails(submissionIds) {
    try {
        const submissions = await Submission.find({ _id: { $in: submissionIds } });

        if (submissions.length > 0) {
            console.log(`${new Date().toLocaleString()}: Submissions found`);

            // Map the submissions array to an array of objects containing the desired details
            const submissionDetails = submissions.map(submission => ({
                id: submission._id,
                userId: submission.userId,
                questionId: submission.questionId,
                language: submission.language,
                submissionTime: submission.submissionTime,
                result: submission.result,
                testCaseResults: submission.testCaseResults
            }));

            return submissionDetails;
        } else {
            console.log(`${new Date().toLocaleString()}: Submissions not found`);
            return [];
        }
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

