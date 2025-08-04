// synchronise auth status to database

'use client';

import { Heading } from '@/components/heading';
import { Icons } from '@/components/icons';
import { LoadingSpinner } from '@/components/loading-spinner';
import { client } from '@/lib/trpc';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const Page = () => {
  const router = useRouter();

  const { data } = useQuery({
    queryFn: async () => {
      const res = await client.authentication.getDatabaseSyncStatus.query();
      return res;
    },
    queryKey: ['get-database-sync-status'],
    refetchInterval: (query) => {
      return query.state.data?.isSynced ? false : 1000;
    },
  });

  useEffect(() => {
    if (data?.isSynced) router.push('/dashboard');
  }, [data, router]);

  return (
    <div className="flex w-full flex-1 items-center justify-center px-4">
      <Icons.backgroundPattern className="absolute inset-0 left-1/2 z-0 -translate-x-1/2 opacity-75" />

      <div className="relative z-10 flex -translate-y-1/2 flex-col items-center gap-6 text-center">
        <LoadingSpinner size={'md'} />

        <Heading>Creating your account...</Heading>
        <p className="text-base/7 text-gray-600 max-w-prose">
          Just a moment while we set up things for you.
        </p>
      </div>
    </div>
  );
};

export default Page;
