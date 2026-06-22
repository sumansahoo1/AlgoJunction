import formatDate from "../db/utils/formatDate.js";
import { getSubmissionsDetails, getUserByUsernameAndEmail } from "../db/mongooseClient.js";
import { questions } from "../db/data.js";

export async function getProfileDetails(req, res) {
    try {
        const username = req.user.name;
        const email = req.user.email;
        console.log(`${new Date().toLocaleString()}: Profile details fetching for username:${username} and email:${email}`);

        const totalQuestions = questions.length;
        let submissionsJson = [];
        let user = await getUserByUsernameAndEmail(username, email);

        if (user) {
            const submissionsDetails = await getSubmissionsDetails(user.submissions);

            // submissions
            submissionsDetails.forEach(submission => {
                let submissionJson = {
                    submissionTime: submission.submissionTime,
                    quesName: questions.find(question => question.id === Number(submission.questionId)).qName,
                    status: submission.result?.status ?? 'unknown'
                };
                submissionsJson.push(submissionJson);
            });

            // dates (only from accepted submissions)
            const acceptedSubmissions = submissionsDetails.filter(
                s => s.result?.status === 'accepted'
            );
            const dates = acceptedSubmissions.map(s => formatDate(s.submissionTime));

            // solved questions (only count unique questions with accepted submissions)
            let uniqueQuestionIds = new Set();
            acceptedSubmissions.forEach(s => uniqueQuestionIds.add(s.questionId));
            const solvedQuestions = uniqueQuestionIds.size;

            console.log(`${new Date().toLocaleString()}: Profile details fetched successfully`);
            res.json({ dates, totalques: totalQuestions, solvedques: solvedQuestions, submissions: submissionsJson });
        } else {
            console.log(`${new Date().toLocaleString()}: User not found`);
            res.json({ dates: [], totalques: totalQuestions, solvedques: 0, submissions: submissionsJson });
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

