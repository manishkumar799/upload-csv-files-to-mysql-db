const fs = require("fs");
const csv = require("csv-parser");
const mysql = require("mysql");

// MySQL database connection configuration
const dbConfig = {
  host: "localhost",
  user: "root",
  password: "",
  database: "test",
};

['1affirmationsjp','2goodvibesjp','3bodybalancejp','4healthylifejp','5betterrelationjp','6happyparentjp','7selfesteemjp','8happyfamilyjp','9generalimprovjp','10relaxjp']

// Create a MySQL connection
const connection = mysql.createConnection(dbConfig);

// Connect to the database
connection.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL database:", err);
    throw err;
  }
  console.log("Connected to MySQL database");
});

// Folder containing CSV files
const folderPath = "./CSV Japanease";

// Read files from the folder
fs.readdir(folderPath, (err, files) => {
  if (err) {
    console.error("Error reading folder:", err);
    throw err;
  }

  let filesProcessed = 0;

  // Process each CSV file
  files.forEach((file) => {
    const filePath = `${folderPath}/${file}`;
    const tableName = file.replace(".csv", ""); // Use the file name as the table name

    // Create a table for each CSV file with an auto-incremented id and quotes column
    const createTableQuery = `CREATE TABLE IF NOT EXISTS ${tableName} (id INT AUTO_INCREMENT PRIMARY KEY, quotes TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci)`;

    connection.query(
      createTableQuery,
      (createTableError, createTableResults, createTableFields) => {
        if (createTableError) throw createTableError;

        console.log(`Table ${tableName} created or already exists`);

        // Read the CSV file and insert data into the corresponding table
        fs.createReadStream(filePath)
          .pipe(csv({ headers: ['quotes'] }))
          .on("data", (row) => {
            console.log(row, row.quotes)
            const quotes = row.quotes

            const insertQuery = `INSERT INTO ${tableName} (quotes) VALUES (?)`;
            console.log(`Processing row from ${file}: quotes = ${quotes}`);

            connection.query(
              insertQuery,
              [quotes],
              (insertError, insertResults, insertFields) => {
                if (insertError) throw insertError;

                console.log(`Inserted row into ${tableName} with ID ${insertResults.insertId}`);
              }
            );
          })
          .on("end", () => {
            console.log(`Finished processing ${file}`);
            filesProcessed++;

            if (filesProcessed === files.length) {
              // Close the MySQL connection after processing all files
              connection.end(() => {
                console.log("MySQL connection closed");
              });
            }
          });
      }
    );
  });
});

const data = { 'quotes': 'もう人々の意見に影響されることはありません。' }
console.log(data.quotes)