import AiService from '../services/aiService.js';
import QueryExecutor from '../utils/queryExecutor.js';

// Initialize services
const aiService = new AiService();
const queryExecutor = new QueryExecutor();

/**
 * Process a natural language query about inventory
 * @route POST /api/chat/query
 * @access Private
 */
export const processQuery = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ 
        success: false, 
        message: 'Query message is required' 
      });
    }

    // Step 1: Convert natural language to SQL query
    console.log(`Processing query: ${message}`);
    const sqlQuery = await aiService.convertToSQL(message);
    console.log(`Generated SQL query: ${sqlQuery}`);

    // Step 2: Execute the query against the database
    const results = await queryExecutor.executeQuery(sqlQuery);
    console.log(`Query execution returned ${results.length} results`);

    // Step 3: Convert the results back to natural language
    const response = await aiService.convertResultsToNaturalLanguage(
      message,
      sqlQuery,
      results
    );

    // Return the complete response
    return res.status(200).json({
      success: true,
      originalMessage: message,
      sqlQuery: sqlQuery,
      results: results,
      response: response
    });
  } catch (error) {
    console.error('Error processing natural language query:', error);
    return res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to process query',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

/**
 * Get query history for the current user
 * @route GET /api/chat/history
 * @access Private
 */
export const getQueryHistory = async (req, res) => {
  try {
    // In a real implementation, you would fetch from a database
    // For now, we'll return a stub response
    return res.status(200).json({
      success: true,
      history: [] // Would fetch from database in production
    });
  } catch (error) {
    console.error('Error fetching query history:', error);
    return res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to fetch query history' 
    });
  }
};

/**
 * Clear query history for the current user
 * @route DELETE /api/chat/history
 * @access Private
 */
export const clearQueryHistory = async (req, res) => {
  try {
    // In a real implementation, you would delete from a database
    // For now, we'll return a success response
    return res.status(200).json({
      success: true,
      message: 'Query history cleared'
    });
  } catch (error) {
    console.error('Error clearing query history:', error);
    return res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to clear query history' 
    });
  }
}; 