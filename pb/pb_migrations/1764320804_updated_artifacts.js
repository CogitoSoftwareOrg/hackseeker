/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1303748624")

  // add field
  collection.fields.addAt(9, new Field({
    "hidden": false,
    "id": "select1251589529",
    "maxSelect": 1,
    "name": "importance",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "low",
      "mid",
      "high"
    ]
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1303748624")

  // remove field
  collection.fields.removeById("select1251589529")

  return app.save(collection)
})
