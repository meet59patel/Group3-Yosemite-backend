const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    user_name: {
      type: String,
      required: true,
    },
    email: {
      required: true,
      type: String,
      unique: true,
    },
    password: {
      type: String,
    },
    role: {
      type: String,
      required: true,
      enum: ['admin', 'faculty', 'student'],
      default: 'student',
    },
    profile_pic: {
      type: Buffer,
    },
    submission_list: [
      {
        type: mongoose.Schema.Types.ObjectID,
        ref: 'Submissions',
        required: true,
      },
    ],
  },
  { timestamps: true }
);

const assignmentSchema = new mongoose.Schema(
  {
    assignment_name: {
      type: String,
      required: true,
    },
    subject_name: {
      type: String,
      required: true,
    },
    faculty_id: {
      type: mongoose.Schema.Types.ObjectID,
      ref: 'Users',
      required: true,
    },
    total_marks: { type: Number, required: true, default: 0 },
    deadline: { type: Date, default: Date.now() },
    is_show: { type: Boolean, required: true, default: false },
    faculty_submission_id: {
      type: mongoose.Schema.Types.ObjectID,
      ref: 'Submissions',
      required: true,
    },
    submission_list_ids: [
      {
        type: mongoose.Schema.Types.ObjectID,
        ref: 'Submissions',
      },
    ],
  },
  { timestamps: true }
);

const submissionSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectID,
      ref: 'Users',
      required: true,
    },
    assignment_id: {
      type: mongoose.Schema.Types.ObjectID,
      ref: 'Assignments',
    },
    evaluated_no_qna: { type: Number, required: true, default: 0 },
    marks: { type: Number, required: true, default: 0 },
    qna_list_ids: [
      {
        type: mongoose.Schema.Types.ObjectID,
        ref: 'QnAs_Students',
      },
    ],
  },
  { timestamps: true }
);

const qnaFacultySchema = new mongoose.Schema(
  {
    question: { type: String, required: true, default: '' },
    answer: { type: String, default: '' },
    marks: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const qnaStudentSchema = new mongoose.Schema(
  {
    qna_faculty_id: {
      type: mongoose.Schema.Types.ObjectID,
      ref: 'QnAs',
      required: true,
    },
    answer: { type: String },
    evaluation_status: {
      type: String,
      enum: ['pending', 'in_queue', 'evaluating', 'done'],
      default: 'pending',
    },
    model_marks: { type: Number, default: 0 },
    query_flag: { type: Boolean, default: false },
    query_description: { type: String },
    query_solved: { type: Boolean, default: false },
    final_marks: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Users = new mongoose.model('Users', userSchema);
const Assignments = new mongoose.model('Assignments', assignmentSchema);
const Submissions = new mongoose.model('Submissions', submissionSchema);
const QnAs_Faculty = new mongoose.model('QnAs_Faculty', qnaFacultySchema);
const QnAs_Student = new mongoose.model('QnAs_Student', qnaStudentSchema);

module.exports = {
  Users,
  Assignments,
  Submissions,
  QnAs_Faculty,
  QnAs_Student,
};
