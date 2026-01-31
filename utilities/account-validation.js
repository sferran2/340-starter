const utilities = require(".")
const { body, validationResult } = require("express-validator")
const accountModel = require("../models/account-model")

const validate = {}

/*  **********************************
  *  Registration Data Validation Rules
  * ********************************* */
  validate.registrationRules = () => {
    return [
      // firstname is required and must be string
      body("account_firstname")
        .trim()
        .escape()
        .notEmpty().withMessage("Please provide a first name.") // on error this message is sent.
        .isLength({ min: 1 }).withMessage("Name must be at least 1 characters.")
        .bail(),
  
      // lastname is required and must be string
      body("account_lastname")
        .trim()
        .escape()
        .notEmpty().withMessage("Please provide a last name.") // on error this message is sent.
        .isLength({ min: 2 }).withMessage("Last name must be at least 2 characters.")
        .bail(),
      
      // valid email is required and cannot already exist in the database
      body("account_email")
      .trim()
      .notEmpty().withMessage("Email is required.")
      .bail()
      .isEmail().withMessage("A valid email is required.")
      .bail()
      .normalizeEmail() // refer to validator.js docs
      .custom(async (account_email) => {
        const emailExists = await accountModel.checkExistingEmail(account_email)
        if (emailExists){
          throw new Error("Email exists. Please log in or use different email")
      }
      }),
  
      // password is required and must be strong password
      body("account_password")
        .trim()
        .notEmpty().withMessage("Password is required.")
        .isStrongPassword({
          minLength: 12,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 1,
        })
        .withMessage("Password does not meet requirements."),
    ]
  }

/* ******************************
 * Check data and return errors or continue to registration
 * ***************************** */
validate.checkRegData = async (req, res, next) => {
  const { account_firstname, account_lastname, account_email } = req.body
  let errors = []
  errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("account/register", {
      errors,
      title: "Registration",
      nav,
      account_firstname,
      account_lastname,
      account_email,
    })
    return
  }
  next()
}

/*  **********************************
 *  Login Data Validation Rules
 * ********************************* */
validate.loginRules = () => {
  return [
    body("account_email")
      .trim()
      .notEmpty().withMessage("Email is required.")
      .bail()
      .isEmail().withMessage("A valid email is required.")
      .bail()
      .normalizeEmail(),

    body("account_password")
      .trim()
      .notEmpty().withMessage("Password is required."),
  ]
}

/* ******************************
 * Check login data and return errors or continue to login
 * ***************************** */
validate.checkLoginData = async (req, res, next) => {
  const { account_email } = req.body
  let errors = validationResult(req)

  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("account/login", {
      errors,
      title: "Login",
      nav,
      account_email,
    })
    return
  }
  next()
}



module.exports = validate
