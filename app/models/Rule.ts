import { connectToDatabase } from '../../lib/db';
import { v4 as uuidv4 } from 'uuid';

export interface Rule {
  id: string;
  category: string;
  title: {
    en: string;
    ar: string;
  };
  description: {
    en: string;
    ar: string;
  };
  order: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface RuleCategory {
  id: string;
  name: {
    en: string;
    ar: string;
  };
  order: number;
  active: boolean;
}

export async function getRules() {
  const { db } = await connectToDatabase();
  const rulesCollection = db.collection('rules');
  
  return rulesCollection.find().sort({ category: 1, order: 1 }).toArray();
}

export async function getRulesByCategory(category: string) {
  const { db } = await connectToDatabase();
  const rulesCollection = db.collection('rules');
  
  return rulesCollection.find({ category }).sort({ order: 1 }).toArray();
}

export async function getRule(id: string) {
  const { db } = await connectToDatabase();
  const rulesCollection = db.collection('rules');
  
  return rulesCollection.findOne({ id });
}

export async function createRule(ruleData: Omit<Rule, 'id' | 'createdAt' | 'updatedAt'>) {
  const { db } = await connectToDatabase();
  const rulesCollection = db.collection('rules');
  
  const now = new Date();
  const newRule = {
    id: uuidv4(),
    ...ruleData,
    createdAt: now,
    updatedAt: now,
  };
  
  await rulesCollection.insertOne(newRule);
  return newRule;
}

export async function updateRule(id: string, ruleData: Partial<Omit<Rule, 'id' | 'createdAt' | 'updatedAt'>>) {
  const { db } = await connectToDatabase();
  const rulesCollection = db.collection('rules');
  
  const updatedRule = {
    ...ruleData,
    updatedAt: new Date(),
  };
  
  await rulesCollection.updateOne({ id }, { $set: updatedRule });
  return { id, ...updatedRule };
}

export async function deleteRule(id: string) {
  const { db } = await connectToDatabase();
  const rulesCollection = db.collection('rules');
  
  await rulesCollection.deleteOne({ id });
  return { id };
}

export async function getRuleCategories() {
  const { db } = await connectToDatabase();
  const categoriesCollection = db.collection('ruleCategories');
  
  return categoriesCollection.find().sort({ order: 1 }).toArray();
}

export async function createRuleCategory(categoryData: Omit<RuleCategory, 'id'>) {
  const { db } = await connectToDatabase();
  const categoriesCollection = db.collection('ruleCategories');
  
  const newCategory = {
    id: uuidv4(),
    ...categoryData,
  };
  
  await categoriesCollection.insertOne(newCategory);
  return newCategory;
}

export async function updateRuleCategory(id: string, categoryData: Partial<Omit<RuleCategory, 'id'>>) {
  const { db } = await connectToDatabase();
  const categoriesCollection = db.collection('ruleCategories');
  
  await categoriesCollection.updateOne({ id }, { $set: categoryData });
  return { id, ...categoryData };
}

export async function deleteRuleCategory(id: string) {
  const { db } = await connectToDatabase();
  const categoriesCollection = db.collection('ruleCategories');
  const rulesCollection = db.collection('rules');
  
  await rulesCollection.deleteMany({ category: id });
  await categoriesCollection.deleteOne({ id });
  return { id };
} 