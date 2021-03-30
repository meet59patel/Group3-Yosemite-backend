const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    username: {
        required: true,
        type:  String,
        unique: true,
    }, 
    email: {
        required: true,
        type: String,
        unique: true,
    },
    password: {
        type: String,
    }, 
    profilepic: {
        type: Buffer,
    },
    role: {
        type: String, 
    }
}, {
    timestamps: true,
})

const questionPaperSchema = new mongoose.Schema({
    facultyID: {
        required: true,
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    questionPaperDescription: {
        type: String,
    },
    submissionDeadline: {
        required: true,
        type: Date,
    },
    subjectName: {
        required: true,
        type: String,
    },
    total: {
        type: Number,
    }
},{
    timestamps: true,
})

const questionSchema = new mongoose.Schema({
    questionPaperID: {
        required: true,
        type: mongoose.Schema.Types.ObjectId,
        ref: 'QuestionPaper',
    }, 
    question: {
        type: String,
        required: true,
    },
    ansByFaculty: {
        type: String,
        required: true,
    }, 
    marks: {
        type: Number,
        required: true,
    }
}, {
    timestamps: true,
})

const answerSchema = new mongoose.Schema({
    studentID: {
        required: true,
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }, 
    questionID: {
        required: true,
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question'
    },
    questionPaperID: {
        required: true,
        type: mongoose.Schema.Types.ObjectId,
        ref: "QuestionPaper",
    }, 
    ans: {
        required: true,
        type: String,
    },
    marks_by_model: {
        type: Number,
    },
    final_marks: {
        type: Number,
    },
    is_evaluted: {
        type: Boolean,
        default: false,
    },
    query_flag: {
        type: Boolean,
        default: false,
    }
})

const User = new mongoose.model('User', userSchema)
const QuestionPaper = new mongoose.model('QuestionPaper',questionPaperSchema)
const Question = new mongoose.model('Question',questionSchema)
const Answer = new mongoose.model('Answer', answerSchema)

module.exports = {
    User,
    QuestionPaper,
    Question,
    Answer, 
}
