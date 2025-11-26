/// <reference path="../pb_data/types.d.ts" />

onRecordCreate((e) => {
	e.next();

	const col = $app.findCollectionByNameOrId('subs');
	const record = new Record(col);
	record.set('user', e.record.id);
	$app.save(record);

	// after creation
}, 'users');
