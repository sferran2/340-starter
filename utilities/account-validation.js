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

// Update account validation rules
validate.updateRules = () => {
  return [
    body("account_firstname")
      .trim()
      .notEmpty()
      .withMessage("First name is required."),

    body("account_lastname")
      .trim()
      .notEmpty()
      .withMessage("Last name is required."),

    body("account_email")
      .trim()
      .notEmpty().withMessage("Email is required.")
      .bail()
      .isEmail().withMessage("A valid email is required.")
      .bail()
      .normalizeEmail()
      .custom(async (account_email, { req }) => {
        const account_id = parseInt(req.body.account_id)

        // Buscar la cuenta actual
        const currentAccount = await accountModel.getAccountById(account_id)

        // Si el email cambió, entonces validar que NO exista en otra cuenta
        if (currentAccount && currentAccount.account_email !== account_email) {
          const emailExists = await accountModel.checkExistingEmail(account_email)
          if (emailExists) {
            throw new Error("Email exists. Please use a different email.")
          }
        }
        return true
      }),
  ]
}


validate.checkUpdateData = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await require("../utilities/").getNav()
    return res.status(400).render("account/update-account", {
      title: "Update Account Information",
      nav,
      errors: errors.array(),
      account_id: req.body.account_id,
      account_firstname: req.body.account_firstname,
      account_lastname: req.body.account_lastname,
      account_email: req.body.account_email,
    })
  }
  next()
}

validate.passwordRules = () => {
  return [
    body("account_password")
      .trim()
      .notEmpty().withMessage("Password is required.")
      .bail()
      .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{12,}$/)
      .withMessage("Password does not meet requirements."),
  ]
}

validate.checkPasswordData = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    const account_id = parseInt(req.body.account_id)
    const accountData = await accountModel.getAccountById(account_id)

    return res.status(400).render("account/update-account", {
      title: "Update Account Information",
      nav,
      errors: errors.array(),
      account_id: accountData.account_id,
      account_firstname: accountData.account_firstname,
      account_lastname: accountData.account_lastname,
      account_email: accountData.account_email,
    })
  }
  next()
}

module.exports = validate
