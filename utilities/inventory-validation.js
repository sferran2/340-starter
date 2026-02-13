const utilities = require(".")
const { body, validationResult } = require("express-validator")
const invModel = require("../models/inventory-model")
const reviewModel = require("../models/reviews-model")


const validate = {}

/* ***************************
 * Classification Rules
 * ************************** */
validate.classificationRules = () => {
  return [
    body("classification_name")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Classification name is required.")
      .matches(/^[A-Za-z0-9]+$/)
      .withMessage(
        "Classification name must contain only letters and numbers (no spaces or special characters)."
      ),
  ]
}

/* ***************************
 * Check Classification Data
 * ************************** */
validate.checkClassificationData = async (req, res, next) => {
  let errors = validationResult(req)

  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    return res.render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      errors: errors.array(),
    })
  }
  next()
}

/* ***************************
 * Inventory Rules (Add + Update)
 * ************************** */
validate.inventoryRules = () => {
  return [
    body("classification_id")
      .notEmpty()
      .withMessage("Please choose a classification."),
    
    body("inv_status")
      .trim()
      .isIn(["Available", "Pending", "Sold"])
      .withMessage("Status must be Available, Pending, or Sold."),

    body("inv_make")
      .trim()
      .notEmpty()
      .withMessage("Make is required."),

    body("inv_model")
      .trim()
      .notEmpty()
      .withMessage("Model is required."),

    body("inv_year")
      .trim()
      .isInt({ min: 1900, max: 2099 })
      .withMessage("Year must be a number between 1900 and 2099."),

    body("inv_description")
      .trim()
      .notEmpty()
      .withMessage("Description is required."),

    body("inv_image")
      .trim()
      .notEmpty()
      .withMessage("Image path is required."),

    body("inv_thumbnail")
      .trim()
      .notEmpty()
      .withMessage("Thumbnail path is required."),

    body("inv_price")
      .trim()
      .isFloat({ min: 0 })
      .withMessage("Price must be a number 0 or greater."),

    body("inv_miles")
      .trim()
      .isInt({ min: 0 })
      .withMessage("Miles must be a whole number 0 or greater."),

    body("inv_color")
      .trim()
      .notEmpty()
      .withMessage("Color is required."),
  ]
}

/* ***************************
 * Check Inventory Data (Add)
 * ************************** */
validate.checkInventoryData = async (req, res, next) => {
  const {
    classification_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
  } = req.body

  let errors = validationResult(req)

  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    let classificationSelect = await utilities.buildClassificationList(classification_id)

    return res.status(400).render("inventory/add-inventory", {
      title: "Add Inventory",
      nav,
      classificationSelect,
      errors: errors.array(),
      classification_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
    })
  }
  next()
}

/* *****************************
 * Check Inventory Data (Update)
 * Return errors to edit view
 * ***************************** */
validate.checkUpdateData = async (req, res, next) => {
  const {
    inv_id,
    classification_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
  } = req.body

  let errors = validationResult(req)

  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    let classificationSelect = await utilities.buildClassificationList(classification_id)
    const itemName = `${inv_make} ${inv_model}`

    return res.status(400).render("inventory/edit-inventory", {
      title: "Edit " + itemName,
      nav,
      classificationSelect,
      errors: errors.array(),
      inv_id,
      classification_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
    })
  }
  next()
}

/* ***************************
 * Status Rules
 * ************************** */
validate.statusRules = () => {
  return [
    body("inv_id")
      .trim()
      .isInt({ min: 1 })
      .withMessage("Invalid vehicle id."),

    body("inv_status")
      .trim()
      .isIn(["Available", "Pending", "Sold"])
      .withMessage("Status must be Available, Pending, or Sold."),
  ]
}

/* ***************************
 * Check Status Data
 * ************************** */
validate.checkStatusData = async (req, res, next) => {
  let errors = validationResult(req)

  if (!errors.isEmpty()) {
    req.flash("notice", errors.array().map(e => e.msg).join(" "))
    return res.redirect("back")
  }
  next()
}

/* ***************************
 * Review Rules
 * ************************** */
validate.reviewRules = () => {
  return [
    body("inv_id")
      .trim()
      .isInt({ min: 1 })
      .withMessage("Invalid vehicle id."),

    body("rating")
      .trim()
      .isInt({ min: 1, max: 5 })
      .withMessage("Rating must be between 1 and 5."),

    body("review_text")
      .trim()
      .isLength({ min: 5 })
      .withMessage("Review must be at least 5 characters long."),
  ]
}

/* ***************************
 * Check Review Data
 * ************************** */
validate.checkReviewData = async (req, res, next) => {
  const { inv_id } = req.body
  let errors = validationResult(req)

  if (!errors.isEmpty()) {
    // Rebuild the vehicle detail page with reviews + errors
    let nav = await utilities.getNav()
    const vehicleData = await invModel.getInventoryById(inv_id)
    const vehicleHTML = await utilities.buildVehicleDetail(vehicleData)
    const reviews = await reviewModel.getReviewsByInvId(inv_id)

    return res.status(400).render("./inventory/detail", {
      title: `${vehicleData.inv_make} ${vehicleData.inv_model}`,
      nav,
      vehicle: vehicleHTML,
      reviews,
      inv_id,
      errors: errors.array(),
    })
  }
  next()
}

/* ***************************
 * Response Rules (Employee/Admin)
 * ************************** */
validate.responseRules = () => {
  return [
    body("review_id")
      .trim()
      .isInt({ min: 1 })
      .withMessage("Invalid review id."),

    body("inv_id")
      .trim()
      .isInt({ min: 1 })
      .withMessage("Invalid vehicle id."),

    body("response_text")
      .trim()
      .isLength({ min: 3 })
      .withMessage("Response must be at least 3 characters long."),
  ]
}

/* ***************************
 * Check Response Data
 * ************************** */
validate.checkResponseData = async (req, res, next) => {
  const { inv_id } = req.body
  let errors = validationResult(req)

  if (!errors.isEmpty()) {
    req.flash("notice", errors.array().map(e => e.msg).join(" "))
    return res.redirect(`/inv/detail/${inv_id}`)
  }
  next()
}


module.exports = validate
