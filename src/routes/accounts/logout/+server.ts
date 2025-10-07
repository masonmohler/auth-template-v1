import { lucia } from '$lib/server/auth';
import { redirect } from '@sveltejs/kit';

export const POST = async ({ locals, cookies }) => {
	const session = locals.session;
	if (!session) {
		throw redirect(302, '/accounts/login');
	}

	await lucia.invalidateSession(session.id);
	const blankSessionCookie = lucia.createBlankSessionCookie();

	cookies.set(blankSessionCookie.name, blankSessionCookie.value, {
		...blankSessionCookie.attributes,
		path: '/'
	});

	throw redirect(302, '/accounts/login');
};

// Just add this form to use the logout button anywhere
// <form method="POST" action="/accounts/logout">
// 	<button>Logout</button>
// </form>
