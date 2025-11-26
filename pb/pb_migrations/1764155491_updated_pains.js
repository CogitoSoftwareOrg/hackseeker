/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_39366495")

  // remove field
  collection.fields.removeById("json1704261234")

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_39366495")

  // add field
  collection.fields.addAt(6, new Field({
    "hidden": false,
    "id": "json1704261234",
    "maxSize": 0,
    "name": "searchQueries",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  return app.save(collection)
})
