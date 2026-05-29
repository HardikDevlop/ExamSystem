// services/emailService.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',                 // or SMTP config
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function verifyEmailReachable(email) {
  if (!isValidEmail(email)) {
    throw new Error('Invalid email format');
  }
  // simple test mail
  await transporter.sendMail({
    from: `"Exam Platform" <${process.env.MAIL_USER}>`,
    to: email,
    subject: 'Test mail - exam assignment check',
    text: 'This is a test mail to verify your email address for the exam system.',
  });
}

async function sendExamInvite({ to, exam, jd, skillTask, loginLink }) {
  const html = `
    <p>Hi,</p>
    <p>You have been invited to take an online assessment.</p>
    <p><strong>Job Description:</strong><br>${jd}</p>
    <p><strong>Skill-based Task:</strong><br>${skillTask}</p>
    <p><strong>Exam:</strong> ${exam.title} (${exam.skill})</p>
    <p><strong>Duration:</strong> ${exam.duration} minutes</p>
    <p>Login here: <a href="${loginLink}">${loginLink}</a></p>
    <p>Instructions:</p>
    <ul>
      <li>Ensure a stable internet connection.</li>
      <li>Do not refresh during the exam.</li>
      <li>MCQ + coding sections may be present.</li>
    </ul>
  `;

  await transporter.sendMail({
    from: `"Exam Platform" <${process.env.MAIL_USER}>`,
    to,
    subject: `Online Assessment: ${exam.title}`,
    html,
  });
}

module.exports = { verifyEmailReachable, sendExamInvite };