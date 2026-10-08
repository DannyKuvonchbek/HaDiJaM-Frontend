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
import { getProductImage } from '@/libs/data/productImages';
import { getProductDisplayTitle } from '@/libs/data/productTitles';
import { GET_PRODUCTS } from '@/libs/graphql/products';
import type { ApiProduct, Product, ProductCategory } from '@/libs/types/product';

const supportedCategories: ProductCategory[] = ['ring', 'necklace', 'bracelet', 'chain', 'brooch', 'earring', 'watch'];

export default function HomePage() {
	const [activeCategory, setActiveCategory] = useState<'all' | ProductCategory>('all');
	const productQueryVariables = useMemo(() => ({
		input: {
			page: 1,
			limit: 4,
			sort: 'createdAt',
			direction: 'DESC',
			search: activeCategory === 'all' ? {} : { productType: activeCategory },
		},
	}), [activeCategory]);
	const { data } = useQuery(GET_PRODUCTS, {
		variables: productQueryVariables,
		notifyOnNetworkStatusChange: true,
	});
	const products = useMemo<Product[]>(() => {
		const remote: ApiProduct[] | undefined = data?.getProducts?.list;
		if (!remote?.length) return featuredProducts;
		return remote.map((item, index) => {
			const fallback = featuredProducts[index % featuredProducts.length].image;
			const category = (supportedCategories.includes(item.productType as ProductCategory) ? item.productType : 'ring') as ProductCategory;
			const uploadedImage = item.productImages?.[0] ? `${process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:9702'}/${item.productImages[0]}` : fallback;
			return {
				id: item._id,
				title: getProductDisplayTitle(category, item.productTitle, index),
				subtitle: item.productDesc?.slice(0, 68) || `${item.productType} · verified by HaDiJaM`,
				price: item.productPrice,
				image: getProductImage(category, item.productTitle, index, uploadedImage),
				category,
				badge: 'Maison verified',
				seller: 'HaDiJaM Maison',
				productLikes: item.productLikes ?? 0,
				meLiked: item.meLiked ?? [],
			};
		});
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
