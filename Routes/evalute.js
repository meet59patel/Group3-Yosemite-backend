const router = require('express').Router();
const Models = require('../Models');
// const PQueue = require("p-queue");
const Queue = require('queue');
const axios = require('axios');

const queue = new Queue({ concurrency: 1 });

const NLP_URL = process.env.NLP_URL || '';

router.get('/:assignmentId', async (req, res) => {
  //   console.log(req.params.assignmentId);
  const assignment = await Models.Assignments.findById(req.params.assignmentId);
  //   console.log('assignment', assignment);

  if (!assignment) {
    return res.status(404).json({ error: 'Assignment does not exist' });
  }
  res.status(200).json({
    message: 'Evalution will be done soon!!',
  });

  // fetch faculty's submission to get question, actual answer and marks
  const faculty_submission = await Models.Submissions.findById(
    assignment.faculty_submission_id
  );
  //   console.log('faculty_submission', faculty_submission);

  let faculty_QnA = {};
  for (let qna_id of faculty_submission.qna_list_ids) {
    const qna = await Models.QnAs_Faculty.findById(qna_id);
    faculty_QnA[qna._id] = qna;
  }
  //   console.log('faculty_QnA', faculty_QnA);

  // get all student's submission from submission_list_ids
  // for each submission fetch student's answers make evalution flag as in_queue
  let student_qna = [];
  const submission_list_ids = assignment.submission_list_ids;
  //   console.log('student submisison list', submission_list_ids);
  // run for each student submission
  for (let sub_id of submission_list_ids) {
    // first get one student's submission for this assignment
    const student_submission = await Models.Submissions.findById(sub_id);
    // console.log('student_submission', student_submission);
    // console.log('student qna list . =', student_submission.qna_list_ids);

    // for this submission get all student qna ids and fetch
    for (let qna_id of student_submission.qna_list_ids) {
      //   console.log('student qna id . =', qna_id);
      const qna = await Models.QnAs_Student.findById(qna_id);
      // change status to in_queue
      //   console.log('student qna . =', qna);

      if (faculty_QnA[qna.qna_faculty_id]) {
        await qna.save();
        // create qna for queue
        let queue_qna = {};
        queue_qna['id'] = qna._id;
        queue_qna['model_ans'] = faculty_QnA[qna.qna_faculty_id].answer;
        queue_qna['max_marks'] = faculty_QnA[qna.qna_faculty_id].marks;
        queue_qna['student_ans'] = qna.answer;
        queue_qna['submission_id'] = sub_id;
        //   console.log('queue qna !!! . = ', queue_qna);
        student_qna.push(queue_qna);
      }
      qna.evaluation_status = 'in_queue';
      await qna.save();
    }
  }
  //   console.log('student_qna', student_qna);

  // now send request for each qna
  for (let NLPqna of student_qna) {
    // get each qna from student_qna make thier status as in_progress
    const qna = await Models.QnAs_Student.findById(NLPqna.id);
    // console.log('get qna in NLqna', qna);
    qna.evaluation_status = 'evaluating';
    await qna.save();
    // send request to NLP model
    // queue.push(async () => {
    const resFromNLP = await axios.post(`${NLP_URL}/predict`, {
      model_ans: NLPqna.model_ans,
      student_ans: NLPqna.student_ans,
      max_marks: NLPqna.max_marks,
    });
    // console.log('nlp response', resFromNLP);
    const marks_by_model = resFromNLP.data.response;
    qna.evaluation_status = 'done';
    qna.model_marks = marks_by_model;
    await qna.save();
    // done qun marks update

    //   for submission field
    // console.log('student_submission id', NLPqna.submission_id);
    const student_submission = await Models.Submissions.findById(
      NLPqna.submission_id
    );
    // console.log('student_submission', student_submission);

    // for this submission get all student qna ids and fetch
    let cnt = 0;
    for (let qna_id of student_submission.qna_list_ids) {
      //   console.log('student qna id . =', qna_id);
      const qna = await Models.QnAs_Student.findById(qna_id);
      if (qna.evaluation_status === 'done') cnt++;
    }
    student_submission.evaluated_no_qna = cnt;
    await student_submission.save();
    // console.log('update submission', student_submission);
  }

  // console.log('qna', qna);
  // });

  //   queue.start(function (err) {
  //     if (err) throw err;
  //     console.log('all done');
  //   });
});

module.exports = router;
