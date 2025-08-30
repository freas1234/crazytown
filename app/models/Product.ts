import mongoose, { Schema, Document } from 'mongoose';
import { connectToDatabase } from '../../lib/db';
import { v4 as uuidv4 } from 'uuid';

interface IContent {
  en: string;
  ar: string;
}

export interface IProductData {
  name: IContent;
  description: IContent;
  price: number;
  salePrice?: number;
  imageUrl: string;
  category: string;
  featured: boolean;
  stock: number;
  digital: boolean;
  downloadUrl?: string;
  outOfStock?: boolean;
  outOfStockMessage?: IContent;
}

export interface IProduct extends Document {
  name: IContent;
  description: IContent;
  price: number;
  salePrice?: number;
  imageUrl: string;
  category: string;
  featured: boolean;
  stock: number;
  digital: boolean;
  downloadUrl?: string;
  outOfStock?: boolean;
  outOfStockMessage?: IContent;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductCategory {
  id: string;
  name: {
    en: string;
    ar: string;
  };
  order: number;
  active: boolean;
} 

const ContentSchema = new Schema({
  en: { type: String, required: true },
  ar: { type: String, required: true }
});

const ProductSchema = new Schema<IProduct>(
  {
    name: { 
      type: ContentSchema, 
      required: true 
    },
    description: { 
      type: ContentSchema, 
      required: true 
    },
    price: { 
      type: Number, 
      required: true 
    },
    salePrice: { 
      type: Number, 
      default: 0 
    },
    imageUrl: { 
      type: String 
    },
    category: { 
      type: String, 
      required: true 
    },
    featured: { 
      type: Boolean, 
      default: false 
    },
    stock: { 
      type: Number, 
      required: true 
    },
    digital: { 
      type: Boolean, 
      required: true 
    },
    downloadUrl: { 
      type: String 
    },
    outOfStock: {
      type: Boolean,
      default: false
    },
    outOfStockMessage: {
      type: ContentSchema,
      default: {
        en: 'Out of stock',
        ar: 'نفذت الكمية'
      }
    }
  },
  { 
    timestamps: true 
  }
);

// Don't recreate the model if it already exists
export default mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);

export async function getProducts() {
  try {
    console.log('Model: Fetching all products...');
    const { db } = await connectToDatabase();
    const productsCollection = db.collection('products');
    
    const products = await productsCollection.find().sort({ category: 1, name: 1 }).toArray();
    console.log(`Model: Found ${products.length} products`);
    return products;
  } catch (error) {
    console.error('Model: Error fetching products:', error);
    throw error;
  }
}

export async function getProductsByCategory(category: string) {
  try {
    console.log(`Model: Fetching products by category: ${category}`);
    const { db } = await connectToDatabase();
    const productsCollection = db.collection('products');
    
    const products = await productsCollection.find({ category }).sort({ name: 1 }).toArray();
    console.log(`Model: Found ${products.length} products in category ${category}`);
    return products;
  } catch (error) {
    console.error(`Model: Error fetching products by category ${category}:`, error);
    throw error;
  }
}

export async function getFeaturedProducts() {
  try {
    console.log('Model: Fetching featured products...');
    const { db } = await connectToDatabase();
    const productsCollection = db.collection('products');
    
    const products = await productsCollection.find({ featured: true }).limit(6).toArray();
    console.log(`Model: Found ${products.length} featured products`);
    return products;
  } catch (error) {
    console.error('Model: Error fetching featured products:', error);
    throw error;
  }
}

export async function getProduct(id: string) {
  try {
    console.log(`Model: Fetching product by id: ${id}`);
    const { db } = await connectToDatabase();
    const productsCollection = db.collection('products');
    
    const product = await productsCollection.findOne({ id });
    console.log(`Model: Product found: ${!!product}`);
    return product;
  } catch (error) {
    console.error(`Model: Error fetching product ${id}:`, error);
    throw error;
  }
}

export async function createProduct(productData: IProductData) {
  const { db } = await connectToDatabase();
  const productsCollection = db.collection('products');
  
  const now = new Date();
  const newProduct = {
    id: uuidv4(),
    ...productData,
    createdAt: now,
    updatedAt: now,
  };
  
  await productsCollection.insertOne(newProduct);
  return newProduct;
}

export async function updateProduct(id: string, productData: Partial<IProductData>) {
  const { db } = await connectToDatabase();
  const productsCollection = db.collection('products');
  
  const updatedProduct = {
    ...productData,
    updatedAt: new Date(),
  };
  
  await productsCollection.updateOne({ id }, { $set: updatedProduct });
  return { id, ...updatedProduct };
}

export async function deleteProduct(id: string) {
  const { db } = await connectToDatabase();
  const productsCollection = db.collection('products');
  
  await productsCollection.deleteOne({ id });
  return { id };
}

export async function getProductCategories() {
  try {
    console.log('Fetching product categories...');
    const { db } = await connectToDatabase();
    const categoriesCollection = db.collection('productCategories');
    
    const categories = await categoriesCollection.find().sort({ order: 1 }).toArray();
    console.log(`Found ${categories.length} product categories`);
    return categories;
  } catch (error) {
    console.error('Error fetching product categories:', error);
    throw error;
  }
}

export async function createProductCategory(categoryData: Omit<ProductCategory, 'id'>) {
  const { db } = await connectToDatabase();
  const categoriesCollection = db.collection('productCategories');
  
  const newCategory = {
    id: uuidv4(),
    ...categoryData,
  };
  
  await categoriesCollection.insertOne(newCategory);
  return newCategory;
}

export async function updateProductCategory(id: string, categoryData: Partial<Omit<ProductCategory, 'id'>>) {
  const { db } = await connectToDatabase();
  const categoriesCollection = db.collection('productCategories');
  
  await categoriesCollection.updateOne({ id }, { $set: categoryData });
  return { id, ...categoryData };
}

export async function deleteProductCategory(id: string) {
  const { db } = await connectToDatabase();
  const categoriesCollection = db.collection('productCategories');
  
  await categoriesCollection.deleteOne({ id });
  return { id };
} 