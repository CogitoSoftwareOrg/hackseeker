/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2359347971");

  return app.delete(collection);
}, (app) => {
  const collection = new Collection({
    "createRule": "@request.auth.id = pain.user",
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
        "autogeneratePattern": "",
        "hidden": false,
        "id": "text616412651",
        "max": 0,
        "min": 0,
        "name": "query",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": false,
        "system": false,
        "type": "text"
      },
      {
        "cascadeDelete": false,
        "collectionId": "pbc_39366495",
        "hidden": false,
        "id": "relation492519974",
        "maxSelect": 1,
        "minSelect": 0,
        "name": "pain",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "relation"
      },
      {
        "hidden": false,
        "id": "select2363381545",
        "maxSelect": 1,
        "name": "type",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "select",
        "values": [
          "problemDiscovery",
          "solutionTools",
          "diyHacks",
          "comparisonListicles",
          "communityPain",
          "communitySolutions",
          "launchExamples",
          "general"
        ]
      },
      {
        "hidden": false,
        "id": "number1493879504",
        "max": null,
        "min": null,
        "name": "offset",
        "onlyInt": false,
        "presentable": false,
        "required": false,
        "system": false,
        "type": "number"
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
    "id": "pbc_2359347971",
    "indexes": [
      "CREATE INDEX `idx_Yfr2KgPXpw` ON `searchQueries` (`pain`)"
    ],
    "listRule": "@request.auth.id = pain.user",
    "name": "searchQueries",
    "system": false,
    "type": "base",
    "updateRule": "@request.auth.id = pain.user",
    "viewRule": "@request.auth.id = pain.user"
  });

  return app.save(collection);
})
