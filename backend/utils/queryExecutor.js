import mongoose from 'mongoose';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import Supplier from '../models/Supplier.js';
import StockMovement from '../models/StockMovement.js';

/**
 * Utility to safely execute generated queries against MongoDB
 */
export default class QueryExecutor {
  /**
   * Execute a SQL-like query against MongoDB collections
   * @param {string} query - The SQL-like query to execute
   * @returns {Promise<Array>} - Query results
   */
  async executeQuery(query) {
    try {
      // Parse the query to determine what we're looking for
      const queryLower = query.toLowerCase();
      
      // Handle MongoDB specific syntax
      if (queryLower.includes('aggregate(') || queryLower.includes('find(')) {
        return await this.executeMongoQuery(query);
      } else {
        // Handle SQL-like syntax
        return await this.executeSqlLikeQuery(query);
      }
    } catch (error) {
      console.error('Error executing query:', error);
      throw new Error(`Failed to execute query: ${error.message}`);
    }
  }

  /**
   * Execute a MongoDB-specific query
   * @param {string} query - MongoDB query string
   * @returns {Promise<Array>} - Query results
   */
  async executeMongoQuery(query) {
    try {
      // This is a simplified approach - in production, you'd want a more robust parser
      let collection = 'products'; // Default to products
      
      if (query.toLowerCase().includes('category')) {
        collection = 'categories';
      } else if (query.toLowerCase().includes('supplier')) {
        collection = 'suppliers';
      } else if (query.toLowerCase().includes('stockmovement')) {
        collection = 'stockmovements';
      }
      
      // Execute the query using eval (careful, this is simplified for demo purposes)
      // In production, you'd want to use a proper parser and validation
      const model = this.getModelForCollection(collection);
      
      // Make safe versions of query methods
      const safeFunctions = {
        find: (filter) => model.find(filter).lean().exec(),
        findOne: (filter) => model.findOne(filter).lean().exec(),
        aggregate: (pipeline) => model.aggregate(pipeline).exec(),
        count: (filter) => model.countDocuments(filter).exec()
      };
      
      // Replace model methods with safe versions
      const safeQuery = query
        .replace(/Product\.find\(/g, 'safeFunctions.find(')
        .replace(/Category\.find\(/g, 'safeFunctions.find(')
        .replace(/Supplier\.find\(/g, 'safeFunctions.find(')
        .replace(/StockMovement\.find\(/g, 'safeFunctions.find(')
        .replace(/\.findOne\(/g, '.find(')
        .replace(/\.aggregate\(/g, '.aggregate(')
        .replace(/\.count\(/g, '.count(');
      
      // Execute the safe query
      return await eval(`(async () => { return ${safeQuery} })()}`);
    } catch (error) {
      console.error('MongoDB query execution error:', error);
      throw new Error('Failed to execute MongoDB query');
    }
  }

  /**
   * Execute a SQL-like query by translating to MongoDB operations
   * @param {string} query - SQL query string
   * @returns {Promise<Array>} - Query results
   */
  async executeSqlLikeQuery(query) {
    const sqlLower = query.toLowerCase().trim();
    
    // Simplified SQL parser - in production use a proper SQL parser library
    if (sqlLower.startsWith('select')) {
      // Extract table/collection name
      let collectionMatch = sqlLower.match(/from\s+(\w+)/i);
      if (!collectionMatch) {
        throw new Error('Unable to determine collection from SQL query');
      }
      
      const collection = collectionMatch[1].toLowerCase();
      const model = this.getModelForCollection(collection);
      
      // Extract conditions if any
      let conditions = {};
      const whereMatch = sqlLower.match(/where\s+(.*?)(?:group by|order by|limit|$)/i);
      if (whereMatch) {
        // Very simplified condition parsing - would need proper SQL parsing in production
        const whereCondition = whereMatch[1].trim();
        
        // Handle common conditions
        if (whereCondition.includes('current_quantity < minimum_stock_level') || 
            whereCondition.includes('is_low_stock')) {
          // Low stock query
          return await Product.find({ $expr: { $lt: ['$currentQuantity', '$minimumStockLevel'] } }).lean();
        } else if (whereCondition.includes('=')) {
          // Simple equality
          const parts = whereCondition.split('=').map(p => p.trim());
          const field = this.transformFieldName(parts[0]);
          let value = parts[1].replace(/'/g, '').replace(/"/g, '');
          
          // Try to parse numbers
          if (!isNaN(value)) {
            value = Number(value);
          }
          
          conditions[field] = value;
        }
      }
      
      // Handle fields to select
      let projection = {};
      const selectMatch = sqlLower.match(/select\s+(.*?)\s+from/i);
      if (selectMatch && selectMatch[1] !== '*') {
        const fields = selectMatch[1].split(',').map(f => f.trim());
        fields.forEach(field => {
          projection[this.transformFieldName(field)] = 1;
        });
      }
      
      // Handle joins (basic support)
      if (sqlLower.includes('join')) {
        // This would require more complex logic with proper aggregation pipelines
        // For now, we'll use a basic approach for common joins
        
        if (sqlLower.includes('product') && sqlLower.includes('category')) {
          return await Product.find(conditions)
            .populate('category')
            .lean();
        } else if (sqlLower.includes('product') && sqlLower.includes('supplier')) {
          return await Product.find(conditions)
            .populate('supplier')
            .lean();
        } else if (sqlLower.includes('stockmovement') && sqlLower.includes('product')) {
          return await StockMovement.find(conditions)
            .populate('product')
            .lean();
        }
      }
      
      // Default query execution
      const query = Object.keys(projection).length > 0 
        ? model.find(conditions).select(projection)
        : model.find(conditions);
        
      return await query.lean().exec();
    } else {
      throw new Error('Only SELECT queries are supported');
    }
  }
  
  /**
   * Get the appropriate mongoose model for a collection name
   * @param {string} collection - Collection name
   * @returns {mongoose.Model} - Mongoose model
   */
  getModelForCollection(collection) {
    collection = collection.toLowerCase();
    
    if (collection === 'products' || collection === 'product') {
      return Product;
    } else if (collection === 'categories' || collection === 'category') {
      return Category;
    } else if (collection === 'suppliers' || collection === 'supplier') {
      return Supplier;
    } else if (collection === 'stockmovements' || collection === 'stockmovement') {
      return StockMovement;
    } else {
      throw new Error(`Unknown collection: ${collection}`);
    }
  }
  
  /**
   * Transform SQL-style field names to MongoDB field names
   * @param {string} field - SQL field name
   * @returns {string} - MongoDB field name
   */
  transformFieldName(field) {
    // Map common SQL field names to MongoDB field names
    const fieldMap = {
      'name': 'name',
      'description': 'description',
      'current_quantity': 'currentQuantity',
      'minimum_stock_level': 'minimumStockLevel',
      'price': 'price',
      'expiration_date': 'expirationDate',
      'is_low_stock': 'isLowStock',
      'created_at': 'createdAt',
      'updated_at': 'updatedAt',
      'movement_type': 'movementType',
      'quantity': 'quantity',
      'reason': 'reason',
      'movement_date': 'movementDate'
    };
    
    const normalizedField = field.toLowerCase().trim();
    return fieldMap[normalizedField] || normalizedField;
  }
} 