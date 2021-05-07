const router = require('express').Router()

const Models = require('../Models')

// results[i] = No of Users registered on (current - i)th day
router.get('/countOfNewUserDuringLastWeek', async(req,res,next) => {
    try{
        const results = []
        for(let i=0; i<7; i++) {
            const users = await Models.User.find({ createdAt: { $gte: new Date(new Date() - i * 60 * 60 * 24 * 1000) } })
            const students = users.filter(user => user.role === "student")
            const admins = users.filter(user => user.role === "admin")
            const faculties = users.filter(user => user.role === "faculty")
            results.push({
                students: students.length,
                admins: admins.length,
                faculties: faculties.length
            })
        }
        let admins = 0, students = 0, faculties = 0;
        for(let i=0;i<7;i++) {
            results[i].students -= students
            results[i].admins -= admins
            results[i].faculties -= faculties
            admins += results[i].admins 
            students += results[i].students 
            faculties += results[i].faculties
        }
        res.status(200).json({
            results
        })
    } catch(err) {
        res.status(500).json({ error: err })
    }
})

// results[i] = No of users on (current - i)th day.
router.get('/countOfUserDuringLastWeek', async(req,res,next) => {
    try{
        const results = []
        for (let i = 0; i < 7; i++) {
            const users = await Models.User.find({ createdAt: { $gte: new Date(new Date() - i * 60 * 60 * 24 * 1000) } })
            const students = users.filter(user => user.role === "student")
            const admins = users.filter(user => user.role === "admin")
            const faculties = users.filter(user => user.role === "faculty")
            results.push({
                students: students.length,
                admins: admins.length,
                faculties: faculties.length
            })
        }

        res.status(200).json({
            results
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
        for(let i=0;i<7;i++) {
            const assignmentsOnIthDay = await Models.QnAs_Faculty.find({ createdAt: { $gte: new Date(new Date() - i * 60 * 60 * 24 * 1000) } })
            assignments.push(assignmentsOnIthDay)
        }
        res.status(200).json({
            assignments
        })
    } catch(err) {
        res.status(500).json({ error: err })
    }
})

// Total number of students that were assigned the assignments 
// and how many of them submitted till now
router.get('/assignmentInfo', async(req,res,next) => {
    try{    
        const questionPapers = await Models.QuestionPaper.find({}).sort({ createdAt: -1 }).limit(1)
        const result = []
        for(let i=0; i < questionPapers.length; i++) {
            const questionPaper = questionPapers[i]
            if (!questionPaper) continue
            const students = await Models.StudentQuestionRelation.find({ questionPaperID: questionPaper._id })
            let submitted = 0
            students.forEach(student => {
                if (student.isSubmitted)
                    submitted += 1
            })
            let notSubmitted = students.length - submitted
            result.push({
                assigned: students.length,
                submitted,
                notSubmitted
            })
        }
        res.status(200).json({
            result
        })
    } catch(err) {
        console.log(err)
        res.status(500).json({ error: err })
    }
})

// Number of answers faculty has evaluted and is yet to evalute
// This route expecting to pass the questionPaperId
router.get('/facultyAnswerInfo/:assignmentId', async(req,res,next) => {
    try{
        const assignment = await Models.Assignments.findById(req.params.assignmentId)
        if(!assignment) {
            throw new Error("Assignment does not exist")
        }
        const submissions = await Models.Submissions.find({ assignment_id: assignment._id})
        let evaluted = 0, notEvaluted = 0;
        for(let i=0; i < submissions.length; i++) {
            const qna_list_ids = submissions[i].qna_list_ids
            for(let j=0; j < qna_list_ids.length; j++) {
                const qna_student = await Models.QnAs_Student.findById(qna_list_ids[j])
                if(qna_student) {
                    if(qna_student.is_evaluted === 'done') evaluted += 1
                    else notEvaluted += 1
                }
            }
        }
        res.status(200).json({
            assigned: assignment.submission_list_ids.length,
            evaluted,
            notEvaluted
        })

        // const answers = await Models.Answer.find({ questionPaperID: req.params.questionPaperId})
        // let evaluted = 0, notEvaluted = 0;
        // answers.forEach((answer) => {
        //     if (answer.is_evaluted) evaluted += 1
        //     else notEvaluted += 1
        // })
        // const students = await Models.StudentQuestionRelation.find({ questionPaperID: req.params.questionPaperId })
        // res.status(200).json({
        //     assigned: students.length,
        //     evaluted,
        //     notEvaluted
        // })
    } catch(err) {
        res.status(500).json({ error: err })
    }
})

// router.get('/temp', async(req,res) => {
//     try {
//         const answers = await Models.Answer.find({})
//         for(let i=0;i<answers.length;i++) {
//             const studentQuestionRelation = new Models.StudentQuestionRelation({
//                 studentID: answers[i].studentID ,
//                 questionPaperID: answers[i].questionPaperID ,
//                 isSubmitted: true,
//             })
//             await studentQuestionRelation.save()
//         }
//         res.status(200).json({
//             message: "Done"
//         })
//     } catch (error) {
//         console.log(error)
//         res.status(500).json({
//             error
//         })
//     }
// })

module.exports = router
