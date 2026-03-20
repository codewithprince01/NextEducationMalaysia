const mysql = require('mysql2/promise');

async function main() {
    const connection = await mysql.createConnection(process.env.DATABASE_URL);
    const query = process.argv[2];
    
    if (!query) {
        console.log('No query provided');
        process.exit(1);
    }

    try {
        const [rows] = await connection.execute(query);
        console.log(JSON.stringify(rows, null, 2));
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await connection.end();
    }
}

main();
