import { lucia } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { redirect, fail } from '@sveltejs/kit';
import bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';

export const actions = {
	default: async ({ request, cookies }) => {
		const form = await request.formData();
		const username = form.get('username')?.toString() ?? '';
		const password = form.get('password')?.toString() ?? '';

		if (!username || !password) {
			return fail(400, { message: 'Missing username or password.' });
		}

		const user = await db.select().from(users).where(eq(users.username, username)).get();
		if (!user) {
			return fail(400, { message: 'Invalid username or password.' });
		}

		const validPassword = await bcrypt.compare(password, user.passwordHash);
		if (!validPassword) {
			return fail(400, { message: 'Invalid username or password.' });
		}

		// Create new session
		const session = await lucia.createSession(user.id, {});
		const sessionCookie = lucia.createSessionCookie(session.id);

		cookies.set(sessionCookie.name, sessionCookie.value, {
			...sessionCookie.attributes,
			path: '/'
		});

		// Optional: redirect after login
		throw redirect(302, '/dashboard');
	}
};
