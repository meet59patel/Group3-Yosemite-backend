const express = require("express");
const router = express.Router();
const Users = require("../models/users");

// getting all users
router.get("/", async (req, res) => {
    try {
        const users = await Users.find();
        res.status(201).json({
            message: "All Users fetched successfully",
            users: users,
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// getting role wise user
router.get("/role/:role", async (req, res) => {
    try {
        const users = await Users.find({ role: req.params.role });
        users.filter((user) => user.role === "student");
        res.status(201).json({
            message: `All ${req.params.role}s fetched successfully`,
            users: users,
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// getting one user with id
router.get("/:id", getUser, (req, res) => {
    res.status(201).json(res.user);
});

// creating one user
router.post("/", async (req, res) => {
    const new_user = new Users({
        user_name: req.body.user_name,
        email: req.body.email,
        role: req.body.role,
        submission_list: req.body.submission_list,
    });

    try {
        const saved_User = await new_user.save();
        res.status(201).json({
            message: "User created successfully",
            user: saved_User,
        });
    } catch (err) {
        res.status(400).json({
            message: "Error! User not created",
            err: err.message,
        });
    }
});

// TODO: write code for add and remove {assi_id,sub_id} list
// updating one user with id and data
router.patch("/:id", getUser, async (req, res) => {
    req.body.user_name && (res.user.user_name = req.body.user_name);
    req.body.email && (res.user.email = req.body.email);
    req.body.role && (res.user.role = req.body.role);
    req.body.password && (res.user.password = req.body.password);
    req.body.profile_pic && (res.user.profile_pic = req.body.profile_pic);
    req.body.submission_list &&
        (res.user.submission_list = req.body.submission_list);

    // TODO: update for list of submission_list
    if (req.body.push_assisub_id != null) {
        let index_of_found = res.user.submission_list.indexOf(
            req.body.push_assisub_id
        );
        if (index_of_found === -1) {
            res.user.submission_list.push(req.body.push_assisub_id);
        }
    }

    // TODO: update for list of submission_list
    if (req.body.remove_assisub_id != null) {
        res.user.submission_list = res.user.submission_list.filter((ids) => {
            return ids != req.body.remove_assisub_id;
        });
    }

    try {
        const updatedUser = await res.user.save();
        res.status(201).json({
            message: "User updated successfully",
            user: updatedUser,
        });
    } catch (err) {
        res.status(400).json({
            message: "Error! User not updated",
            err: err.message,
        });
    }
});

// deleteing one user with id
router.delete("/:id", getUser, async (req, res) => {
    try {
        await res.user.remove();
        res.status(201).json({ message: "User deleted successfully" });
    } catch (err) {
        res.status(500).json({
            message: "Error! User not deleted",
            err: err.message,
        });
    }
});

// middleware for getting specific user by id
async function getUser(req, res, next) {
    let user;
    try {
        user = await Users.findById(req.params.id);
        if (user == null) {
            return res.status(404).json({ message: "cannot find user" });
        }
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }

    res.user = user;
    next();
}

module.exports = router;
