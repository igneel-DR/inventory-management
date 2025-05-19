import OpenAI from 'openai';

/**
 * Service for handling AI-powered natural language processing via DeepSeek API
 */
export default class AiService {
  constructor() {
    this.apiKey = process.env.DEEPSEEK_API_KEY;
    this.apiEndpoint = process.env.DEEPSEEK_API_ENDPOINT || 'https://api.deepseek.com';
    this.model = process.env.DEEPSEEK_MODEL || 'deepseek-coder';
    
    // Initialize OpenAI client with DeepSeek endpoint
    this.client = new OpenAI({
      baseURL: this.apiEndpoint,
      apiKey: this.apiKey,
      // Only set this to true for frontend usage
      dangerouslyAllowBrowser: false,
    });
    
    // Database schema reference for the AI prompt
    this.dbSchema = `
      Product Schema:
      - _id: ObjectId
      - name: String (product name)
      - description: String (product description)
      - category: ObjectId (references Category)
      - supplier: ObjectId (references Supplier)
      - currentQuantity: Number (current stock quantity)
      - minimumStockLevel: Number (reorder point)
      - price: Number (product price)
      - expirationDate: Date (product expiration date, if applicable)
      - isLowStock: Virtual Boolean (true if currentQuantity < minimumStockLevel)
      - createdAt: Date (when the product was added)
      - updatedAt: Date (when the product was last updated)
      
      Category Schema:
      - _id: ObjectId
      - name: String (category name)
      - description: String (category description)
      - isActive: Boolean (whether category is active)
      
      Supplier Schema:
      - _id: ObjectId
      - name: String (supplier name)
      - email: String (supplier email)
      - phone: String (supplier phone)
      - company: String (supplier company name)
      - city: String (supplier location)
      
      StockMovement Schema:
      - _id: ObjectId
      - product: ObjectId (references Product)
      - movementType: String (enum: 'in', 'out')
      - quantity: Number (quantity moved)
      - reason: String (reason for movement)
      - movementDate: Date (when movement occurred)
      - createdAt: Date (record creation timestamp)
    `;
  }

  /**
   * Convert natural language query to SQL query
   * @param {string} userQuery - User's natural language query
   * @returns {Promise<string>} - Generated SQL query
   */
  async convertToSQL(userQuery) {
    try {
      const prompt = `
        You are a database expert translating natural language questions about inventory into SQL queries.
        
        DATABASE SCHEMA:
        ${this.dbSchema}
        
        TASK:
        - Analyze the user's question and generate the appropriate SQL query based on the schema.
        - Return ONLY the SQL query without any explanations or comments.
        - The SQL must be compatible with MongoDB's aggregation pipeline syntax.
        - Support multilingual queries (Arabic, French, English, etc.).
        - For questions about low stock, reference the isLowStock virtual property.
        - For time-based queries, use the appropriate date operations.
        - NEVER ask for clarification - make reasonable assumptions if needed.
        - Use proper variable naming and avoid SQL injection risks.
        - DO NOT include anything other than the SQL query in your response.
        
        USER QUESTION: "${userQuery}"
        
        SQL QUERY:
      `;

      // Create completion with retry logic
      let retries = 0;
      const maxRetries = 3;
      let error;
      
      while (retries < maxRetries) {
        try {
          const completion = await this.client.chat.completions.create({
            model: this.model,
            messages: [
              { 
                role: 'system', 
                content: 'You are a database expert that converts natural language to SQL queries. Respond only with valid SQL.' 
              },
              { 
                role: 'user', 
                content: prompt 
              }
            ],
            temperature: 0.1,
            max_tokens: 1500
          });
          
          // Extract and validate the SQL query
          const sqlQuery = completion.choices[0].message.content.trim();
          return this.sanitizeQuery(sqlQuery);
        } catch (err) {
          error = err;
          retries++;
          if (retries < maxRetries) {
            // Wait with exponential backoff
            await new Promise(resolve => setTimeout(resolve, 1000 * retries));
          }
        }
      }
      
      // If we get here, all retries failed
      console.error('Error converting to SQL after retries:', error);
      throw new Error('Failed to process natural language query');
    } catch (error) {
      console.error('Error converting to SQL:', error);
      throw new Error('Failed to process natural language query');
    }
  }

  /**
   * Sanitize and validate the SQL query for security
   * @param {string} query - The SQL query to sanitize
   * @returns {string} - Sanitized SQL query
   */
  sanitizeQuery(query) {
    // Remove any potentially dangerous commands
    const dangerousCommands = [
      'DROP', 'DELETE', 'TRUNCATE', 'ALTER', 'UPDATE', 'INSERT',
      'CREATE', 'GRANT', 'REVOKE', 'EXEC', 'EXECUTE'
    ];

    // Basic validation to ensure we're only allowing read operations
    const queryUpperCase = query.toUpperCase();
    
    for (const cmd of dangerousCommands) {
      if (queryUpperCase.includes(cmd)) {
        throw new Error('Unauthorized operation detected in query');
      }
    }

    // Ensure query is SELECT only
    if (!queryUpperCase.trim().startsWith('SELECT') && 
        !queryUpperCase.includes('FIND(') && 
        !queryUpperCase.includes('AGGREGATE(')) {
      throw new Error('Only read operations are allowed');
    }

    return query;
  }

  /**
   * Convert SQL results to natural language response
   * @param {string} userQuery - Original user query
   * @param {string} sqlQuery - Generated SQL query
   * @param {Array} results - SQL query results
   * @returns {Promise<string>} - Natural language response
   */
  async convertResultsToNaturalLanguage(userQuery, sqlQuery, results) {
    try {
      const prompt = `
        You are an inventory assistant that explains database results in natural language.
        
        USER QUESTION: "${userQuery}"
        
        SQL QUERY USED: "${sqlQuery}"
        
        QUERY RESULTS: ${JSON.stringify(results, null, 2)}
        
        Provide a clear, concise response that answers the user's question based on these results.
        - Match the language of the user's question (Arabic, French, English, etc.)
        - Be direct and informative
        - Include relevant numbers and specific product names when appropriate
        - Format lists if needed for readability
        - If results are empty, explain that no matching data was found
        
        YOUR RESPONSE:
      `;

      // Create completion with retry logic
      let retries = 0;
      const maxRetries = 3;
      let error;
      
      while (retries < maxRetries) {
        try {
          const completion = await this.client.chat.completions.create({
            model: this.model,
            messages: [
              { 
                role: 'system', 
                content: 'You are a helpful inventory assistant that explains database results clearly.' 
              },
              { 
                role: 'user', 
                content: prompt 
              }
            ],
            temperature: 0.7,
            max_tokens: 1500
          });
          
          return completion.choices[0].message.content.trim();
        } catch (err) {
          error = err;
          retries++;
          if (retries < maxRetries) {
            // Wait with exponential backoff
            await new Promise(resolve => setTimeout(resolve, 1000 * retries));
          }
        }
      }
      
      // If we get here, all retries failed
      console.error('Error converting results to natural language after retries:', error);
      throw new Error('Failed to generate natural language response');
    } catch (error) {
      console.error('Error converting results to natural language:', error);
      throw new Error('Failed to generate natural language response');
    }
  }
} 