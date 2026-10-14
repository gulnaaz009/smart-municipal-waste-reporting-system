// ===== ECO TRACK - SMART WASTE REPORTING =====

// Get saved reports or start with sample reports
let reports = JSON.parse(
    localStorage.getItem("ecoTrackReports") || "null"
);

if (!reports) {
    reports = [
        {
            id: "ECO1001",
            location: "Civil Lines",
            type: "Overflowing Dustbin",
            date: "10 Oct 2026",
            status: "Pending",
            description: "Dustbin is overflowing."
        },
        {
            id: "ECO1002",
            location: "Kakadeo",
            type: "Dry Waste",
            date: "11 Oct 2026",
            status: "In Progress",
            description: "Dry waste needs collection."
        },
        {
            id: "ECO1003",
            location: "Swaroop Nagar",
            type: "Illegal Waste Dumping",
            date: "12 Oct 2026",
            status: "Resolved",
            description: "Waste dumping near the road."
        },
        {
            id: "ECO1004",
            location: "Kidwai Nagar",
            type: "Wet Waste",
            date: "13 Oct 2026",
            status: "Pending",
            description: "Wet waste is scattered."
        }
    ];

    saveReports();
}

// Save reports in this browser
function saveReports() {
    localStorage.setItem(
        "ecoTrackReports",
        JSON.stringify(reports)
    );
}

// Convert waste category values into readable names
function getWasteName(value) {
    const wasteTypes = {
        wet: "Wet Waste",
        dry: "Dry Waste",
        bin: "Overflowing Dustbin",
        dumping: "Illegal Waste Dumping",
        other: "Other"
    };

    return wasteTypes[value] || value;
}

// Format date for display
function getToday() {
    return new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}

// ===== REPORT SUBMISSION =====

const reportForm = document.querySelector("#report form");

if (reportForm) {
    reportForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const location = document.getElementById("location").value.trim();
        const type = document.getElementById("waste").value;
        const description = document
            .getElementById("description").value.trim();

        if (!name || !email || !location || !type || !description) {
            alert("Please fill in all required fields.");
            return;
        }

        const newReport = {
            id: "ECO" + Date.now().toString().slice(-7),
            name: name,
            email: email,
            location: location,
            type: getWasteName(type),
            date: getToday(),
            status: "Pending",
            description: description
        };

        reports.push(newReport);
        saveReports();

        alert(
            "Report submitted successfully!\n" +
            "Your Complaint ID is: " + newReport.id
        );

        reportForm.reset();
        updateDashboard();
        renderReports();
    });
}

// ===== PHOTO PREVIEW =====

const photoInput = document.getElementById("photo");

if (photoInput) {
    photoInput.addEventListener("change", function () {
        const file = this.files[0];

        let preview = document.getElementById("photo-preview");

        if (!preview) {
            preview = document.createElement("p");
            preview.id = "photo-preview";
            photoInput.insertAdjacentElement("afterend", preview);
        }

        if (file) {
            if (!file.type.startsWith("image/")) {
                alert("Please select an image file.");
                this.value = "";
                preview.textContent = "";
                return;
            }

            preview.textContent = "Selected photo: " + file.name;
        } else {
            preview.textContent = "";
        }
    });
}

// ===== TRACK AND SEARCH REPORTS =====

const trackSection = document.getElementById("track");
const searchForm = trackSection?.querySelector("form");
const complaintInput = document.getElementById("complaint-id");

if (searchForm && complaintInput) {
    searchForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const complaintId = complaintInput.value.trim().toUpperCase();

        const report = reports.find(function (item) {
            return item.id.toUpperCase() === complaintId;
        });

        let result = document.getElementById("search-result");

        if (!result) {
            result = document.createElement("div");
            result.id = "search-result";
            result.setAttribute("aria-live", "polite");
            searchForm.insertAdjacentElement("afterend", result);
        }

        result.replaceChildren();

        if (report) {
            const heading = document.createElement("h3");
            heading.textContent = "Complaint Found";

            const details = document.createElement("p");
            details.textContent =
                "ID: " + report.id +
                " | Location: " + report.location +
                " | Type: " + report.type +
                " | Status: " + report.status +
                " | Date: " + report.date;

            result.append(heading, details);
        } else {
            result.textContent =
                "No complaint found with ID " + complaintId;
        }
    });
}

// ===== UPDATE TRACKING TABLE =====

function renderReports() {
    const table = document.querySelector("#track tbody");

    if (!table) return;

    table.replaceChildren();

    reports.forEach(function (report) {
        const row = document.createElement("tr");

        [
            report.id,
            report.location,
            report.type,
            report.date,
            report.status
        ].forEach(function (value) {
            const cell = document.createElement("td");
            cell.textContent = value;
            row.appendChild(cell);
        });

        table.appendChild(row);
    });
}

// ===== UPDATE DASHBOARD =====

function updateDashboard() {
    const dashboard = document.getElementById("dashboard");

    if (!dashboard) return;

    const cards = dashboard.querySelectorAll(":scope > article");

    const total = reports.length;
    const pending = reports.filter(
        report => report.status === "Pending"
    ).length;
    const inProgress = reports.filter(
        report => report.status === "In Progress"
    ).length;
    const resolved = reports.filter(
        report => report.status === "Resolved"
    ).length;

    const counts = [total, pending, inProgress, resolved];

    cards.forEach(function (card, index) {
        const number = card.querySelector("p");

        if (number && counts[index] !== undefined) {
            number.textContent = counts[index];
        }
    });

    // Update waste category statistics
    const categoryTable = dashboard.querySelectorAll("table")[0];

    if (categoryTable) {
        const categories = [
            "Wet Waste",
            "Dry Waste",
            "Overflowing Dustbin",
            "Illegal Waste Dumping",
            "Other"
        ];

        const tbody = categoryTable.querySelector("tbody");
        tbody.replaceChildren();

        categories.forEach(function (category) {
            const count = reports.filter(
                report => report.type === category
            ).length;

            const row = document.createElement("tr");
            const nameCell = document.createElement("td");
            const countCell = document.createElement("td");

            nameCell.textContent = category;
            countCell.textContent = count;

            row.append(nameCell, countCell);
            tbody.appendChild(row);
        });
    }

    // Update recent reports
    const recentTable = dashboard.querySelectorAll("table")[1];

    if (recentTable) {
        const tbody = recentTable.querySelector("tbody");
        tbody.replaceChildren();

        reports.slice(-5).reverse().forEach(function (report) {
            const row = document.createElement("tr");

            [report.id, report.location, report.status].forEach(
                function (value) {
                    const cell = document.createElement("td");
                    cell.textContent = value;
                    row.appendChild(cell);
                }
            );

            tbody.appendChild(row);
        });
    }
}

// ===== INITIALIZE WEBSITE =====

renderReports();
updateDashboard();
