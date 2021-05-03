const express = require("express");
const router = express.Router();
const Assignments = require("../models/assignments");

// getting all assignments
router.get("/", async (req, res) => {
    try {
        const assignments = await Assignments.find();
        res.status(201).json({
            message: "All Assignments fetched successfully",
            assignments: assignments,
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// getting one assi with id
router.get("/:id", getAssignment, (req, res) => {
    res.status(201).json(res.assignment);
});

// creating one assi with data
router.post("/", async (req, res) => {
    const new_assignment = new Assignments({
        assignment_name: req.body.assignment_name,
        subject_name: req.body.subject_name,
        faculty_id: req.body.faculty_id,
        faculty_submission_id: req.body.faculty_submission_id,
        is_show: req.body.is_show,
        submission_list_ids: [],
    });

    try {
        const saved_submssion = await new_assignment.save();
        res.status(201).json({
            message: "Assignment created successfully",
            assignment: saved_submssion,
        });
    } catch (err) {
        res.status(400).json({
            message: "Error! Assignment not created",
            err: err.message,
        });
    }
});

// TODO: add and remove submission id
// update one assignment with id and data
router.patch("/:id", getAssignment, async (req, res) => {
    req.body.assignment_name &&
        (res.assignment.assignment_name = req.body.assignment_name);
    req.body.subject_name &&
        (res.assignment.subject_name = req.body.subject_name);
    req.body.faculty_id && (res.assignment.faculty_id = req.body.faculty_id);
    req.body.is_show && (res.assignment.is_show = req.body.is_show);
    req.body.faculty_submission_id &&
        (res.assignment.faculty_submission_id = req.body.faculty_submission_id);
    req.body.submission_list_ids &&
        (res.assignment.submission_list_ids = req.body.submission_list_ids);

    // TODO: update for list of ids
    if (req.body.push_submission_id != null) {
        let index_of_found = res.assignment.submission_list_ids.indexOf(
            req.body.push_submission_id
        );
        if (index_of_found === -1) {
            res.assignment.submission_list_ids.push(
                req.body.push_submission_id
            );
        }
    }

    // TODO: update for list of ids
    if (req.body.remove_submission_id != null) {
        res.assignment.submission_list_ids = res.assignment.submission_list_ids.filter(
            (ids) => {
                return ids != req.body.remove_submission_id;
            }
        );
    }

    try {
        const updatedAssignment = await res.assignment.save();
        res.status(201).json({
            message: "Assignment updated successfully",
            assignment: updatedAssignment,
        });
    } catch (err) {
        res.status(400).json({
            message: "Error! Assignment not updated",
            err: err.message,
        });
    }
});

// deleteing one
router.delete("/:id", getAssignment, async (req, res) => {
    try {
        await res.assignment.remove();
        res.status(201).json({ message: "Assignment deleted successfully" });
    } catch (err) {
        res.status(500).json({
            message: "Error! Assignment not deleted",
            err: err.message,
        });
    }
});

// middleware for getting specific assignment by id
async function getAssignment(req, res, next) {
    let assignment;
    try {
        assignment = await Assignments.findById(req.params.id);
        if (assignment == null) {
            return res
                .status(404)
                .json({ message: "Error! Cannot find assignment" });
        }
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }

    res.assignment = assignment;
    next();
}

module.exports = router;
