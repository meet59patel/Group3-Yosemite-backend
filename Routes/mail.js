const route = require('express').Router()
const nodemailer = require("nodemailer")
const Models = require('../Models')

// Expect emails array 
route.post('/', async(req,res, next) => {
    try {
        let mailTransporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'yosemite.group3@gmail.com',
                pass: "Yosemite@2021"
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        const to = req.body.emails || []

        for (let i = 0; i < to.length; i++) {
            let mailDetails = {
                from: 'yosemite.group3@gmail.com',
                to: to[i],
                subject: 'Assignment Link | Yosemite',
                text: `Hey, Here is the submission link to the Assignment <Link>`
            };

            mailTransporter.sendMail(mailDetails, function (err, data) {
                if (err) {
                    console.log('Error Occurs');
                    console.log(err)
                } else {
                    console.log('Email sent successfully');
                }
            });
        }
    } catch (err) {
        res.status(500).json({ error: err })
    }
})


module.exports = route