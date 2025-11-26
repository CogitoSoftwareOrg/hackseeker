/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2409499253")

  // update collection data
  unmarshal({
    "createRule": "@request.auth.id = user",
    "listRule": "@request.auth.id = user",
    "viewRule": "@request.auth.id = user"
  }, collection)

  // add field
  collection.fields.addAt(9, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_954540448",
    "hidden": false,
    "id": "relation3750212598",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "lastRun",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2409499253")

  // update collection data
  unmarshal({
    "createRule": null,
    "listRule": null,
    "viewRule": null
  }, collection)

  // remove field
  collection.fields.removeById("relation3750212598")

  return app.save(collection)
})
