import { SvelteKitAuth, SvelteKitAuthConfig } from '@auth/sveltekit';
import Google from '@auth/sveltekit/providers/google';
import { AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET } from '$env/static/private';
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "../src/db/prisma";

const authOptions: SvelteKitAuthConfig = {
    adapter: PrismaAdapter(prisma),
    providers: [
        Google({
            clientId: AUTH_GOOGLE_ID,
            clientSecret: AUTH_GOOGLE_SECRET,
        }),
    ],
    trustHost: true, // Move this line outside of the callbacks object
};

export const { handle, signIn, signOut } = SvelteKitAuth(authOptions);