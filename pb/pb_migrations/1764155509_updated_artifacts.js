/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1303748624")

  // update collection data
  unmarshal({
    "indexes": [
      "CREATE INDEX `idx_zPQcODwKRV` ON `artifacts` (`pain`)",
      "CREATE INDEX `idx_eB7k8a1JgC` ON `artifacts` (`searchQuery`)"
    ]
  }, collection)

  // add field
  collection.fields.addAt(6, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_2359347971",
    "hidden": false,
    "id": "relation3812884381",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "searchQuery",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1303748624")

  // update collection data
  unmarshal({
    "indexes": [
      "CREATE INDEX `idx_zPQcODwKRV` ON `artifacts` (`pain`)"
    ]
  }, collection)

  // remove field
  collection.fields.removeById("relation3812884381")

  return app.save(collection)
})
