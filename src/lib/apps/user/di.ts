import { UserAppImpl } from './app';

export const getUserApp = () => {
	return new UserAppImpl();
};
