function getEmailTemplate(otp: string) {
  return `
    <div style="font-family: Arial">
      <h2>Email Verification</h2>
      <p>Your OTP code is:</p>
      <h1>${otp}</h1>
      <p>This OTP is valid for 10 minutes.</p>
    </div>
  `;
}

export default getEmailTemplate;