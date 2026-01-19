
export const ProductList = ({ products }) => {
    if (!products.length) return <div>No products found.</div>;

    return (
        <ul className="space-y-4">
            {products.map((product) => (
                <li key={product.id} className="p-4 bg-white shadow rounded-lg flex justify-between">
                    <span className="font-semibold">{product.name}</span>
                    <span className="text-gray-600">${product.price}</span>
                </li>
            ))}
        </ul>
    );
};
