document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("searchInput");
  const dateFilter = document.getElementById("dateFilter");
  const categoryFilter = document.getElementById("categoryFilter");
  const venueFilter = document.getElementById("venueFilter");
  const container = document.getElementById("bandContainer");
  const clearFiltersBtn = document.getElementById("clearFiltersBtn");

  let bands = [];
  let uniqueDates = new Set();
  let uniqueCategories = new Set();
  let uniqueVenues = new Set();

  function renderBands(filteredBands) {
    container.innerHTML = "";

    if (filteredBands.length === 0) {
      container.innerHTML = "<p>No bands found.</p>";
      return;
    }

    filteredBands.forEach((band) => {
      const gigsHtml = band.gigs
        .map((gig) => `<li>${gig}</li>`)
        .join("");
      const categoriesHtml = band.category.join(", ");

      const bandHtml = `
        <div class="band">
          <h2>${band.name}</h2>
          <p><strong>Category:</strong> ${categoriesHtml}</p>
          <p>${band.description}</p>
          <ul>${gigsHtml}</ul>
        </div>
      `;
      container.insertAdjacentHTML("beforeend", bandHtml);
    });
  }

  function filterBands() {
    const searchTerm = searchInput.value.toLowerCase();
    const selectedDate = dateFilter.value;
    const selectedCategory = categoryFilter.value;
    const selectedVenue = venueFilter.value;

    const filtered = bands.filter((band) => {
      const matchesSearch =
        band.name.toLowerCase().includes(searchTerm) ||
        band.description.toLowerCase().includes(searchTerm);

      const matchesDate =
        !selectedDate ||
        band.gigs.some((gig) => gig.toLowerCase().startsWith(selectedDate.toLowerCase()));

      const matchesCategory =
        !selectedCategory || band.category.includes(selectedCategory);

      const matchesVenue =
        !selectedVenue ||
        band.gigs.some((gig) =>
          gig.toLowerCase().endsWith(selectedVenue.toLowerCase())
        );

      return matchesSearch && matchesDate && matchesCategory && matchesVenue;
    });

    renderBands(filtered);
  }

  function populateFilters() {
    Array.from(uniqueDates)
      .sort()
      .forEach((date) => {
        const option = document.createElement("option");
        option.value = date;
        option.textContent = date;
        dateFilter.appendChild(option);
      });

    Array.from(uniqueCategories)
      .sort()
      .forEach((cat) => {
        const option = document.createElement("option");
        option.value = cat;
        option.textContent = cat;
        categoryFilter.appendChild(option);
      });

    Array.from(uniqueVenues)
      .sort()
      .forEach((venue) => {
        const option = document.createElement("option");
        option.value = venue;
        option.textContent = venue;
        venueFilter.appendChild(option);
      });
  }

  fetch("kaustinen_2025_bands.json")
    .then((res) => res.json())
    .then((data) => {
      bands = data;

      bands.forEach((band) => {
        band.gigs.forEach((gig) => {
          // Extract day and venue from gig string like: "TI 10.00 - 11.00 @ Maunon makasiini"
          const parts = gig.split("@");
          if (parts.length === 2) {
            const dayPart = parts[0].trim().split(" ")[0];
            const venuePart = parts[1].trim();

            uniqueDates.add(dayPart);
            uniqueVenues.add(venuePart);
          }
        });

        band.category.forEach((cat) => uniqueCategories.add(cat));
      });

      populateFilters();
      filterBands();
    })
    .catch((err) => {
      container.innerHTML = `<p>Error loading bands: ${err.message}</p>`;
    });

  searchInput.addEventListener("input", filterBands);
  dateFilter.addEventListener("change", filterBands);
  categoryFilter.addEventListener("change", filterBands);
  venueFilter.addEventListener("change", filterBands);

  clearFiltersBtn.addEventListener("click", () => {
    searchInput.value = "";
    dateFilter.value = "";
    categoryFilter.value = "";
    venueFilter.value = "";
    filterBands();
  });



});
