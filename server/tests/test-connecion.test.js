import { db_config } from "../config/database.js";

async function testDatabaseConnection() {
    console.log(`Starting database test connection: `);
    let connection;
    try {
        connection = await db_config.getConnection();
        const [result] = await connection.query("SELECT 1");

        console.log(`Connection ID: ${connection.threadId}`);
        console.log(`Test Query: ${JSON.stringify(result, null, 2)}`);
        console.log("Database Connected Successfully.");

        connection.release();
        await db_config.end();
        process.exit(0);
    } catch (error) {
        console.error("Database Connection Failed.");
        if (error.code === 'ECONNREFUSED') {
            console.log('Check if MySQL is running on the correct port');
        } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.log('Check your username and password');
        } else if (error.code === 'ER_BAD_DB_ERROR') {
            console.log('Database does not exist');
        } else {
            console.log('Error:', error.message);
        }
        process.exit(1);
    };
};

testDatabaseConnection();