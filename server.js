/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/
/* ***********************
 * Require Statements
 *************************/
const session = require("express-session")
const pool = require('./database/')
const express = require("express")
const bodyParser = require("body-parser")
const expressLayouts = require("express-ejs-layouts")
const env = require("dotenv").config()
const app = express()
const static = require("./routes/static")
const baseController = require("./controllers/baseController")
const inventoryRoute = require("./routes/inventoryRoute")
const accountRoute = require("./routes/accountRoute")
const utilities = require("./utilities/")
const cookieParser = require("cookie-parser")

/* ***********************
 * Middleware
 * ************************/
app.use(session({
  store: new (require('connect-pg-simple')(session))({
    createTableIfMissing: true,
    pool,
  }),
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  name: 'sessionId',
}))

// Body parser middleware
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

// Express Messages Middleware
app.use(require('connect-flash')())
app.use(function(req, res, next){
  res.locals.messages = require('express-messages')(req, res)
  next()
})

// cookies
app.use(cookieParser())

// JWT middleware
app.use(utilities.checkJWTToken)


/* ***********************
 * View Engine and Templates
 *************************/

app.set("view engine", "ejs")
app.use(expressLayouts)
app.set("layout", "./layouts/layout") // not at views root

/* ***********************
 * Routes
 *************************/

app.use(static)

// Index Route
app.get("/", utilities.handleErrors(baseController.buildHome))

// Intentional error route 
app.get("/trigger-error", utilities.handleErrors(baseController.throwError))

// Inventory routes
app.use("/inv", inventoryRoute)
app.use("/account", accountRoute)

/* ***********************
 * 404 Handler
 * Place after all routes
 *************************/
app.use((req, res, next) => {
  next({ status: 404, message: "Sorry, we couldn't find that page. 🚧" })
})

/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/

const host = process.env.HOST
const port = process.env.PORT || 5500

/* ***********************
* Express Error Handler
* Place after all other middleware
*************************/
app.use(async (err, req, res, next) => {
  let nav = await utilities.getNav()
  console.error(`Error at: "${req.originalUrl}": ${err.message}`)
  let message
  if (err.status == 404) {
    message = err.message
  } else {
  message = "Oh no! There was a crash. Maybe try a different route?"
  }
  res.status(err.status || 500).render("errors/error", {
    title: err.status || 'Server Error',
    message,
    nav
  })
})

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`)
})
