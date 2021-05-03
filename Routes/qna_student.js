const express = require("express");
const router = express.Router();
const { QnAs_Faculty, QnAs_Student } = require("../models/qna");

// getting all student qnas
router.get("/", async (req, res) => {
    try {
        const qnas = await QnAs_Student.find();
        res.status(201).json({
            message: "All QnAs_Student fetched successfully",
            qnas: qnas,
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// getting one
router.get("/:id", getQnA_student, (req, res) => {
    res.status(201).json(res.qna);
});

//Todo: creating new one qna
router.post("/", async (req, res) => {
    const new_qna = new QnAs_Student({
        qna_faculty_id: req.body.qna_faculty_id,
        answer: req.body.answer ? req.body.answer : "",
        is_evaluated: false,
        model_marks: 0,
        query_flag: false,
        query_description: false,
        final_marks: 0,
    });

    try {
        const saved_qna = await new_qna.save();
        res.status(201).json({
            message: "QnA created successfully",
            qna: saved_qna,
        });
    } catch (err) {
        res.status(400).json({
            message: "Error! Student QnA not created",
            err: err.message,
        });
    }
});

// TODO: marks update for evalution marks by model and handle query
router.patch("/:id", getQnA_student, async (req, res) => {
    req.body.qna_faculty_id &&
        (res.qna.qna_faculty_id = req.body.qna_faculty_id);
    req.body.answer && (res.qna.answer = req.body.answer);
    req.body.is_evaluated && (res.qna.is_evaluated = req.body.is_evaluated);
    req.body.model_marks && (res.qna.model_marks = req.body.model_marks);
    req.body.query_flag && (res.qna.query_flag = req.body.query_flag);
    req.body.query_description &&
        (res.qna.query_description = req.body.query_description);
    req.body.final_marks && (res.qna.final_marks = req.body.final_marks);

    try {
        const updatedQnA = await res.qna.save();
        res.status(201).json({
            message: "QnA submitted successfully",
            qna: updatedQnA,
        });
    } catch (err) {
        res.status(400).json({
            message: "Error! QnA not submitted",
            err: err.message,
        });
    }
});

// deleteing one with id
router.delete("/:id", getQnA_student, async (req, res) => {
    try {
        await res.qna.remove();
        res.status(201).json({ message: "QnA deleted successfully" });
    } catch (err) {
        res.status(500).json({
            message: "Error! QnA not deleted",
            err: err.message,
        });
    }
});

// middleware for getting specific qna by id
async function getQnA_student(req, res, next) {
    let qna;
    try {
        qna = await QnAs_Student.findById(req.params.id);
        if (qna == null) {
            return res.status(404).json({ message: "Error! Cannot find qna" });
        }
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }

    res.qna = qna;
    next();
}

module.exports = router;
