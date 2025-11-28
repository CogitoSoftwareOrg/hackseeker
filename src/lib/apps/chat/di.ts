import { ChatAppImpl } from './app';

export const getChatApp = () => {
	return new ChatAppImpl();
};
