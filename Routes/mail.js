const route = require('express').Router();
const nodemailer = require('nodemailer');
const Models = require('../Models');

const EMAIL = process.env.EMAIL_ID || '';
const EMAIL_PASS = process.env.EMAIL_PASS || '';

// Expect emails array
route.post('/', async (req, res, next) => {
  try {
    let mailTransporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: EMAIL,
        pass: EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const to = req.body.emails || [];

    for (let i = 0; i < to.length; i++) {
      let mailDetails = {
        from: 'yosemite.group3@gmail.com',
        to: to[i],
        subject: 'Assignment Link | Yosemite',
        text: `Hey, Here is the submission link to the Assignment <Link>`,
      };

      mailTransporter.sendMail(mailDetails, function (err, data) {
        if (err) {
          console.log('Error Occurs');
          console.log(err);
        } else {
          console.log('Email sent successfully');
          res.status(201).json({
            message: 'Email(s) sent successfully.',
          });
        }
      });
    }
  } catch (err) {
    res.status(500).json({ error: err });
  }
});

module.exports = route;
