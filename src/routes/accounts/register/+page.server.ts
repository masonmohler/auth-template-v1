import { lucia } from '$lib/server/auth';
import { db } from '$lib/server/db';
import bcrypt from 'bcrypt';
import { fail } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { users } from '$lib/server/db/schema';
import { generateId } from 'lucia';
import { redirect } from '@sveltejs/kit';

export const actions = {
	default: async ({ request, cookies }) => {
		const form = await request.formData();
		const username = form.get('username')?.toString() ?? '';
		const password = form.get('password')?.toString() ?? '';

		if (!username || !password) {
			return fail(400, { message: 'Missing username or password.' });
		}

		const existingUser = await db.select().from(users).where(eq(users.username, username)).get();
		if (existingUser) {
			return fail(400, { message: 'Username already taken.' });
		}

		const hashedPassword = await bcrypt.hash(password, 10);
		try {
			const userId = generateId(15);
			await db.insert(users).values({
				id: userId,
				username,
				passwordHash: hashedPassword
			});

			const session = await lucia.createSession(userId, {});
			const sessionCookie = lucia.createSessionCookie(session.id);
			cookies.set(sessionCookie.name, sessionCookie.value, {
				...sessionCookie.attributes,
				path: '/'
			});
			throw redirect(302, '/accounts/login');
		} catch (err) {
			console.error(err);
			return fail(400, { message: 'User already exists' });
		}
	}
};
