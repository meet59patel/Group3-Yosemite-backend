const router = require('express').Router()

const Models = require('../Models')

// Current number students, faculties and admins in database
router.get('/currentUsersCount', async(req,res,next) => {
    try{
        const users = await Models.User.find({})
        const students = users.filter(user => user.role === "student")
        const admins = users.filter(user => user.role === "admin")
        const faculties  = users.filter(user => user.role === "faculty")
        res.status(200).json({
            students: students.length,
            admins: admins.length,
            faculties: faculties.length
        })
    } catch(err) {
        res.status(500).json({ error: err })
    }
})

// Number users registere in the last week
router.get('/lastWeekUserscount', async(req,res,next) => {
    try{
        const users = await Models.User.find({ createdAt: { $gte: new Date(new Date() - 7 * 60 * 60 * 24 * 1000) }})
        const students = users.filter(user => user.role === "student")
        const admins = users.filter(user => user.role === "admin")
        const faculties = users.filter(user => user.role === "faculty")
        res.status(200).json({
            students: students.length,
            admins: admins.length,
            faculties: faculties.length
        })
    } catch(err) {
        res.status(500).json({ error: err })
    }
})

// Assignment made per of last 7 days
// Here I'm returing the array of assignments
// assignments[i] = assignments made on the (current - i)th day
router.get('/assignmentsOfLastWeek', async(req,res,next) => {
    try{
        let assignments = []
        for(let i=0;i<=7;i++) {
            const assignmentsOnIthDay = await Models.QuestionPaper.find({ createdAt: new Date(new Date() - i * 60 * 60 * 24 * 1000) })
            assignments.push(assignmentsOnIthDay)
        }
        res.status(200).json({
            assignments
        })
    } catch(err) {
        res.status(500).json({ error: err})
    }
})

// Total number of students that were assigned the assignments 
// and how many of them submitted till now

router.get('/assignmentInfo', async(req,res,next) => {
    try{    
        const questionPapers = await Models.find({}).sort({ createdAt: -1 }).limit(5)
        const result = []
        for(let i=0; i < questionPapers.length; i++) {
            const questionPaper = questionPapers[i]
            if (!questionPaper) throw new Error("Invalid requests")
            const students = questionPaper.students
            let submitted = 0
            students.forEach(student => {
                if (student.isSubmitted)
                    submitted += 1
            })
            result.push({
                total: students.length,
                submitted
            })
        }
        res.status(200).json({
            result
        })
    } catch(err) {
        res.status(500).json({ error: err })
    }
})

// Number of answers faculty has evaluted and is yet to evalute
// This route expecting to pass the questionPaperId
router.get('/facultyAnswerInfo/:questionPaperId', async(req,res,next) => {
    try{
        const answers = await Models.Answer.find({ questionPaperID: req.params.questionPaperId})
        let evaluted = 0, notEvaluted = 0;
        answers.forEach((answer) => {
            if (answer.is_evaluted) evaluted += 1
            else notEvaluted += 1
        })
        res.status(200).json({
            evaluted,
            notEvaluted
        })
    } catch(err) {
        res.status(500).json({ error: err })
    }
})

module.exports = router