const express = require('express');
const router = express.Router();
const { QnAs_Faculty } = require('../Models');

// getting all faculty qnas
router.get('/', async (req, res) => {
  try {
    const qnas = await QnAs_Faculty.find();
    res.status(201).json({
      message: 'All Faculty QnAs fetched successfully',
      qnas: qnas,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// getting one with id
router.get('/:id', getQnA_faculty, (req, res) => {
  res.status(201).json(res.qna);
});

// TODO: creating new one qna
router.post('/', async (req, res) => {
  const new_qna = new QnAs_Faculty({
    question: req.body.question,
    answer: req.body.answer,
    marks: req.body.marks,
  });

  try {
    const saved_qna = await new_qna.save();
    res.status(201).json({
      message: 'QnA created successfully',
      qna: saved_qna,
    });
  } catch (err) {
    res.status(400).json({
      message: 'Error! QnA not created',
      err: err.message,
    });
  }
});

// update one with id
router.patch('/:id', getQnA_faculty, async (req, res) => {
  req.body.question && (res.qna.question = req.body.question);
  req.body.answer && (res.qna.answer = req.body.answer);
  req.body.marks && (res.qna.marks = req.body.marks);

  try {
    const updatedQnA = await res.qna.save();
    res.status(201).json({
      message: 'QnA updated successfully',
      qna: updatedQnA,
    });
  } catch (err) {
    res.status(400).json({
      message: 'Error! QnA not updated',
      err: err.message,
    });
  }
});

// deleteing one with id
router.delete('/:id', getQnA_faculty, async (req, res) => {
  try {
    await res.qna.remove();
    res.status(201).json({ message: 'QnA deleted successfully' });
  } catch (err) {
    res.status(500).json({
      message: 'Error! QnA not deleted',
      err: err.message,
    });
  }
});

// middleware for getting specific qna by id
async function getQnA_faculty(req, res, next) {
  let qna;
  try {
    qna = await QnAs_Faculty.findById(req.params.id);
    if (qna == null) {
      return res.status(404).json({ message: 'Error! Cannot find qna' });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }

  res.qna = qna;
  next();
}

module.exports = router;
