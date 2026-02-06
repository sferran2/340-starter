const utilities = require("../utilities/")
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()


/* Deliver login view */

async function buildLogin(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/login", {
    title: "Login",
    nav,
    errors: null,
    account_email: null,
  })
}

/* Deliver registration view */

async function buildRegister(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null
  })
}

/* Process Registration*/

async function registerAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_password } = req.body

  // Hash the password before storing
  let hashedPassword
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.')
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
  }

  // Server-side validation 
if (!account_firstname || !account_lastname || !account_email || !account_password) {
  req.flash("notice", "All fields are required.")
  return res.status(400).render("account/register", {
    title: "Register",
    nav,
    errors: null,
  })
}

const passwordPattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{12,}$/
if (!passwordPattern.test(account_password)) {
  req.flash("notice", "Password does not meet requirements.")
  return res.status(400).render("account/register", {
    title: "Register",
    nav,
    errors: null,
  })
}

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  )

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you're registered ${account_firstname}. Please log in.`
    )
    res.status(201).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
  } else {
    req.flash("notice", "Sorry, the registration failed.")
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
    })
  }
}


/* Process Login Request*/
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)

  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
    return
  }

  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password

      // IMPORTANT: expiresIn is in SECONDS
      const accessToken = jwt.sign(
        accountData,
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: 3600 } // 1 hour
      )

      if (process.env.NODE_ENV === "development") {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      } else {
        res.cookie("jwt", accessToken, {
          httpOnly: true,
          secure: true,
          maxAge: 3600 * 1000,
        })
      }

      return res.redirect("/account/")
    } else {
      req.flash("notice", "Please check your credentials and try again.")
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      })
    }
  } catch (error) {
    throw new Error("Access Forbidden")
  }
}

/* Deliver Account Management view */

async function buildAccount(req, res) {
  let nav = await utilities.getNav()
  res.render("account/index", {
    title: "Account Management",
    nav,
    errors: null,
  })
}


// Deliver update account view
 
// Deliver update account view

async function buildUpdateAccountView(req, res, next) {
  let nav = await utilities.getNav()
  const account_id = parseInt(req.params.account_id)

  const accountData = await accountModel.getAccountById(account_id)

  res.render("account/update-account", {
    title: "Update Account Information",
    nav,
    errors: null,
    account_id: accountData.account_id,
    account_firstname: accountData.account_firstname,
    account_lastname: accountData.account_lastname,
    account_email: accountData.account_email,
  })
}



// Process Account Update
 
async function updateAccount(req, res, next) {
  const { account_id, account_firstname, account_lastname, account_email } = req.body

  const updateResult = await accountModel.updateAccount(
    parseInt(account_id),
    account_firstname,
    account_lastname,
    account_email
  )

  if (updateResult) {
    // Get fresh data and refresh JWT so UI updates immediately
    const updatedAccount = await accountModel.getAccountById(parseInt(account_id))
    delete updatedAccount.account_password

    const accessToken = jwt.sign(updatedAccount, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 })

    if (process.env.NODE_ENV === "development") {
      res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
    } else {
      res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
    }

    req.flash("notice", "Account information updated successfully.")
    return res.redirect("/account/")
  } else {
    req.flash("notice", "Sorry, the account update failed.")
    let nav = await utilities.getNav()
    return res.status(500).render("account/update-account", {
      title: "Update Account Information",
      nav,
      errors: null,
      account_id,
      account_firstname,
      account_lastname,
      account_email,
    })
  }
}


// Process Password Change
 
async function updatePassword(req, res, next) {
  const account_id = parseInt(req.body.account_id)
  const account_password = req.body.account_password

  let hashedPassword
  try {
    hashedPassword = bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", "Sorry, there was an error updating the password.")
    return res.redirect(`/account/update/${account_id}`)
  }

  const updateResult = await accountModel.updatePassword(account_id, hashedPassword)

  if (updateResult === 1 || updateResult === true) {
    req.flash("notice", "Password updated successfully.")
    return res.redirect("/account/")
  } else {
    req.flash("notice", "Sorry, the password update failed.")
    return res.redirect(`/account/update/${account_id}`)
  }
}


/* Account Logout */
async function accountLogout(req, res, next) {
  res.clearCookie("jwt")

  req.flash("notice", "You have been logged out.")
  return res.redirect("/")
}

  

module.exports = { buildLogin, buildRegister, registerAccount, accountLogin, buildAccount, accountLogout, buildUpdateAccountView, updateAccount, updatePassword }
