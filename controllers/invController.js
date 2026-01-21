const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
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
      })
    }

    const vehicleHTML = await utilities.buildVehicleDetail(data)
    let nav = await utilities.getNav()

    res.render("./inventory/detail", {
      title: `${data.inv_make} ${data.inv_model}`,
      nav,
      vehicle: vehicleHTML,
    })
  } catch (error) {
    next(error)
  }
}


module.exports = invCont