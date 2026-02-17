import UserModel from "@/model/User";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import sendVerificationOTP from "@/utils/sendverificationEmail";
import dbConnect from "@/lib/dbConnection";

export async function POST(request: Request) {
  await dbConnect();

  try {
    const { username, email, password } = await request.json();

    // ✅ 1. Basic validation
    if (!username || !email || !password) {
      return NextResponse.json(
        {
          message: "All fields are required",
          success: false,
        },
        { status: 400 }
      );
    }

    // ✅ 2. Check if user already exists
    const existingUser = await UserModel.findOne({ email });

    // Generate OTP
    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verifyCodeExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // ✅ 3. If user exists & already verified
    if (existingUser && existingUser.isVerifyed) {
      return NextResponse.json(
        {
          message: "User already exists with this email",
          success: false,
        },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ 4. If user exists but not verified (re-send OTP)
    if (existingUser && !existingUser.isVerifyed) {
      existingUser.username = username;
      existingUser.password = hashedPassword;
      existingUser.verifyCode = verifyCode;
      existingUser.verifyCodeExpiry = verifyCodeExpiry;

      await existingUser.save();
    }

    // ✅ 5. New user signup
    if (!existingUser) {
      const newUser = new UserModel({
        username,
        email,
        password: hashedPassword,
        verifyCode,
        verifyCodeExpiry,
        isVerifyed: false,
        isAcceptMessage: true,
        messages: [],
      });

      await newUser.save();
    }

    // ✅ 6. Send verification email
    const emailResponse = await sendVerificationOTP({
      email,
      emailType: "VERIFY_EMAIL",
      otp: verifyCode,
    });

    if (!emailResponse.success) {
      return NextResponse.json(
        {
          message: "Failed to send verification email",
          success: false,
        },
        { status: 500 }
      );
    }

    // ✅ 7. Final response
    return NextResponse.json(
      {
        message: "OTP sent to your email. Please verify your account.",
        success: true,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup Error:", error);
    return NextResponse.json(
      {
        message: "Internal server error",
        success: false,
      },
      { status: 500 }
    );
  }
}
