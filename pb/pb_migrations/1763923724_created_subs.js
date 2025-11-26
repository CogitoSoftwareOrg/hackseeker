/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = new Collection({
    "createRule": null,
    "deleteRule": null,
    "fields": [
      {
        "autogeneratePattern": "[a-z0-9]{15}",
        "hidden": false,
        "id": "text3208210256",
        "max": 15,
        "min": 15,
        "name": "id",
        "pattern": "^[a-z0-9]+$",
        "presentable": false,
        "primaryKey": true,
        "required": true,
        "system": true,
        "type": "text"
      },
      {
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
      },
      {
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
      },
      {
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
      },
      {
        "hidden": false,
        "id": "date2201122646",
        "max": "",
        "min": "",
        "name": "currentPeriodEnd",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "date"
      },
      {
        "hidden": false,
        "id": "date4294391523",
        "max": "",
        "min": "",
        "name": "currentPeriodStart",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "date"
      },
      {
        "hidden": false,
        "id": "number1829536442",
        "max": null,
        "min": null,
        "name": "pointsLimit",
        "onlyInt": false,
        "presentable": false,
        "required": false,
        "system": false,
        "type": "number"
      },
      {
        "hidden": false,
        "id": "number3262198954",
        "max": null,
        "min": null,
        "name": "pointsUsage",
        "onlyInt": false,
        "presentable": false,
        "required": false,
        "system": false,
        "type": "number"
      },
      {
        "autogeneratePattern": "",
        "hidden": false,
        "id": "text599801048",
        "max": 0,
        "min": 0,
        "name": "stripeCustomer",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": false,
        "system": false,
        "type": "text"
      },
      {
        "autogeneratePattern": "",
        "hidden": false,
        "id": "text2607694909",
        "max": 0,
        "min": 0,
        "name": "stripePrice",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": false,
        "system": false,
        "type": "text"
      },
      {
        "autogeneratePattern": "",
        "hidden": false,
        "id": "text1300866958",
        "max": 0,
        "min": 0,
        "name": "stripeProduct",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": false,
        "system": false,
        "type": "text"
      },
      {
        "autogeneratePattern": "",
        "hidden": false,
        "id": "text957682068",
        "max": 0,
        "min": 0,
        "name": "stripeSub",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": false,
        "system": false,
        "type": "text"
      },
      {
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
      },
      {
        "hidden": false,
        "id": "autodate2990389176",
        "name": "created",
        "onCreate": true,
        "onUpdate": false,
        "presentable": false,
        "system": false,
        "type": "autodate"
      },
      {
        "hidden": false,
        "id": "autodate3332085495",
        "name": "updated",
        "onCreate": true,
        "onUpdate": true,
        "presentable": false,
        "system": false,
        "type": "autodate"
      }
    ],
    "id": "pbc_3007198406",
    "indexes": [],
    "listRule": "@request.auth.id = user",
    "name": "subs",
    "system": false,
    "type": "base",
    "updateRule": null,
    "viewRule": "@request.auth.id = user"
  });

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3007198406");

  return app.delete(collection);
})
