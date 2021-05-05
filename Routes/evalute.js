const router = require("express").Router();
const Models = require("../Models");
// const PQueue = require("p-queue");
const axios = require("axios");

const queue = new PQueue({ concurrency: 1 });

router.get("/:assignmentId", async (req, res) => {
    try {
        // get assi with id
        const assignment = await Models.Assignments.findById(
            req.params.assignmentId
        );
        res.status(200).json({
            message: "Evalution will be done soon!!",
        });

        // fetch faculty's submission to get question, actual answer and marks
        const faculty_submission = await Models.Submissions.findById(
            assignment.faculty_submission_id
        );
        let faculty_QnA = {};
        for (let qna_id of faculty_submission) {
            const qna = await Models.QnAs_Faculty.findById(qna_id);
            faculty_QnA[qna._id] = qna;
        }

        // get all student's submission from submission_list_ids
        // for each submission fetch student's answers make evalution flag as in_queue
        let student_qna = [];
        const submission_list_ids = assignment.submission_list_ids;
        for (let i = 0; i < submission_list_ids.length; i++) {
            // first get one student's submission for this assignment
            const student_submission = await Models.Submissions.findById(
                submission_list_ids[i]
            );
            // for this submission get all student qna ids and fetch
            for (let qna_id of student_submission) {
                const qna = await Models.QnAs_Student.findById(qna_id);
                // change status to in_queue
                qna.evaluation_status = "in_queue";
                await qna.save();
                // create qna for queue
                let queue_qna = {};
                queue_qna["id"] = qna._id;
                queue_qna["model_ans"] = faculty_QnA[qna._id].answer;
                queue_qna["max_marks"] = faculty_QnA[qna._id].marks;
                queue_qna["student_ans"] = qna.answer;
                student_qna.push(queue_qna);
            }
        }

        // now send request for each qna
        for (let NLPqna of queue) {
            // get each qna from student_qna make thier status as in_progress
            const qna = await Models.QnAs_Student.findById(NLPqna.id);
            qna.evaluation_status = "evaluating";
            await qna.save();
            // send request to NLP model
            queue.add(async () => {
                const resFromNLP = await axios.post(
                    "https://a514d896cb0b.ngrok.io/predict",
                    {
                        model_ans: NLPqna.model_ans,
                        student_ans: NLPqna.student_ans,
                        max_marks: NLPqna.max_marks,
                    }
                );
                const marks_by_model = resFromNLP.response;
                qna.evaluation_status = "done";
                qna.model_marks = marks_by_model;
                await qna.save();
            });
        }
    } catch (error) {
        res.status(404).json({
            error,
        });
    }
});

module.exports = router;
