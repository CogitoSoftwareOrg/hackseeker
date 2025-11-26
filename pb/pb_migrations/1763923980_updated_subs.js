/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3007198406")

  // update field
  collection.fields.addAt(1, new Field({
    "hidden": false,
    "id": "select2489655421",
    "maxSelect": 1,
    "name": "tariff",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "select",
    "values": [
      "free",
      "plus"
    ]
  }))

  // update field
  collection.fields.addAt(2, new Field({
    "hidden": false,
    "id": "select2063623452",
    "maxSelect": 1,
    "name": "status",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "select",
    "values": [
      "active",
      "incomplete",
      "trialing",
      "past_due",
      "canceled",
      "unpaid"
    ]
  }))

  // update field
  collection.fields.addAt(3, new Field({
    "hidden": false,
    "id": "select3141491994",
    "maxSelect": 1,
    "name": "stripeInterval",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "select",
    "values": [
      "year",
      "month"
    ]
  }))

  // update field
  collection.fields.addAt(12, new Field({
    "cascadeDelete": false,
    "collectionId": "_pb_users_auth_",
    "hidden": false,
    "id": "relation2375276105",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "user",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3007198406")

  // update field
  collection.fields.addAt(1, new Field({
    "hidden": false,
    "id": "select2489655421",
    "maxSelect": 1,
    "name": "tariff",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "free",
      "plus"
    ]
  }))

  // update field
  collection.fields.addAt(2, new Field({
    "hidden": false,
    "id": "select2063623452",
    "maxSelect": 1,
    "name": "status",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "active",
      "incomplete",
      "trialing",
      "past_due",
      "canceled",
      "unpaid"
    ]
  }))

  // update field
  collection.fields.addAt(3, new Field({
    "hidden": false,
    "id": "select3141491994",
    "maxSelect": 1,
    "name": "stripeInterval",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "year",
      "month"
    ]
  }))

  // update field
  collection.fields.addAt(12, new Field({
    "cascadeDelete": false,
    "collectionId": "_pb_users_auth_",
    "hidden": false,
    "id": "relation2375276105",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "user",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
})
