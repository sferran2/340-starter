// Needed Resources
const express = require("express")
const router = new express.Router()
const utilities = require("../utilities/")
const accountController = require("../controllers/accountController")
const regValidate = require('../utilities/account-validation')

// Route to build login view (My Account link)
router.get(
  "/login",
  utilities.handleErrors(accountController.buildLogin)
)

// Route to build registration view (Rgister here link)
router.get(
  "/register",
  utilities.handleErrors(accountController.buildRegister)
)
// Process registration data
router.post(
  "/register",
  regValidate.registationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
)

module.exports = router
