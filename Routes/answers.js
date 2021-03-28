const router = require('express').Router();

const Models = require('../Models');

// POST for saving answer to a question
router.post('/', async (req, res, next) => {
  try {
    const answer = new Models.Answer({
      studentID: req.body.studentID,
      questionID: req.body.questionID,
      questionPaperID: req.body.questionPaperID,
      ans: req.body.ans,
      marks_by_model: req.body.marks_by_model,
      final_marks: req.body.final_marks,
      is_evaluted: req.body.is_evaluted,
      query_flag: req.body.query_flag,
    });
    await answer.save();
    if (!answer) throw new Error('Server is down');
    res.status(201).json({
      message: 'Answer Saved',
      answer,
    });
  } catch (err) {
    res.status(500).json({ error: err });
  }
});

module.exports = router;
