const utilities = require("../utilities/")
const baseController = {}
const reviewModel = require("../models/reviews-model")

baseController.buildHome = async function(req, res){
  const nav = await utilities.getNav()

  // latest reviews across ALL vehicles
  const latestReviews = await reviewModel.getLatestReviews(5)

  res.render("index", {
    title: "Home",
    nav,
    latestReviews,
  })
}


baseController.throwError = async function (req, res, next) {
  throw new Error("Intentional 500 error for testing.")
}

module.exports = baseController
