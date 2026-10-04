export type AccountTab = 'profile' | 'orders' | 'saved';

export type MemberProfile = {
	_id: string;
	memberType: 'USER' | 'SELLER' | 'ADMIN';
	memberStatus: string;
	memberPhone: string;
	memberNick: string;
	memberFullName?: string;
	memberImage?: string;
	memberAddress?: string;
	memberDesc?: string;
	memberProducts: number;
	memberFollowers: number;
	memberFollowings: number;
	memberPoints: number;
	memberRank: number;
	createdAt: string;
};

export type AccountOrder = {
	_id: string;
	orderStatus: string;
	orderPrice: number;
	deliveryAddress: string;
	deliveryPhone: string;
	paymentMethod: string;
	paymentStatus: string;
	createdAt: string;
	items: Array<{
		_id: string;
		productId: string;
		productTitle: string;
		productType: string;
		productImages: string[];
		unitPrice: number;
		quantity: number;
		itemPrice: number;
		itemStatus: string;
	}>;
};

export type SavedProduct = {
	_id: string;
	productType: string;
	productTitle: string;
	productPrice: number;
	productImages: string[];
	productDesc?: string;
};
