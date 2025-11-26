/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3007198406")

  // update collection data
  unmarshal({
    "indexes": [
      "CREATE INDEX `idx_CLTFpguxCM` ON `subs` (`user`)"
    ]
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3007198406")

  // update collection data
  unmarshal({
    "indexes": []
  }, collection)

  return app.save(collection)
})
