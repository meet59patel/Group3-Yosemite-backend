const express = require('express');
const router = express.Router();
const { Submissions } = require('../Models');

// getting all submissions
router.get('/', async (req, res) => {
  try {
    const submissions = await Submissions.find();
    res.status(201).json({
      message: 'All Submissions fetched successfully',
      submissions: submissions,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// getting one submission with id
router.get('/:id', getSubmission, (req, res) => {
  res.status(201).json(res.submission);
});

// TODO: creating new one submission
router.post('/', async (req, res) => {
  const new_submission = new Submissions({
    user_id: req.body.user_id,
    evaluated_no_qna: 0,
    marks: 0,
    qna_list_ids: [],
    assignment_id: req.body.assignment_id,
  });

  try {
    const saved_submission = await new_submission.save();
    res.status(201).json({
      message: 'Submission created successfully',
      submission: saved_submission,
    });
  } catch (err) {
    res.status(400).json({
      message: 'Error! Submission not created',
      err: err.message,
    });
  }
});

// TODO: updating one with id
router.patch('/:id', getSubmission, async (req, res) => {
  req.body.user_id != null && (res.submission.user_id = req.body.user_id);
  req.body.assignment_id != null &&
    (res.submission.assignment_id = req.body.assignment_id);
  req.body.evaluated_no_qna != null &&
    (res.submission.evaluated_no_qna = req.body.evaluated_no_qna);
  req.body.marks != null && (res.submission.marks = req.body.marks);
  req.body.qna_list_ids != null &&
    (res.submission.qna_list_ids = req.body.qna_list_ids);

  // TODO: write to add list of ids
  if (req.body.push_qna_list_ids != null) {
    let index_of_found = res.submission.qna_list_ids.indexOf(
      req.body.push_qna_list_ids
    );
    if (index_of_found === -1) {
      res.submission.qna_list_ids.push(req.body.push_qna_list_ids);
    }
  }

  // TODO: write to remove list of ids
  if (req.body.remove_qna_list_ids != null) {
    res.submission.qna_list_ids = res.submission.qna_list_ids.filter((ids) => {
      return ids != req.body.remove_qna_list_ids;
    });
  }

  try {
    const updatedSubmission = await res.submission.save();
    res.status(201).json({
      message: 'Submission updated successfully',
      submission: updatedSubmission,
    });
  } catch (err) {
    res.status(400).json({
      message: 'Error! Submission not updated',
      err: err.message,
    });
  }
});

// deleteing one with id
router.delete('/:id', getSubmission, async (req, res) => {
  try {
    await res.submission.remove();
    res.status(201).json({ message: 'Submission deleted successfully' });
  } catch (err) {
    res.status(500).json({
      message: 'Error! Submission not deleted',
      err: err.message,
    });
  }
});

// middleware for getting specific submission by id
async function getSubmission(req, res, next) {
  let submission;
  try {
    submission = await Submissions.findById(req.params.id);
    if (submission == null) {
      return res.status(404).json({ message: 'Error! Cannot find submission' });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }

  res.submission = submission;
  next();
}

module.exports = router;
