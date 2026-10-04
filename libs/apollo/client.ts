import { ApolloClient, HttpLink, InMemoryCache, from, ApolloLink, type NormalizedCacheObject } from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { useMemo } from 'react';

let browserClient: ApolloClient<NormalizedCacheObject> | undefined;

function createApolloClient() {
	const authLink = new ApolloLink((operation, forward) => {
		const token = typeof window !== 'undefined' ? window.localStorage.getItem('accessToken') : null;
		operation.setContext(({ headers = {} }) => ({
			headers: { ...headers, ...(token ? { authorization: `Bearer ${token}` } : {}) },
		}));
		return forward(operation);
	});

	const errorLink = onError(({ graphQLErrors, networkError }) => {
		graphQLErrors?.forEach(({ message }) => console.error(`[GraphQL] ${message}`));
		if (networkError) console.error('[Network]', networkError.message);
	});

	return new ApolloClient({
		ssrMode: typeof window === 'undefined',
		link: from([
			errorLink,
			authLink,
			new HttpLink({ uri: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:9702/graphql' }),
		]),
		cache: new InMemoryCache(),
	});
}

export function initializeApollo(initialState?: NormalizedCacheObject) {
	const client = typeof window === 'undefined' ? createApolloClient() : (browserClient ??= createApolloClient());
	if (initialState) client.cache.restore(initialState);
	return client;
}

export function useApollo(initialState?: NormalizedCacheObject) {
	return useMemo(() => initializeApollo(initialState), [initialState]);
}
