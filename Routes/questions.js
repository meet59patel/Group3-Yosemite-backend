const router = require('express').Router();

const Models = require('../Models');

// Get the all Questions
router.get('/', async (req, res, next) => {
  try {
    const questions = await Models.Question.find({});
    if (!questions) throw new Error('Invalid request');
    res.status(200).json(questions);
  } catch (err) {
    res.status(500).json({ error: err });
  }
});

// Get the all Questions by QuestionPaperID
router.get('/paperid/:qpaperID', async (req, res, next) => {
  try {
    const questions = await Models.Question.find({
      questionPaperID: req.params.qpaperID,
    });
    if (!questions) throw new Error('Invalid request');
    res.status(200).json(questions);
  } catch (err) {
    res.status(500).json({ error: err });
  }
});

// POST for creating new question
router.post('/', async (req, res, next) => {
  try {
    const question = new Models.Question({
      questionPaperID: req.body.questionPaperID,
      question: req.body.question,
      ansByFaculty: req.body.ansByFaculty,
      marks: req.body.marks,
    });
    await question.save();
    if (!question) throw new Error('Server is down');
    res.status(201).json({
      message: 'Question created',
      question,
    });
  } catch (err) {
    res.status(500).json({ error: err });
  }
});

module.exports = router;
