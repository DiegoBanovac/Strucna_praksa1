// Import required libraries
const express = require("express");
const XLSX = require("xlsx");
const cors = require("cors");

// Initialize an Express application
const app = express();
const port = 3000;

// Enable CORS for all routes
app.use(cors());

// Define the /data route to handle GET requests
app.get("/data", (req, res) => {
  // Read the Excel file
  const workbook = XLSX.readFile("data.xlsx");
  const sheet_name_list = workbook.SheetNames;

  // Define multipliers for each country
  const countryMultipliers = {
    "United Kingdom": 67938949,
    Switzerland: 8851431,
    Norway: 5474360,
    Iceland: 375318,
    Sweden: 10612086,
    Finland: 5545475,
    Slovakia: 5795199,
    Slovenia: 2119675,
    Portugal: 10247605,
    Poland: 41026067,
    Austria: 8958960,
    Netherlands: 17618299,
    Malta: 535064,
    Hungary: 10156239,
    Luxembourg: 654768,
    Lithuania: 2718352,
    Cyprus: 1260138,
    Italy: 58870762,
    Croatia: 4008617,
    France: 64756584,
    Spain: 47519628,
    Greece: 10341277,
    Ireland: 5056935,
    Estonia: 1322765,
    Germany: 83294633,
    Denmark: 5910913,
    Czechia: 10495295,
    Belgium: 11686140,
    "Euro area – 20 countries (from 2023)": 349000000,
    "European Union - 27 countries (from 2020)": 448000000,
  };

  // Initialize an empty array to hold the data
  const data = [];

  // Iterate over each sheet in the workbook
  sheet_name_list.forEach((y) => {
    const worksheet = workbook.Sheets[y];
    const headers = {};
    const sheetData = [];

    // Iterate over each cell in the worksheet
    for (const z in worksheet) {
      if (z[0] === "!") continue; // Skip special properties

      const col = z.substring(0, 1); // Column letter
      const row = parseInt(z.substring(1)); // Row number
      const value = worksheet[z].v; // Cell value

      if (row == 1) {
        headers[col] = value; // Store header row
        continue;
      }

      if (!sheetData[row]) sheetData[row] = {};
      sheetData[row][headers[col]] = value; // Populate data rows
    }

    // Remove the first two rows (headers and an empty row)
    sheetData.shift();
    sheetData.shift();

    // Process each row in the sheet
    sheetData.forEach((row) => {
      const country = row["Country"];
      const multiplier = countryMultipliers[country];
      const newRow = {};

      newRow["Country"] = country;

      // Apply multiplier if it exists
      if (multiplier !== undefined) {
        for (const key in row) {
          if (
            row.hasOwnProperty(key) &&
            key !== "Country" &&
            !isNaN(row[key])
          ) {
            newRow[key] = +((row[key] / 100) * multiplier).toFixed(0); // Calculate new value
          } else if (key !== "Country") {
            newRow[key] = row[key]; // Copy non-numeric values
          }
        }
      } else {
        // Copy row as is if no multiplier
        for (const key in row) {
          if (row.hasOwnProperty(key) && key !== "Country") {
            newRow[key] = row[key];
          }
        }
      }

      // Add processed row to data array
      data.push(newRow);
    });
  });

  // Send the processed data as JSON response
  res.json(data);
});

// Start the server and listen on the specified port
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
