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
        "id": "select2063623452",
        "maxSelect": 1,
        "name": "status",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "select",
        "values": [
          "running",
          "failed",
          "canceled",
          "success"
        ]
      },
      {
        "cascadeDelete": false,
        "collectionId": "pbc_2409499253",
        "hidden": false,
        "id": "relation4225294584",
        "maxSelect": 1,
        "minSelect": 0,
        "name": "job",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "relation"
      },
      {
        "hidden": false,
        "id": "number418120294",
        "max": null,
        "min": null,
        "name": "attempt",
        "onlyInt": false,
        "presentable": false,
        "required": false,
        "system": false,
        "type": "number"
      },
      {
        "hidden": false,
        "id": "json325763347",
        "maxSize": 0,
        "name": "result",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "json"
      },
      {
        "hidden": false,
        "id": "date3029767898",
        "max": "",
        "min": "",
        "name": "started",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "date"
      },
      {
        "hidden": false,
        "id": "date2790239036",
        "max": "",
        "min": "",
        "name": "finished",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "date"
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
    "id": "pbc_954540448",
    "indexes": [
      "CREATE INDEX `idx_EcaJFhIDen` ON `jobRuns` (`job`)"
    ],
    "listRule": "@request.auth.id = job.user",
    "name": "jobRuns",
    "system": false,
    "type": "base",
    "updateRule": null,
    "viewRule": "@request.auth.id = job.user"
  });

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_954540448");

  return app.delete(collection);
})
