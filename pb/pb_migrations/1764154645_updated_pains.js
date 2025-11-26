/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_39366495")

  // update collection data
  unmarshal({
    "indexes": [
      "CREATE INDEX `idx_jCBkCcaR3P` ON `pains` (`user`)",
      "CREATE INDEX `idx_2UOUgaxBkS` ON `pains` (`chats`)"
    ]
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_39366495")

  // update collection data
  unmarshal({
    "indexes": []
  }, collection)

  return app.save(collection)
})
