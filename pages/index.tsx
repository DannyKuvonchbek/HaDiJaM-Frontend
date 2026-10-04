import { useMemo, useState } from 'react';
import { useQuery } from '@apollo/client';
import SiteLayout from '@/libs/components/layout/SiteLayout';
import HeroSection from '@/libs/components/homepage/HeroSection';
import HomeCategories from '@/libs/components/homepage/HomeCategories';
import HomeFeaturedCollection from '@/libs/components/homepage/HomeFeaturedCollection';
import HomePartnerBanner from '@/libs/components/homepage/HomePartnerBanner';
import HomeServices from '@/libs/components/homepage/HomeServices';
import HomeTrustSection from '@/libs/components/homepage/HomeTrustSection';
import HomeReviews from '@/libs/components/homepage/HomeReviews';
import { featuredProducts } from '@/libs/data/catalog';
import { GET_PRODUCTS } from '@/libs/graphql/products';
import type { ApiProduct, Product, ProductCategory } from '@/libs/types/product';

const supportedCategories: ProductCategory[] = ['ring', 'necklace', 'bracelet', 'chain', 'brooch', 'earring', 'watch'];

export default function HomePage() {
	const [activeCategory, setActiveCategory] = useState<'all' | ProductCategory>('all');
	const { data } = useQuery(GET_PRODUCTS, {
		variables: { input: { page: 1, limit: 4, sort: 'createdAt', direction: 'DESC', search: {} } },
		notifyOnNetworkStatusChange: true,
	});
	const products = useMemo<Product[]>(() => {
		const remote: ApiProduct[] | undefined = data?.getProducts?.list;
		if (!remote?.length) return featuredProducts;
		return remote.map((item, index) => ({
			id: item._id,
			title: item.productTitle,
			subtitle: item.productDesc?.slice(0, 68) || `${item.productType} · verified by HaDiJaM`,
			price: item.productPrice,
			image: item.productImages?.[0] ? `${process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:9702'}/${item.productImages[0]}` : featuredProducts[index % featuredProducts.length].image,
			category: (supportedCategories.includes(item.productType as ProductCategory) ? item.productType : 'ring') as ProductCategory,
			badge: 'Maison verified',
			seller: 'HaDiJaM Maison',
		}));
	}, [data]);
	const visibleProducts = activeCategory === 'all' ? products : products.filter((product) => product.category === activeCategory);

	return <SiteLayout>
		<HeroSection />
		<HomeCategories />
		<HomeFeaturedCollection products={visibleProducts} activeCategory={activeCategory} onCategoryChange={setActiveCategory} />
		<HomePartnerBanner />
		<HomeServices />
		<HomeTrustSection />
		<HomeReviews />
	</SiteLayout>;
}
