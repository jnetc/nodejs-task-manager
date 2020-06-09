const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail = async (email, name) => {
  await sgMail.send({
    to: email,
    from: 'etojnetc@gmail.com',
    subject: 'Thanks for joining in',
    text: `Welcome to the app, ${name}. Let me know how you get along with the app`,
    html: `<strong>Welcome to the app, ${name}. Let me know how you get along with the app</strong>`,
  });
};

const sendCanceletionEmail = async (email, name) => {
  await sgMail.send({
    to: email,
    from: 'etojnetc@gmail.com',
    subject: 'Remove your account',
    text: `${name} your account was delete`,
    html: `<strong>${name} your account was delete</strong>`,
  });
};

module.exports = {
  sendWelcomeEmail,
  sendCanceletionEmail,
};
