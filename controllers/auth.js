const User = require("../models/user");
const bcrypt = require("bcryptjs");
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');

const transporter = nodemailer.createTransport(sendgridTransport({
    auth :{
        api_key : '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'
    }
}))

exports.getLogin = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    isAuthenticated: false,
    errorMessage: message
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  User.findOne({ email: email })
    .then(user => {
      if (!user) {
        req.flash({ error: "Invalid email or password!!" });
        return res.redirect("/login");
      }
      bcrypt.compare(password, user.password).then(doMatch => {
        if (doMatch) {
          req.session.isLoggedIn = true;
          req.session.user = user;
          return req.session.save(err => {
            console.log(err);

            res.redirect("/");
          });
        }
        req.flash({'error': 'Invalid email or password!!'})
        return res.redirect("/login");
      });
    })
    .catch(err => {
      console.log(err);
      res.redirect("/login");
    });
};

exports.postLogout = (req, res, next) => {
  req.session.destroy(err => {
    console.log(err);
    res.redirect("/");
  });
};

exports.getSignup = (req, res, next) => {
    let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/signup", {
    path: "/signup",
    pageTitle: "SignUp",
    errorMessage : message
  });
};

exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;

  User.findOne({ email: email })
    .then(userDoc => {
      if (userDoc) {
        req.flash({'error': 'Email already exists! Login with existing or use a different one to signup'})
        return res.redirect("/signup");
      }
      return bcrypt.hash(password, 12);
    })
    .then(hashedPassword => {
      const user = new User({
        email: email,
        password: hashedPassword,
        cart: { items: [] }
      });
      return user.save();
    })
    .then(result => {
      res.redirect("/login");
      return transporter.sendMail({
          to : email,
          from : 'node-shopping@learning.com',
          subject : 'SignUp successfully',
          html : '<h1>Account Successfully created!!</h1>'
      })
    })
    .catch(err => {
      console.log(err);
    });
};
