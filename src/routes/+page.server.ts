import { redirect } from '@sveltejs/kit';

export const load = async ({ locals }) => {
	if (locals.user) {
		throw redirect(302, '/dashboard');
	}
	throw redirect(302, '/accounts/register');
};
