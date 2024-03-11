const nodemailer = require("nodemailer");
const dotenv=require("dotenv")
dotenv.config()


const mailsender = async (name) => {

    try {
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
     
            port:process.env.googlePort,
            secure: false,
            requireTLS: true,
            auth: {
                user:process.env.gmail,
                pass:process.env.apppassword,

            }
        })

        const mailOption = {
             
            from:process.env.gmail,
             //to which email you want to send otp ,it will be received by frontend
            to:process.env.gmail,
            subject: "New Account Created",
            text: `${name} has created an account`
        }

     await transporter.sendMail(mailOption,async(err, res) => {
            if (err) {
                console.log(err)

            }
            else {
                console.log("mail send")
               
                // console.log("mail send 2")
            }
        })
    }
    catch (err) {
        console.log("Catch error", err)
    }

}
module.exports = { mailsender }