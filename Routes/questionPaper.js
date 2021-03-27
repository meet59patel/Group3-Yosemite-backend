const router = require('express').Router();

const Models = require('../Models');

// Get the all question for given questionPaperId
router.get('/:questionPaperId', async (req, res, next) => {
  try {
    const questions = await Models.Question.find({
      questionPaperID: req.params.questionPaperId,
    });
    if (!questions) throw new Error('Invalid request');
    const result = [];
    questions.forEach((el) => {
      result.push({
        _id: el._id,
        questionPaperID: el.questionPaperID,
        question: el.question,
        marks: el.marks,
      });
    });
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err });
  }
});

// Get all question papers created by faculty.
router.get('/faculty/:facultyId', async (req, res, next) => {
  try {
    const questionPapers = await Models.QuestionPaper.find({
      facultyID: req.params.facultyId,
    }).sort({ createdAt: -1 });
    if (!questionPapers) throw new Error('Invalid request');
    res.status(200).json(questionPapers);
  } catch (err) {
    req.status(500).json({ error: err });
  }
});

// Post for creating new question paper
router.post('/', async (req, res, next) => {
  try {
    const questionPaper = new Models.QuestionPaper({
      facultyID: req.body.facultyID,
      submissionDeadline: req.body.submissionDeadline,
      subjectName: req.body.subjectName,
      total: req.body.total,
    });
    await questionPaper.save();
    if (!questionPaper) throw new Error('Server is down');
    res.status(201).json({
      message: 'Questionpaper created',
      questionPaper,
    });
  } catch (err) {
    res.status(500).json({ error: err });
  }
});

// Get the all questionpapers
router.get('/', async (req, res, next) => {
  try {
    const questionpapers = await Models.QuestionPaper.find({});
    if (!questionpapers) throw new Error('Invalid request');
    res.status(200).json(questionpapers);
  } catch (err) {
    res.status(500).json({ error: err });
  }
});

module.exports = router;
