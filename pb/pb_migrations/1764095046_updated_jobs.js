/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2409499253")

  // add field
  collection.fields.addAt(10, new Field({
    "hidden": false,
    "id": "date3939682449",
    "max": "",
    "min": "",
    "name": "locked",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "date"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2409499253")

  // remove field
  collection.fields.removeById("date3939682449")

  return app.save(collection)
})
