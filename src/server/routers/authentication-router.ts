import { users } from '@/db/schema';
import { publicProcedure, t } from '@/server/trpc';
import { currentUser } from '@clerk/nextjs/server';

export const authenticationRouter = t.router({
  getDatabaseSyncStatus: publicProcedure.query(async ({ ctx }) => {
    const { db } = ctx;

    const auth = await currentUser();

    if (!auth) return { isSynced: false };

    const user = await db.query.users.findFirst({
      where: ({ externalId }, { eq }) => eq(externalId, auth.id),
    });

    if (!user) {
      await db.insert(users).values({
        externalId: auth.id,
        email: auth.emailAddresses[0].emailAddress,
      });

      return { isSynced: true };
    }

    return { isSynced: true };
  }),
});
