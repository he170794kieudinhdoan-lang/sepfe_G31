
import { useEffect, useState } from 'react';
import { ProductList } from '../components/ProductList';
import { getProducts } from '../api/getProducts';

export const ProductsRoute = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getProducts().then((data) => {
            setProducts(data);
            setLoading(false);
        });
    }, []);

    if (loading) return <div className="p-10 text-center">Loading products...</div>;

    return (
        <div className="max-w-2xl mx-auto py-10">
            <h1 className="text-3xl font-bold mb-6">Marketplace</h1>
            <ProductList products={products} />
        </div>
    );
};
