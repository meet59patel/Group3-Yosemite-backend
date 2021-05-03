const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();
const mongoose = require('mongoose');

const DB_URL = process.env.DB_URL || '';
const port = process.env.PORT || 8000;

mongoose
  .connect(DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => console.log('Connected to MongoDB...'))
  .catch((error) => console.log('MongoDB Error:\n', error));

app.use(require('morgan')('dev')); // Morgan to log requests on server console
app.use(bodyParser.json());
app.use(cors());

// Import Routes
const baseRoutes = require('./Routes/baseRoutes');
const usersRouter = require('./Routes/user');
const assignmentsRouter = require('./Routes/assignments');
const submissionsRouter = require('./Routes/submissions');
const qnasFacultyRouter = require('./Routes/qna_faculty');
const qnasStudentRouter = require('./Routes/qna_student');
const statRouters = require('./Routes/stats');
const mailRouters = require('./Routes/mail');

// Routes
app.use('/', baseRoutes);
app.use('/user', usersRouter);
app.use('/assignment', assignmentsRouter);
app.use('/submission', submissionsRouter);
app.use('/faculty/qna', qnasFacultyRouter);
app.use('/qna', qnasStudentRouter);
app.use('/stats', statRouters);
app.use('/emails', mailRouters);

app.use((req, res, next) => {
  const error = new Error('Not Found');
  error.status = 404;
  next(error);
});

// Handle all the previous errors (including 404 and others)
app.use((error, req, res, next) => {
  console.log(req.body);
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message,
    },
  });
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
