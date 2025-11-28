/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_39366495")

  // add field
  collection.fields.addAt(10, new Field({
    "hidden": false,
    "id": "file3291445124",
    "maxSelect": 1,
    "maxSize": 0,
    "mimeTypes": [],
    "name": "report",
    "presentable": false,
    "protected": false,
    "required": false,
    "system": false,
    "thumbs": [],
    "type": "file"
  }))

  // add field
  collection.fields.addAt(11, new Field({
    "hidden": false,
    "id": "file4013608469",
    "maxSelect": 1,
    "maxSize": 0,
    "mimeTypes": [],
    "name": "landing",
    "presentable": false,
    "protected": false,
    "required": false,
    "system": false,
    "thumbs": [],
    "type": "file"
  }))

  // add field
  collection.fields.addAt(12, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text2560465762",
    "max": 0,
    "min": 0,
    "name": "slug",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_39366495")

  // remove field
  collection.fields.removeById("file3291445124")

  // remove field
  collection.fields.removeById("file4013608469")

  // remove field
  collection.fields.removeById("text2560465762")

  return app.save(collection)
})
