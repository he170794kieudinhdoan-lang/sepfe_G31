
export const getProducts = () => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve([
                { id: '1', name: 'React Keyboard', price: 150 },
                { id: '2', name: 'TypeScript Mouse', price: 80 },
                { id: '3', name: 'Headphones 2025', price: 200 },
            ]);
        }, 500);
    });
};
