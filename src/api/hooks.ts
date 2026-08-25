import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { BrowseFilters, fetchBrowse, fetchFacets, fetchWork } from './client';

const PAGE_SIZE = 40;

export function useFacets() {
  return useQuery({
    queryKey: ['facets'],
    queryFn: fetchFacets,
    staleTime: 1000 * 60 * 60 * 12,
  });
}

export function useBrowse(filters: BrowseFilters) {
  return useInfiniteQuery({
    queryKey: ['browse', filters],
    queryFn: ({ pageParam }) => fetchBrowse(filters, pageParam, PAGE_SIZE),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.page + 1 : undefined),
    staleTime: 1000 * 60 * 30,
  });
}

export function useWork(slug?: string) {
  return useQuery({
    queryKey: ['work', slug],
    queryFn: () => fetchWork(slug as string),
    enabled: Boolean(slug),
    staleTime: 1000 * 60 * 60,
  });
}
