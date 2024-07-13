// Wait until the DOM is fully loaded before running the script
document.addEventListener("DOMContentLoaded", () => {
  // Get references to DOM elements
  const search = document.querySelector(".input-group input");
  const tableBody = document.querySelector("#dataTable tbody");
  const tableHeadings = document.querySelectorAll("thead th");
  const toggleChartButton = document.getElementById("toggleChart");
  const tableSection = document.querySelector(".table_body");
  const chartSection = document.querySelector(".chart_section");
  const ctx = document.getElementById("myChart").getContext("2d");
  let chart;

  // Add event listener for search input
  search.addEventListener("input", searchTable);

  // Function to fetch data from the server
  async function fetchData() {
    try {
      const response = await fetch("http://localhost:3000/data");
      const data = await response.json();

      // Populate the table with fetched data
      data.forEach((row) => {
        const tr = document.createElement("tr");

        const countryTd = document.createElement("td");
        countryTd.textContent = row["Country"];
        tr.appendChild(countryTd);

        // Add data for each year
        [
          "2014",
          "2015",
          "2016",
          "2017",
          "2018",
          "2019",
          "2020",
          "2021",
          "2022",
          "2023",
        ].forEach((year) => {
          const td = document.createElement("td");
          td.textContent = row[year] || "";
          tr.appendChild(td);
        });

        tableBody.appendChild(tr);
      });
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }

  // Function to search the table
  function searchTable() {
    const query = search.value.toLowerCase();
    const rows = Array.from(tableBody.querySelectorAll("tr"));

    // Show/hide rows based on the search query
    rows.forEach((row) => {
      const cells = row.querySelectorAll("td");
      const matches = Array.from(cells).some((cell) =>
        cell.textContent.toLowerCase().includes(query)
      );
      row.style.display = matches ? "" : "none";
    });
  }

  let currentSortColumn = null;
  let currentSortOrder = true;

  // Add click event listener for sorting table columns
  tableHeadings.forEach((head, index) => {
    head.onclick = () => {
      if (currentSortColumn !== null && currentSortColumn !== head) {
        // Reset classes for previously sorted column
        tableHeadings[currentSortColumn].classList.remove("active");
        tableHeadings[currentSortColumn].classList.remove("asc");
        tableHeadings[currentSortColumn].classList.remove("desc");
      }

      currentSortColumn = index;
      currentSortOrder = !currentSortOrder;

      // Toggle classes for current column
      head.classList.toggle("asc", currentSortOrder);
      head.classList.toggle("desc", !currentSortOrder);
      head.classList.add("active");

      sortTable(index, currentSortOrder);
    };
  });

  // Function to sort the table
  function sortTable(columnIndex, ascending) {
    const rows = Array.from(tableBody.querySelectorAll("tr"));
    const sortedRows = rows.sort((a, b) => {
      const aText = a.querySelectorAll("td")[columnIndex].textContent.trim();
      const bText = b.querySelectorAll("td")[columnIndex].textContent.trim();

      // Compare numeric values if both are numbers
      if (!isNaN(aText) && !isNaN(bText)) {
        return ascending ? aText - bText : bText - aText;
      }

      // Compare string values
      return ascending
        ? aText.localeCompare(bText)
        : bText.localeCompare(aText);
    });

    // Append sorted rows back to the table body
    sortedRows.forEach((row) => tableBody.appendChild(row));
  }

  // Function to generate the chart
  function generateChart() {
    const rows = Array.from(tableBody.querySelectorAll("tr"));
    const labels = [
      "2014",
      "2015",
      "2016",
      "2017",
      "2018",
      "2019",
      "2020",
      "2021",
      "2022",
      "2023",
    ];
    const datasets = [];

    // Create dataset for each country
    rows.forEach((row) => {
      const cells = row.querySelectorAll("td");
      const country = cells[0].textContent;
      const data = Array.from(cells)
        .slice(1)
        .map((cell) => parseFloat(cell.textContent) || 0);

      datasets.push({
        label: country,
        data: data,
        borderColor: getRandomColor(),
        fill: false,
        hidden: true, // Start with all datasets hidden
      });
    });

    if (chart) {
      chart.destroy();
    }

    // Initialize the chart
    chart = new Chart(ctx, {
      type: "line",
      data: {
        labels: labels,
        datasets: datasets,
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: "top",
            onClick: (e, legendItem, legend) => {
              const index = legendItem.datasetIndex;
              const ci = legend.chart;
              const meta = ci.getDatasetMeta(index);
              meta.hidden = !meta.hidden;
              ci.update();
            },
          },
          title: {
            display: true,
            text: "Number of New Immigrants in European Countries (2014-2023)",
          },
        },
        scales: {
          x: {
            title: {
              display: true,
              text: "Year",
            },
          },
          y: {
            title: {
              display: true,
              text: "Number of Immigrants",
            },
          },
        },
      },
    });
  }

  // Function to toggle between table and chart views
  function toggleView() {
    const isTableHidden = tableSection.classList.contains("hidden");

    if (isTableHidden) {
      tableSection.classList.remove("hidden");
      chartSection.classList.add("hidden");
      toggleChartButton.textContent = "Generate Chart";
    } else {
      tableSection.classList.add("hidden");
      chartSection.classList.remove("hidden");
      generateChart();
      toggleChartButton.textContent = "Show Table";
    }
  }

  // Function to generate a random color
  function getRandomColor() {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  // Add event listener for the toggle chart button
  toggleChartButton.addEventListener("click", toggleView);

  // Fetch data and populate the table on page load
  fetchData();
});
