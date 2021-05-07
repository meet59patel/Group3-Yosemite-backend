const router = require('express').Router();
const Models = require('../Models');
// const PQueue = require("p-queue");
const Queue = require('queue');
const axios = require('axios');

const queue = new Queue({ concurrency: 1 });

const NLP_URL = process.env.NLP_URL || '';

router.get('/assi/:assignmentId', async (req, res) => {
  console.log('Assignment evaluation start', req.params.assignmentId);

  const assignment = await Models.Assignments.findById(req.params.assignmentId);
  //   console.log('assignment', assignment);

  if (!assignment) {
    return res
      .status(404)
      .json({ error: 'Assignment not found in db', type: 'error' });
  }
  //   res.status(200).json({
  //     message: 'Evalution will be done soon!!',
  //   });

  // fetch faculty's submission to get question, actual answer and marks
  const faculty_submission = await Models.Submissions.findById(
    assignment.faculty_submission_id
  );
  if (!faculty_submission) {
    return res
      .status(404)
      .json({ error: 'Faculty submission not found', type: 'error' });
  }
  //
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
    if (!student_submission) continue;
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
    let total_score = 0;
    for (let qna_id of student_submission.qna_list_ids) {
      //   console.log('student qna id . =', qna_id);
      const qna = await Models.QnAs_Student.findById(qna_id);
      if (qna.evaluation_status === 'done') {
        cnt++;
      }
      if (qna.query_solved) {
        total_score = total_score + qna.final_marks;
      } else {
        total_score = total_score + qna.model_marks;
      }
    }
    student_submission.evaluated_no_qna =
      cnt > student_submission.evaluated_no_qna
        ? cnt
        : student_submission.evaluated_no_qna;
    student_submission.marks = total_score;
    await student_submission.save();
    // console.log('update submission', student_submission);
  }
  console.log('Assignment evaluation complete', req.params.assignmentId);
  res.status(200).json({
    message: 'Evalution done now!!',
  });

  //   queue.start(function (err) {
  //     if (err) throw err;
  //     console.log('all done');
  //   });
});

router.get('/sub/:facsubId/:submissionId', async (req, res) => {
  console.log('Submission evaluation start', req.params.submissionId);
//   console.log('Submission faculty start', req.params.facsubId);

  // first get one student's submission for this assignment
  const student_submission = await Models.Submissions.findById(
    req.params.submissionId
  );
  //   console.log('student_submission', student_submission);

  if (!student_submission) {
    return res
      .status(404)
      .json({ error: 'Submission does not exist', type: 'error' });
  }

  // find assignment for this
  const faculty_submission = await Models.Submissions.findById(
    req.params.facsubId
  );
  //  console.log('assignment', assignment);

  if (!faculty_submission) {
    return res.status(404).json({
      error: 'faculty submission not found in db',
      type: 'error',
    });
  }
//   console.log('faculty_submission', faculty_submission);

  let faculty_QnA = {};
  for (let qna_id of faculty_submission.qna_list_ids) {
    const qna = await Models.QnAs_Faculty.findById(qna_id);
    faculty_QnA[qna._id] = qna;
  }
  //   console.log('faculty_QnA', faculty_QnA);

  // get student's submission
  // for each submission fetch student's answers make evalution flag as in_queue
  let student_qna = [];
  for (let qna_id of student_submission.qna_list_ids) {
    const qna = await Models.QnAs_Student.findById(qna_id);
    // change status to in_queue
    // console.log('student qna . =', qna);

    if (faculty_QnA[qna.qna_faculty_id]) {
      await qna.save();
      console.log('add student in list qna id . =', qna_id);
      // create qna for queue
      let queue_qna = {};
      queue_qna['id'] = qna._id;
      queue_qna['model_ans'] = faculty_QnA[qna.qna_faculty_id].answer;
      queue_qna['max_marks'] = faculty_QnA[qna.qna_faculty_id].marks;
      queue_qna['student_ans'] = qna.answer;
      student_qna.push(queue_qna);
    }
    qna.evaluation_status = 'in_queue';
    await qna.save();
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
    // console.log('student_submission', student_submission);

    // for this submission get all student qna ids and fetch
    let cnt = 0;
    for (let qna_id of student_submission.qna_list_ids) {
      //   console.log('update sub due to student qna id . =', qna_id);
      const qna = await Models.QnAs_Student.findById(qna_id);
      if (qna.evaluation_status === 'done') cnt++;
    }
    student_submission.evaluated_no_qna =
      cnt > student_submission.evaluated_no_qna
        ? cnt
        : student_submission.evaluated_no_qna;
    await student_submission.save();
    // console.log('update submission', student_submission);
  }
  console.log('Submission evaluation complete', req.params.submissionId);
  return res
    .status(200)
    .json({ message: 'Submission evaluated successfully', type: 'success' });
});

router.get('/qna/:facsubId/:submissionId/:qnaid', async (req, res) => {
  console.log('Question evaluation start', req.params.qnaid);

  // first get one student's submission
  const student_submission = await Models.Submissions.findById(
    req.params.submissionId
  );
  // console.log('student_submission', student_submission);

  if (!student_submission) {
    return res
      .status(404)
      .json({ error: 'Submission does not exist', type: 'error' });
  }

  // find assignment for this
  const assignment = await Models.Assignments.findById(
    student_submission.assignment_id
  );
  //  console.log('assignment', assignment);

  if (!assignment) {
    return res.status(404).json({
      error: 'submission not found any related Assignment',
      type: 'error',
    });
  }

  const student_qna1 = await Models.QnAs_Student.findById(req.params.qnaid);
  if (!student_qna1) {
    return res.status(404).json({
      error: 'Student qna not found in',
      type: 'error',
    });
  }
  //   console.log('student_qna1', student_qna1);

  // fetch faculty_QnA for check
  const faculty_qna1 = await Models.QnAs_Faculty.findById(
    student_qna1.qna_faculty_id
  );
  if (!faculty_qna1) {
    return res.status(404).json({
      error: 'Faculty qna not found in',
      type: 'error',
    });
  }
  //   console.log('faculty_qna1', faculty_qna1);

  let queue_qna = {};
  queue_qna['model_ans'] = faculty_qna1.answer;
  queue_qna['max_marks'] = faculty_qna1.marks;
  queue_qna['student_ans'] = student_qna1.answer;
  //   student_qna1.push(queue_qna);

  student_qna1.evaluation_status = 'in_queue';
  await student_qna1.save();

  //   console.log('student_qna', student_qna);

  // now send request for each qna

  // console.log('get qna in NLqna', qna);
  student_qna1.evaluation_status = 'evaluating';
  await student_qna1.save();
  // send request to NLP model
  // queue.push(async () => {
  const resFromNLP = await axios.post(`${NLP_URL}/predict`, {
    model_ans: queue_qna.model_ans,
    student_ans: queue_qna.student_ans,
    max_marks: queue_qna.max_marks,
  });
//   console.log('nlp response', resFromNLP);
  const marks_by_model = resFromNLP.data.response;
  student_qna1.evaluation_status = 'done';
  student_qna1.model_marks = marks_by_model;
  await student_qna1.save();
  // done qun marks update

  // for this submission get all student qna ids and fetch
  let cnt = 0;
  for (let qna_id of student_submission.qna_list_ids) {
    //   console.log('update sub due to student qna id . =', qna_id);
    const qna = await Models.QnAs_Student.findById(qna_id);
    if (qna.evaluation_status === 'done') cnt++;
  }
  student_submission.evaluated_no_qna =
    cnt > student_submission.evaluated_no_qna
      ? cnt
      : student_submission.evaluated_no_qna;
  await student_submission.save();
  // console.log('update submission', student_submission);

    console.log('Question evaluation complete', req.params.submissionId);
  return res
    .status(200)
    .json({ message: 'QnA evaluated successfully', type: 'success' });
});

module.exports = router;
