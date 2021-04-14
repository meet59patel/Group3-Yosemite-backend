const router = require('express').Router();

const Models = require('../Models');

// Get the all question (without answers) for given questionPaperId
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

// Update QuestionPaper
router.put('/:id', async (req, res, next) => {
  try {
    const QuestionPaper = {
      ...(req.body.facultyID ? { facultyID: req.body.facultyID } : {}),
      ...(req.body.submissionDeadline
        ? { submissionDeadline: req.body.submissionDeadline }
        : {}),
      ...(req.body.subjectName ? { subjectName: req.body.subjectName } : {}),
      ...(req.body.total ? { total: req.body.total } : {}),
    };

    Models.QuestionPaper.findOneAndUpdate(
      { _id: req.params.id },
      {
        $set: QuestionPaper,
      },
      { new: true }
    ).then((result) => {
      res.status(201).json({
        message: 'QuestionPaper Updated!',
        QuestionPaper: result,
      });
    });
  } catch (err) {
    res.status(500).json({ error: err });
  }
});

// [Frontend Handler] QuestionPaper Submit Handler
router.post('/savepaper', async (req, res, next) => {
  try {
    console.log(req.body);

    // Saving QuestionPaper
    const questionPaper = new Models.QuestionPaper({
      facultyID: req.body.facultyID,
      questionPaperDescription: req.body.assignment_description,
      submissionDeadline: req.body.date_time,
      subjectName: req.body.course,
      total: req.body.total_marks,
    });
    await questionPaper.save();
    if (!questionPaper) throw new Error('Server is down');

    // Save Individual Questions
    for (let item in req.body) {
      // console.log(item);
      if (item.includes('-question')) {
        let new_que = Models.Question({
          questionPaperID: questionPaper._id,
          question: req.body[`id${item[2]}-question`],
          ansByFaculty: req.body[`id${item[2]}-ref_answer`],
          marks: req.body[`id${item[2]}-max_score`],
        });
        await new_que.save();
        if (!new_que) {
          throw new Error(`Error in saving Question ${item[2]}`);
        } else {
          console.log(new_que._id);
        }
      }
    }

    res.status(201).json({
      message: 'QuestionPaper Saved!',
      questionPaper,
    });
  } catch (error) {
    res.status(500).json({ error: err });
  }
});

module.exports = router;
