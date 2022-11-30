const axios = require("axios");

const sendEmailToUser = async (emailVal, nameVal, subjectVal, otp, apiName) => {
  const data = {
    sender: {
      name: process.env.EMAIL_SENDER_NAME,
      email: process.env.EMAIL_SENDER_MAIL,
    },
    to: [
      {
        email: emailVal,
        name: nameVal,
      },
    ],
    subject: subjectVal,
    htmlContent:
      apiName === "Signup"
        ? `
        <!DOCTYPE html>
        <head>
          <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap@4.4.1/dist/css/bootstrap.min.css"
          integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh"
          crossorigin="anonymous"
        />
        
        <style>
          @import url("https://fonts.googleapis.com/css2?family=Lato:wght@300;400&display=swap");
          body {
            font-family: "Lato", sans-serif;
          }
          </style>
        </head>
        <body>
        <section>
            <div class="Row">
          <div>
            <h2>Hello, ${nameVal}</h2>
            <p>You’re almost ready to start enjoying Know Your Customer; before accessing your account, you need to enter the OTP below to complete the signing up.</p>
          </div>
          <h2>${otp}</h2>
          <p>Kind Regards, </p>
          <p>Know Your Customer</p>
            </div>
        </section>
        </body>
        </html>
    `
        : `<!DOCTYPE html>
    <head>
      <link
      rel="stylesheet"
      href="https://cdn.jsdelivr.net/npm/bootstrap@4.4.1/dist/css/bootstrap.min.css"
      integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh"
      crossorigin="anonymous"
    />
    
    <style>
      @import url("https://fonts.googleapis.com/css2?family=Lato:wght@300;400&display=swap");
      body {
        font-family: "Lato", sans-serif;
      }
      </style>
    </head>
    <body>
    
    <section class="Detail">
        <div>
      <div>
        <h2>Hello, ${nameVal}</h2>
        <p>You have entered the new password; before enjoying your account, enter the OTP below to set the new password.</p>
      </div>
      <h2> ${otp} </h2>
      <p>If you don't recognize this login attempt, someone may be trying to access your account. We recommend you change your password immediately.</p>
      <p>Kind Regards, </p>
      <p>Know Your Customer</p>
        </div>
    </section>   
    </body>
    </html>`,
  };

  const config = {
    method: "post",
    url: "https://api.sendinblue.com/v3/smtp/email",
    data: data,
    headers: {
      "Content-Type": "application/json",
      accept: "application/json",
      "api-key": process.env.EMAIL_API_KEY,
    },
  };

  await axios(config)
    .then((res) => res)
    .catch((err) => console.log(err));
};

module.exports = { sendEmailToUser };
