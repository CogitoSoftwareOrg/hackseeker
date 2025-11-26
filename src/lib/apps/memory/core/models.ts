export enum ProfileType {
	General = 'general',
	Specific = 'specific'
}

export enum EventType {
	Story = 'story',
	Chat = 'chat',
	Action = 'action',
	Decision = 'decision'
}

export enum Importance {
	Low = 'low',
	Medium = 'medium',
	High = 'high'
}

export type ProfileMemory = {
	kind: 'profile';
	type: ProfileType;
	profileId: string;
	content: string;
	tokens: number;
	importance: Importance;
};

export type EventMemory = {
	kind: 'event';
	type: EventType;
	content: string;
	chatId: string;
	tokens: number;
	importance: Importance;
};

export type StaticMemory = {
	kind: 'static';
	content: string;
	tokens: number;
};

export type Memory = ProfileMemory | EventMemory | StaticMemory;
