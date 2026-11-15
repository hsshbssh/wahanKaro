import nodemailer from "nodemailer"
const transporter=nodemailer.createTransport({
    service:"gmail",//kis service ke through mail bhejna hai
    auth:{
        //yha humne uss email ka email aur password bheja hai jisse hum mail bhejna chahte hai 
        user:process.env.GMAIL_ID,
        pass:process.env.GMAIL_PASSWORD
    }
})

//ab hume function banana hai joh ki iss emial ke through mail bhejega
export const sendEmail=async(to:string,subject:string,html:string)=>{//ab isme to ke andr woh email daalna hoga jipe hum mail bhejna chahte hai, subject mein hoga subject joh hum mails wagera mein bhejte hai
//aur ek hamare pass html bhi hogi jisse agr hume mail koi font bold karna ho yaa aur kuch toh woh isje through hoga
    await transporter.sendMail({
        from:`"WahanKaro" ${process.env.GMAIL_ID}`,
        to,
        subject,
        html
    })
}

//itna hote hi hame ab apne usermodel mein jaake teen fields aur add krni hogi 
//isEmailVerified
//otp
//otpExpiresIn