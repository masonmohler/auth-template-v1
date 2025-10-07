import { lucia } from '$lib/server/auth';

declare module '@sveltejs/kit' {
	interface Locals {
		user: import('lucia').User | null;
		session: import('lucia').Session | null;
	}
}

export const handle = async ({ event, resolve }) => {
	const sessionId = event.cookies.get(lucia.sessionCookieName);
	if (!sessionId) {
		event.locals.user = null;
		event.locals.session = null;
		return resolve(event);
	}

	const { session, user } = await lucia.validateSession(sessionId);
	if (session && session.fresh) {
		const cookie = lucia.createSessionCookie(session.id);
		event.cookies.set(cookie.name, cookie.value, {
			...cookie.attributes,
			path: '/'
		});
	}
	if (!session) {
		const blank = lucia.createBlankSessionCookie();
		event.cookies.set(blank.name, blank.value, {
			...blank.attributes,
			path: '/'
		});
	}

	event.locals.user = user;
	event.locals.session = session;

	return resolve(event);
};
