/// <reference path="../pb_data/types.d.ts" />

onRecordCreate((e) => {
	e.record.set('status', 'active');
	e.record.set('tariff', 'free');
	e.record.set('stripeInterval', 'month');

	e.record.set('currentPeriodStart', new Date().toISOString());
	// MONTHLY LIMITS FOR FREE USERS
	e.record.set('pointsLimit', 100);

	e.next();
}, 'subs');

cronAdd('subs_usage_reset_monthly', '0 0 1 * *', () => {
	const subs = $app.findRecordsByFilter(
		'subs',
		"status = 'active' || status = 'trialing' || status = 'past_due'"
	);

	subs.forEach((s) => {
		s.set('pointsUsage', 0);
		$app.save(s);
	});
});
