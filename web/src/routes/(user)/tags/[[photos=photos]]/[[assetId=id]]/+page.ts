import { AppRoute, QueryParameter } from '$lib/constants';
import { authenticate } from '$lib/utils/auth';
import { getFormatter } from '$lib/utils/i18n';
import { getAssetInfoFromParam } from '$lib/utils/navigation';
import { getAllAlbums, getAllTags, getMyPreferences } from '@immich/sdk';
import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load = (async ({ params, url }) => {
  await authenticate(url);
  
  // Check if tags feature is enabled in user preferences
  const preferences = await getMyPreferences();
  if (!preferences?.tags?.enabled) {
    redirect(302, AppRoute.PHOTOS);
  }
  
  const asset = await getAssetInfoFromParam(params);
  const $t = await getFormatter();

  const [tags, albums] = await Promise.all([
    getAllTags(),
    getAllAlbums({})
  ]);

  return {
    path: url.searchParams.get(QueryParameter.PATH) ?? '',
    tags,
    albums,
    asset,
    meta: {
      title: $t('tags'),
    },
  };
}) satisfies PageLoad;
