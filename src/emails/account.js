const formData = require('form-data')
const Mailgun = require('mailgun.js')
const mailgun = new Mailgun(formData)

const key=process.env.API
const domain=process.env.DOMAIN
const mg = mailgun.client({
	username: 'api',
	key: key
});

const sendWelcomeEmail=async(email,name)=>{
    mg.messages.create(domain, {
		from: "Mailgun Sandbox <postmaster@"+domain+">",
		to: [email],
		subject: "Hello my dear friend",
		text: `Welcome to the app, ${name}.Let me know how you get along with the app.`
	})
}

const sendCancellationEmail=async(email,name)=>{
    mg.messages.create(domain, {
		from: "Mailgun Sandbox <postmaster@"+domain+">",
		to: [email],
		subject: "We wont forget you",
		text: `Good bye my friend., ${name}. Hope to meet you again soon!.`
	})
}

module.exports={
    sendWelcomeEmail,
    sendCancellationEmail
}