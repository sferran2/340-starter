const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")
const invCont = {}
const reviewModel = require("../models/reviews-model")


// Build inventory by classification view

invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
}

invCont.buildDetail = async function (req, res, next) {
  try {
    const inv_id = req.params.inv_id
    const data = await invModel.getInventoryById(inv_id)

    if (!data) {
      let nav = await utilities.getNav()
      return res.status(404).render("./inventory/detail", {
        title: "Vehicle Not Found",
        nav,
        vehicle: null,
        reviews: [],
        inv_id: null,
      })
    }

    const vehicleHTML = await utilities.buildVehicleDetail(data)
    const reviews = await reviewModel.getReviewsByInvId(inv_id)
    let nav = await utilities.getNav()

    res.render("./inventory/detail", {
      title: `${data.inv_make} ${data.inv_model}`,
      nav,
      vehicle: vehicleHTML,
      reviews,
      inv_id, 
    })
  } catch (error) {
    next(error)
  }
}


// Build add classification view
invCont.buildAddClassification = async function (req, res, next) {
  let nav = await utilities.getNav()

  const classificationSelect = await utilities.buildClassificationList()

  res.render("inventory/add-classification", {
    title: "Add Classification",
    nav,
    classificationSelect,
    errors: null,
  })
}

// Build inventory management view
invCont.buildManagement = async function (req, res, next) {
  let nav = await utilities.getNav()
  
  const classificationSelect = await utilities.buildClassificationList()

  res.render("inventory/management", {
    title: "Inventory Management",
    nav,
    classificationSelect,
  })
}


// Add new classification to database
invCont.addClassification = async function (req, res, next) {
  const { classification_name } = req.body

  const addResult = await invModel.addClassification(classification_name)

  if (addResult && addResult.rows) {
    req.flash("notice", `Success: "${classification_name}" classification was added.`)

    let nav = await utilities.getNav()
    res.render("inventory/management", {
      title: "Inventory Management",
      nav,
    })
  } else {
    req.flash("notice", "Sorry, the classification could not be added.")

    let nav = await utilities.getNav()
    res.render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      errors: null,
    })
  }
}

// Build add inventory view
invCont.buildAddInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  let classificationSelect = await utilities.buildClassificationList()
  res.render("inventory/add-inventory", {
    title: "Add Inventory",
    nav,
    classificationSelect,
    errors: null,
  })
}

// Add new inventory item to database
invCont.addInventory = async function (req, res, next) {
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

  const addResult = await invModel.addInventoryItem(
    classification_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color
  )

  if (addResult && addResult.rows) {
    req.flash(
      "notice",
      `Success: ${inv_year} ${inv_make} ${inv_model} was added to inventory.`
    )

    let nav = await utilities.getNav()
    const classificationSelect = await utilities.buildClassificationList()
    res.render("inventory/management", {
      title: "Inventory Management",
      nav,
      classificationSelect,
    })
  } else {
    req.flash("notice", "Sorry, the inventory item could not be added.")

    let nav = await utilities.getNav()
    let classificationSelect = await utilities.buildClassificationList(classification_id)

    res.render("inventory/add-inventory", {
      title: "Add Inventory",
      nav,
      classificationSelect,
      errors: null,

      // sticky values
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
}


// Return Inventory by Classification As JSON (AJAX endpoint)

invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData[0].inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
}


// Build edit inventory view

invCont.editInventoryView = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id)
  let nav = await utilities.getNav()

  const itemData = await invModel.getInventoryById(inv_id)

  const classificationSelect = await utilities.buildClassificationList(
    itemData.classification_id
  )

  const itemName = `${itemData.inv_make} ${itemData.inv_model}`

  res.render("./inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationSelect,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_description: itemData.inv_description,
    inv_image: itemData.inv_image,
    inv_thumbnail: itemData.inv_thumbnail,
    inv_price: itemData.inv_price,
    inv_miles: itemData.inv_miles,
    inv_color: itemData.inv_color,
    classification_id: itemData.classification_id,
    inv_status: itemData.inv_status, 
  })
}


// Build delete confirmation view
 
invCont.buildDeleteConfirm = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id)
  let nav = await utilities.getNav()

  const itemData = await invModel.getInventoryById(inv_id)

  const itemName = `${itemData.inv_make} ${itemData.inv_model}`

  res.render("./inventory/delete-confirm", {
    title: "Delete " + itemName,
    nav,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_price: itemData.inv_price,
  })
}


//  Update Inventory Data

invCont.updateInventory = async function (req, res, next) {
 let nav = await utilities.getNav()

  const {
    inv_id,
    inv_status,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body

  const updateResult = await invModel.updateInventory(
    inv_id,
    inv_status,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id
  )

  if (updateResult) {
    const itemName = updateResult.inv_make + " " + updateResult.inv_model
    req.flash("notice", `The ${itemName} was successfully updated.`)
    return res.redirect("/inv/")
  } else {
    const classificationSelect = await utilities.buildClassificationList(classification_id)
    const itemName = `${inv_make} ${inv_model}`
    req.flash("notice", "Sorry, the update failed.")
    return res.status(501).render("inventory/edit-inventory", {
      title: "Edit " + itemName,
      nav,
      classificationSelect,
      errors: null,
      inv_id,
      inv_status,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classification_id
    })
  }
}


// Delete Inventory Item

invCont.deleteInventoryItem = async function (req, res, next) {
  const inv_id = parseInt(req.body.inv_id)

  const deleteResult = await invModel.deleteInventoryItem(inv_id)

  if (deleteResult) {
    req.flash("notice", "The inventory item was successfully deleted.")
    return res.redirect("/inv/")
  } else {
    req.flash("notice", "Sorry, the delete failed.")
    return res.redirect(`/inv/delete/${inv_id}`)
  }
}

// Update Vehicle Status

invCont.updateStatus = async function (req, res) {
  try {
    const { inv_id, inv_status } = req.body

    const updatedVehicle = await invModel.updateVehicleStatus(inv_id, inv_status)

    if (!updatedVehicle) {
      req.flash("notice", "Sorry, the status update failed.")
      return res.redirect("back")
    }

    req.flash("notice", "Vehicle status updated successfully.")
    return res.redirect(`/inv/detail/${inv_id}`)
  } catch (error) {
    console.error(error)
    req.flash("notice", "Server error: status update failed.")
    return res.redirect("back")
  }
}

// Add Review
invCont.addReview = async function (req, res, next) {
  try {
    const { inv_id, rating, review_text } = req.body
    const account_id = res.locals.accountData.account_id

    await reviewModel.addReview(inv_id, account_id, rating, review_text)

    req.flash("notice", "Thanks! Your review was added.")
    return res.redirect(`/inv/detail/${inv_id}`)
  } catch (error) {
    next(error)
  }
}

// Add / Update Dealer Response (Employee/Admin)
invCont.addReviewResponse = async function (req, res, next) {
  try {
    const { review_id, inv_id, response_text } = req.body
    const response_account_id = res.locals.accountData.account_id

    await reviewModel.addResponse(review_id, response_text, response_account_id)

    req.flash("notice", "Response saved.")
    return res.redirect(`/inv/detail/${inv_id}`)
  } catch (error) {
    next(error)
  }
}



module.exports = invCont