/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_39366495")

  // add field
  collection.fields.addAt(9, new Field({
    "hidden": false,
    "id": "date1639016958",
    "max": "",
    "min": "",
    "name": "archived",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "date"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_39366495")

  // remove field
  collection.fields.removeById("date1639016958")

  return app.save(collection)
})
