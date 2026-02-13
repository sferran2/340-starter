// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require("../utilities/")
const invValidate = require("../utilities/inventory-validation")


// Route to build inventory by classification view- all users
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));

// Route to display ONE vehicle detail page by inventory id - all users
router.get("/detail/:inv_id", utilities.handleErrors(invController.buildDetail))

// Route to build inventory management view - admin only
router.get("/", utilities.checkAdminAccess,utilities.handleErrors(invController.buildManagement))

// Route to build add classification view- admin only
router.get(
  "/add-classification",
  utilities.checkAdminAccess,
  utilities.handleErrors(invController.buildAddClassification)
)

// Return inventory items as JSON based on selected classification (AJAX)- admin only
router.get(
  "/getInventory/:classification_id",
  utilities.checkAdminAccess,
  utilities.handleErrors(invController.getInventoryJSON)
)

// Route to build add inventory view- admin only
router.get(
  "/add-inventory",
  utilities.checkAdminAccess,
  utilities.handleErrors(invController.buildAddInventory)
)

// Deliver edit inventory view- admin only
router.get(
  "/edit/:inv_id",
  utilities.checkAdminAccess,
  utilities.handleErrors(invController.editInventoryView)
)

// Deliver delete confirmation view- admin only
router.get(
  "/delete/:inv_id",
  utilities.checkAdminAccess,
  utilities.handleErrors(invController.buildDeleteConfirm)
)

// Route to add new classification
router.post(
  "/add-classification",
  utilities.checkAdminAccess,
  invValidate.classificationRules(),
  invValidate.checkClassificationData,
  utilities.handleErrors(invController.addClassification)
)

// Route to add new inventory item
router.post(
  "/add-inventory",
  utilities.checkAdminAccess,
  invValidate.inventoryRules(),
  invValidate.checkInventoryData,
  utilities.handleErrors(invController.addInventory)
)
// Process inventory update
router.post(
  "/update",
  utilities.checkAdminAccess,
  invValidate.inventoryRules(),
  invValidate.checkUpdateData,
  utilities.handleErrors(invController.updateInventory)
)

// Process the delete
router.post(
  "/delete",
  utilities.checkAdminAccess,
  utilities.handleErrors(invController.deleteInventoryItem)
)

// update inventory status
router.post(
  "/status",
  utilities.checkAdminAccess,
  invValidate.statusRules(),
  invValidate.checkStatusData,
  utilities.handleErrors(invController.updateStatus)
)

// Add a review (logged-in users)
router.post(
  "/add-review",
  utilities.checkLogin,
  utilities.checkClientAccess,
  invValidate.reviewRules(),
  invValidate.checkReviewData,
  utilities.handleErrors(invController.addReview)
)

// Add dealer response to a review (Employee/Admin only)
router.post(
  "/add-response",
  utilities.checkAdminAccess,
  invValidate.responseRules(),
  invValidate.checkResponseData,
  utilities.handleErrors(invController.addReviewResponse)
)


module.exports = router;