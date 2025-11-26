// import { ENV, PB_EMAIL, PB_PASSWORD } from '$env/static/private';
// import { pb } from '../pb';

// const TELEGRAM_API_URL = 'https://api.telegram.org/bot';

// export async function handleUpdate(update: Record<string, any>) {
// 	await sendMessage(update.message.chat.id, update.message.text, update.message.from.id);
// }

// async function sendMessage(chatId: number, text: string, token: string) {
// 	await fetch(`${TELEGRAM_API_URL}${token}/sendMessage`, {
// 		method: 'POST',
// 		headers: { 'Content-Type': 'application/json' },
// 		body: JSON.stringify({ chat_id: chatId, text })
// 	}).catch(console.error);
// }

// export async function setWebhook(webhookUrl: string) {
// 	await fetch(`${TELEGRAM_API_URL}${webhookUrl}/setWebhook`, {
// 		method: 'POST',
// 		headers: { 'Content-Type': 'application/json' },
// 		body: JSON.stringify({ url: webhookUrl })
// 	});
// }

// export async function startPolling(token: string) {
// 	console.log(`Starting Telegram polling for token ${token}...`);
// 	let offset = 0;

// 	const apiUrl = `${TELEGRAM_API_URL}${token}/getUpdates`;

// 	(async () => {
// 		while (true) {
// 			try {
// 				const res = await fetch(apiUrl, {
// 					method: 'POST',
// 					headers: { 'Content-Type': 'application/json' },
// 					body: JSON.stringify({
// 						offset,
// 						timeout: 30 // long polling
// 					})
// 				});

// 				const data = await res.json();
// 				if (!data.ok) {
// 					console.error('getUpdates error:', data);
// 					await new Promise((r) => setTimeout(r, 2000));
// 					continue;
// 				}

// 				for (const update of data.result || []) {
// 					offset = update.update_id + 1;
// 					await handleUpdate(update);
// 				}
// 			} catch (e) {
// 				console.error('Polling error:', e);
// 				await new Promise((r) => setTimeout(r, 2000));
// 			}
// 		}
// 	})().catch((err) => {
// 		console.error(`Polling crashed for token ${token}:`, err);
// 	});
// }

// async function initializeTelegramBots() {
// 	await pb.collection('_superusers').authWithPassword(PB_EMAIL, PB_PASSWORD);

// 	try {
// 		const users = await pb.collection('users').getFullList({ filter: 'tgBotToken != ""' });

// 		if (ENV) {
// 			console.log(`Starting polling for ${users.length} Telegram bot(s)...`);
// 			for (const user of users) {
// 				startPolling(user.tgBotToken);
// 			}
// 		} else if (ENV === 'production') {
// 			console.log(`Setting webhooks for ${users.length} Telegram bot(s)...`);
// 			for (const user of users) {
// 				await setWebhook(user.tgBotToken).catch((err) => {
// 					console.error(`Failed to set webhook for user ${user.id}:`, err);
// 				});
// 			}
// 		}
// 	} catch (err) {
// 		console.error('Failed to initialize Telegram bots:', err);
// 	}
// }

// initializeTelegramBots();
