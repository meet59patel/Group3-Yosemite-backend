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

// Update Answer
router.put('/:id', async (req, res, next) => {
  try {
    const updatedAnswer = {
      ...(req.body.studentID ? { studentID: req.body.studentID } : {}),
      ...(req.body.questionID ? { questionID: req.body.questionID } : {}),
      ...(req.body.questionPaperID
        ? { questionPaperID: req.body.questionPaperID }
        : {}),
      ...(req.body.ans ? { ans: req.body.ans } : {}),
      ...(req.body.marks_by_model
        ? { marks_by_model: req.body.marks_by_model }
        : {}),
      ...(req.body.final_marks ? { final_marks: req.body.final_marks } : {}),
      ...(req.body.is_evaluted ? { is_evaluted: req.body.is_evaluted } : {}),
      ...(req.body.query_flag ? { query_flag: req.body.query_flag } : {}),
    };

    Models.Answer.findOneAndUpdate(
      { _id: req.params.id },
      {
        $set: updatedAnswer,
      },
      { new: true }
    ).then((result) => {
      res.status(201).json({
        message: 'Answer Updated!',
        updatedAnswer: result,
      });
    });
  } catch (err) {
    res.status(500).json({ error: err });
  }
});

module.exports = router;
