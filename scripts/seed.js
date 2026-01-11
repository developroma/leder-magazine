require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;

const ProductSchema = new mongoose.Schema({
    title: String,
    titleEn: String,
    titlePl: String,
    slug: String,
    description: String,
    price: Number,
    compareAtPrice: Number,
    category: String,
    variants: [{
        color: String,
        colorHex: String,
        size: String,
        stock: Number,
        priceModifier: Number,
        images: [String],
    }],
    labels: [String],
    status: String,
}, { timestamps: true });

const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

const CategorySchema = new mongoose.Schema({
    name: String,
    slug: { type: String, unique: true },
    description: String,
    image: String,
}, { timestamps: true });

const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);

const seedCategories = [
    {
        name: 'Сумки',
        slug: 'bags',
        description: 'Шкіряні сумки ручної роботи',
        image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600',
    },
    {
        name: 'Гаманці',
        slug: 'wallets',
        description: 'Компактні гаманці з натуральної шкіри',
        image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=600',
    },
    {
        name: 'Ремені',
        slug: 'belts',
        description: 'Класичні шкіряні ремені',
        image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600',
    },
    {
        name: 'Аксесуари',
        slug: 'accessories',
        description: 'Шкіряні аксесуари та подарунки',
        image: 'https://images.unsplash.com/photo-1611923134239-b9be5816e23c?w=600',
    },
];

const seedProducts = [
    {
        title: 'Шкіряна сумка "Classic"',
        titleEn: 'Leather Bag "Classic"',
        titlePl: 'Skórzana torba "Classic"',
        slug: 'leather-bag-classic',
        description: 'Елегантна сумка з натуральної шкіри ручної роботи.',
        price: 4500,
        compareAtPrice: 5200,
        category: 'bags',
        variants: [
            { color: 'Коричневий', colorHex: '#8B4513', stock: 5, priceModifier: 0, images: ['https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800'] },
            { color: 'Чорний', colorHex: '#1A1A1A', stock: 3, priceModifier: 0, images: ['https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800'] },
        ],
        labels: ['sale', 'bestseller'],
        status: 'active',
    },
    {
        title: 'Гаманець "Slim"',
        titleEn: 'Wallet "Slim"',
        titlePl: 'Portfel "Slim"',
        slug: 'wallet-slim',
        description: 'Компактний гаманець з відділеннями для карток та готівки.',
        price: 1800,
        category: 'wallets',
        variants: [
            { color: 'Коньяк', colorHex: '#D4A574', stock: 10, priceModifier: 0, images: ['https://images.unsplash.com/photo-1627123424574-724758594e93?w=800'] },
            { color: 'Тан', colorHex: '#D2B48C', stock: 7, priceModifier: 0, images: ['https://images.unsplash.com/photo-1606503825008-909a67e63c3d?w=800'] },
        ],
        labels: ['new'],
        status: 'active',
    },
    {
        title: 'Ремінь "Heritage"',
        titleEn: 'Belt "Heritage"',
        titlePl: 'Pasek "Heritage"',
        slug: 'belt-heritage',
        description: 'Класичний шкіряний ремінь з латунною пряжкою.',
        price: 1200,
        category: 'belts',
        variants: [
            { color: 'Коричневий', colorHex: '#8B4513', size: 'M', stock: 4, priceModifier: 0, images: ['https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=800'] },
            { color: 'Чорний', colorHex: '#1A1A1A', size: 'L', stock: 5, priceModifier: 0, images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800'] },
        ],
        labels: [],
        status: 'active',
    },
    {
        title: 'Сумка "Messenger"',
        titleEn: 'Bag "Messenger"',
        titlePl: 'Torba "Messenger"',
        slug: 'bag-messenger',
        description: 'Класична сумка-месенджер для ноутбука до 15 дюймів.',
        price: 5800,
        category: 'bags',
        variants: [
            { color: 'Vintage Brown', colorHex: '#6B3410', stock: 2, priceModifier: 200, images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800'] },
        ],
        labels: ['new'],
        status: 'active',
    },
    {
        title: 'Картхолдер "Minimal"',
        titleEn: 'Card Holder "Minimal"',
        titlePl: 'Etui na karty "Minimal"',
        slug: 'cardholder-minimal',
        description: 'Мінімалістичний картхолдер на 6 карток.',
        price: 850,
        category: 'wallets',
        variants: [
            { color: 'Чорний', colorHex: '#1A1A1A', stock: 15, priceModifier: 0, images: ['https://images.unsplash.com/photo-1611923134239-b9be5816e23c?w=800'] },
            { color: 'Бордовий', colorHex: '#722F37', stock: 8, priceModifier: 0, images: ['https://images.unsplash.com/photo-1611923134239-b9be5816e23c?w=800'] },
        ],
        labels: ['bestseller'],
        status: 'active',
    },
    {
        title: 'Ключниця "Keeper"',
        titleEn: 'Key Holder "Keeper"',
        titlePl: 'Etui na klucze "Keeper"',
        slug: 'keychain-keeper',
        description: 'Компактна ключниця з карабіном. Вміщує до 6 ключів.',
        price: 650,
        category: 'accessories',
        variants: [
            { color: 'Тан', colorHex: '#D2B48C', stock: 20, priceModifier: 0, images: ['https://images.unsplash.com/photo-1611923134239-b9be5816e23c?w=800'] },
        ],
        labels: [],
        status: 'active',
    },
    {
        title: 'Тоут "Urban"',
        titleEn: 'Tote "Urban"',
        titlePl: 'Torba tote "Urban"',
        slug: 'tote-urban',
        description: 'Просторий тоут для роботи та подорожей.',
        price: 6200,
        category: 'bags',
        variants: [
            { color: 'Коньяк', colorHex: '#D4A574', stock: 3, priceModifier: 0, images: ['https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800'] },
            { color: 'Оливковий', colorHex: '#556B2F', stock: 2, priceModifier: 300, images: ['https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800'] },
        ],
        labels: ['new'],
        status: 'active',
    },
    {
        title: 'Гаманець "Bifold"',
        titleEn: 'Wallet "Bifold"',
        titlePl: 'Portfel "Bifold"',
        slug: 'wallet-bifold',
        description: 'Класичний двоскладний гаманець з 8 слотами для карток.',
        price: 2200,
        category: 'wallets',
        variants: [
            { color: 'Коричневий', colorHex: '#8B4513', stock: 6, priceModifier: 0, images: ['https://images.unsplash.com/photo-1627123424574-724758594e93?w=800'] },
            { color: 'Темно-синій', colorHex: '#1E3A5F', stock: 4, priceModifier: 0, images: ['https://images.unsplash.com/photo-1627123424574-724758594e93?w=800'] },
        ],
        labels: [],
        status: 'active',
    },
    {
        title: 'Ремінь "Casual"',
        titleEn: 'Belt "Casual"',
        titlePl: 'Pasek "Casual"',
        slug: 'belt-casual',
        description: 'Повсякденний ремінь з матовою пряжкою.',
        price: 980,
        compareAtPrice: 1200,
        category: 'belts',
        variants: [
            { color: 'Тан', colorHex: '#D2B48C', size: 'M', stock: 8, priceModifier: 0, images: ['https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=800'] },
            { color: 'Тан', colorHex: '#D2B48C', size: 'L', stock: 6, priceModifier: 0, images: ['https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=800'] },
        ],
        labels: ['sale'],
        status: 'active',
    },
    {
        title: 'Портмоне "Travel"',
        titleEn: 'Wallet "Travel"',
        titlePl: 'Portfel "Travel"',
        slug: 'wallet-travel',
        description: 'Дорожнє портмоне з відділенням для паспорта.',
        price: 2800,
        category: 'wallets',
        variants: [
            { color: 'Коричневий', colorHex: '#8B4513', stock: 5, priceModifier: 0, images: ['https://images.unsplash.com/photo-1606503825008-909a67e63c3d?w=800'] },
        ],
        labels: [],
        status: 'active',
    },
    {
        title: 'Сумка "Crossbody"',
        titleEn: 'Bag "Crossbody"',
        titlePl: 'Torba "Crossbody"',
        slug: 'bag-crossbody',
        description: 'Компактна крос-боді сумка на кожен день.',
        price: 3200,
        category: 'bags',
        variants: [
            { color: 'Чорний', colorHex: '#1A1A1A', stock: 7, priceModifier: 0, images: ['https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800'] },
            { color: 'Бордовий', colorHex: '#722F37', stock: 4, priceModifier: 0, images: ['https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800'] },
        ],
        labels: ['bestseller'],
        status: 'active',
    },
    {
        title: 'Браслет "Simple"',
        titleEn: 'Bracelet "Simple"',
        titlePl: 'Bransoletka "Simple"',
        slug: 'bracelet-simple',
        description: 'Мінімалістичний шкіряний браслет.',
        price: 450,
        category: 'accessories',
        variants: [
            { color: 'Коричневий', colorHex: '#8B4513', stock: 25, priceModifier: 0, images: ['https://images.unsplash.com/photo-1611923134239-b9be5816e23c?w=800'] },
            { color: 'Чорний', colorHex: '#1A1A1A', stock: 20, priceModifier: 0, images: ['https://images.unsplash.com/photo-1611923134239-b9be5816e23c?w=800'] },
        ],
        labels: [],
        status: 'active',
    },
    {
        title: 'Рюкзак "Explorer"',
        titleEn: 'Backpack "Explorer"',
        titlePl: 'Plecak "Explorer"',
        slug: 'backpack-explorer',
        description: 'Шкіряний рюкзак з відділенням для ноутбука 15".',
        price: 7500,
        category: 'bags',
        variants: [
            { color: 'Vintage Brown', colorHex: '#6B3410', stock: 2, priceModifier: 0, images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800'] },
        ],
        labels: ['new'],
        status: 'active',
    },
    {
        title: 'Чохол для AirPods',
        titleEn: 'AirPods Case',
        titlePl: 'Etui na AirPods',
        slug: 'airpods-case',
        description: 'Захисний чохол для AirPods з карабіном.',
        price: 550,
        category: 'accessories',
        variants: [
            { color: 'Коньяк', colorHex: '#D4A574', stock: 15, priceModifier: 0, images: ['https://images.unsplash.com/photo-1611923134239-b9be5816e23c?w=800'] },
            { color: 'Чорний', colorHex: '#1A1A1A', stock: 12, priceModifier: 0, images: ['https://images.unsplash.com/photo-1611923134239-b9be5816e23c?w=800'] },
        ],
        labels: ['new'],
        status: 'active',
    },
    {
        title: 'Монетниця "Coin"',
        titleEn: 'Coin Pouch',
        titlePl: 'Portmonetka "Coin"',
        slug: 'coin-pouch',
        description: 'Компактна монетниця на кнопці.',
        price: 380,
        category: 'wallets',
        variants: [
            { color: 'Тан', colorHex: '#D2B48C', stock: 18, priceModifier: 0, images: ['https://images.unsplash.com/photo-1606503825008-909a67e63c3d?w=800'] },
        ],
        labels: [],
        status: 'active',
    },
];

async function seed() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        // Seed categories
        await Category.deleteMany({});
        await Category.insertMany(seedCategories);
        console.log(`Inserted ${seedCategories.length} categories`);

        // Seed products
        await Product.deleteMany({});
        await Product.insertMany(seedProducts);
        console.log(`Inserted ${seedProducts.length} products with EN/PL translations`);

        console.log('Seed completed!');
        process.exit(0);
    } catch (error) {
        console.error('Seed error:', error);
        process.exit(1);
    }
}

seed();
