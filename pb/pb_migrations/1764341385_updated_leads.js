/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3705076665")

  // update collection data
  unmarshal({
    "createRule": "",
    "listRule": "@request.auth.id = pain.user",
    "updateRule": "@request.auth.id = pain.user",
    "viewRule": "@request.auth.id = pain.user"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3705076665")

  // update collection data
  unmarshal({
    "createRule": null,
    "listRule": null,
    "updateRule": null,
    "viewRule": null
  }, collection)

  return app.save(collection)
})
