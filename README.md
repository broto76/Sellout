# Sellout

<img src=https://nodejs.org/static/images/logos/nodejs-new-pantone-black.svg width="200" />

<br>

A web based application running on Nodejs runtime which allows sellers to list their products and the buyers to buy them online. The server is hosted on Nodejs runtime developed using javascript. The UI is rendered using the EJS view engine and styled using CSS.
<br><br>
Features:
<br>
* User can list their products for selling.
* Users can browse the listing without login.
* An user can sell their products only after email validation.
* User and Seller can chat in real time.
* Payment system is integrated via Stripe.
* Invoice generated as PDF on the fly.
* Data stored remotly over MongoDB Atlas.
* Application developed using MVC design.
* Protected against CSRF attacks.
* Designed in a single Nodsjs application using EJS rendering.
<br><br>

![Intro](https://media2.giphy.com/media/FVUoO2RU0mXpT2CIYu/giphy.gif)

The application should be running at [heroku](https://sellout-products.herokuapp.com/).

<br>

This project uses the following npm libraries:
* [@sendgrid/mail](https://www.npmjs.com/package/@sendgrid/mail) : Used for sending emails to registered users for verification and security related issues.
* [bcryptjs](https://www.npmjs.com/package/bcryptjs) : Used for generating the hash of the user password and verifying the it during user authentication.
* [body-parser](https://www.npmjs.com/package/body-parser) : Used for parsing the request body and poplating the form data into request object.
* [compression](https://www.npmjs.com/package/compression) : This library attempts to compression the data sent over the network.
* [connect-flash](https://www.npmjs.com/package/connect-flash) : Used for transmitting flash messages via network packets over different requests.
* [connect-mongodb-session](https://www.npmjs.com/package/connect-mongodb-session) : Used for managing the session store over MongoDB.
* [csurf](https://www.npmjs.com/package/csurf) : Used for generating and verifying POST requests via a special token for blocking CSRF attacks.
* [ejs](https://www.npmjs.com/package/ejs) : This engine is used for generating HTML webpages as response for rendering views on client side.
* [express](https://www.npmjs.com/package/express) : Self explainatory. Most important library. 
* [express-session](https://www.npmjs.com/package/express-session) Used for managing the user session in conjunction with mongodb-session.
* [express-validator](https://www.npmjs.com/package/express-validator) : Used for validating user data before processing it.
* [helmet](https://www.npmjs.com/package/helmet) : This configures the HTTP packet headers and keeps the application data secure over network.
* [mongoose](https://www.npmjs.com/package/mongoose) : Used for maintaining a schema for data storing and retrieving data over MongoDB server.
* [morgan](https://www.npmjs.com/package/morgan) : Optional. Used fir logging data.
* [multer](https://www.npmjs.com/package/multer) : Used for parsing file data sent over network and storing it on server.
* [pdfkit](https://www.npmjs.com/package/pdfkit) : Used for generating pdf on the fly for invoicing.
* [socket.io](https://www.npmjs.com/package/socket.io) : Used for implementing the P2P messaging logic and sending data from server to client in real time.
* [stripe](https://www.npmjs.com/package/stripe) : Used for integrating payment gateway with Sellout.
