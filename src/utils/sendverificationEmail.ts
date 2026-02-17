import getEmailTemplate from '@/emailTemplate';
import { transporter } from '@/lib/emailTranspoter';
import { verifyficationType } from '@/types/apitypeResponse';

async function sendVeryficationOTP({ email, emailType, otp }: verifyficationType) {
    try {
        const mailOptions = {
            from: '"Social Buzz" | <security-social-buzz@myapp.com>',
            to: email,
            subject: emailType === "VERIFY_EMAIL" ? "Verification Code" : "Reset Your Password",
            html: getEmailTemplate(otp)
        }

        await transporter.sendMail(mailOptions);

        return {
            success: true,
            message: "Verification email sent successfully",
            status: 200,
        };

    }
    catch (error) {
        console.log("Email verification error :- ", error);
        return {
            message: "Error email verification",
            status: 500
        }
    }
};

export default sendVeryficationOTP;