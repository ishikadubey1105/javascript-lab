
const storageKey = "staffDeskEmployees";
let addedEmployees = [];
let jsonEmployees = [];
let recordsLoaded = false;

const employeeForm = document.getElementById("employeeForm");
const employeeTableBody = document.getElementById("employeeTableBody");
const employeeOutput = document.getElementById("employeeOutput");
const jsonText = document.getElementById("jsonText");

function getSavedEmployees() {
    try {
        const saved = JSON.parse(localStorage.getItem(storageKey) || "[]");
        return Array.isArray(saved) ? saved : [];
    } catch (error) {
        return [];
    }
}

function updateStats(employees) {
    const departments = new Set(
        employees.map(employee => employee.department)
    );

    document.getElementById("totalEmployees").textContent = employees.length;
    document.getElementById("totalDepartments").textContent = departments.size;
    document.getElementById("recordCount").textContent =
        employees.length + (employees.length === 1 ? " record" : " records");
}

function displayEmployees(employees) {
    employeeTableBody.replaceChildren();

    if (employees.length === 0) {
        const row = document.createElement("tr");
        const cell = document.createElement("td");

        cell.colSpan = 4;
        cell.className = "empty";
        cell.textContent = "No employee records found.";

        row.appendChild(cell);
        employeeTableBody.appendChild(row);
        updateStats(employees);
        return;
    }

    employees.forEach(function(employee) {
        const row = document.createElement("tr");

        const employeeCell = document.createElement("td");
        const employeeInfo = document.createElement("div");
        const avatar = document.createElement("div");
        const nameInfo = document.createElement("div");
        const name = document.createElement("span");
        const id = document.createElement("span");

        employeeInfo.className = "employee-cell";
        avatar.className = "employee-avatar";
        nameInfo.appendChild(name);
        nameInfo.appendChild(id);

        name.className = "employee-name";
        name.textContent = employee.name;
        id.className = "employee-id";
        id.textContent = employee.id;

        avatar.textContent = employee.name
            .split(/\s+/)
            .filter(Boolean)
            .map(part => part[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();

        employeeInfo.appendChild(avatar);
        employeeInfo.appendChild(nameInfo);
        employeeCell.appendChild(employeeInfo);

        const departmentCell = document.createElement("td");
        const departmentTag = document.createElement("span");
        departmentTag.className = "department-tag";
        departmentTag.textContent = employee.department;
        departmentCell.appendChild(departmentTag);

        const salaryCell = document.createElement("td");
        salaryCell.className = "salary";

        const salary = Number(employee.salary);
        salaryCell.textContent = Number.isFinite(salary)
            ? "₹ " + salary.toLocaleString("en-IN")
            : "₹ " + employee.salary;

        const statusCell = document.createElement("td");
        const status = document.createElement("span");
        const dot = document.createElement("span");

        status.className = "status";
        dot.className = "live-dot";
        status.appendChild(dot);
        status.appendChild(document.createTextNode("Active"));
        statusCell.appendChild(status);

        row.appendChild(employeeCell);
        row.appendChild(departmentCell);
        row.appendChild(salaryCell);
        row.appendChild(statusCell);

        employeeTableBody.appendChild(row);
    });

    updateStats(employees);
}

function mergeEmployees(baseEmployees, savedEmployees) {
    const employeeMap = new Map();

    baseEmployees.forEach(function(employee) {
        employeeMap.set(String(employee.id).toLowerCase(), employee);
    });

    savedEmployees.forEach(function(employee) {
        employeeMap.set(String(employee.id).toLowerCase(), employee);
    });

    return Array.from(employeeMap.values());
}

function getCurrentEmployees() {
    return mergeEmployees(jsonEmployees, addedEmployees);
}

employeeForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const id = document.getElementById("employeeId").value.trim();
    const name = document.getElementById("employeeName").value.trim();
    const department = document.getElementById("department").value;
    const salary = document.getElementById("salary").value;

    if (!id || !name || !department || !salary) {
        alert("Please enter all employee details.");
        return;
    }

    if (Number(salary) <= 0 || !Number.isFinite(Number(salary))) {
        alert("Please enter a valid salary.");
        return;
    }

    const duplicate = getCurrentEmployees().some(function(employee) {
        return String(employee.id).toLowerCase() === id.toLowerCase();
    });

    if (duplicate) {
        alert("This employee ID already exists.");
        return;
    }

    const employee = {
        id: id,
        name: name,
        department: department,
        salary: Number(salary)
    };

    addedEmployees.push(employee);

    try {
        localStorage.setItem(storageKey, JSON.stringify(addedEmployees));
    } catch (error) {
        addedEmployees.pop();
        alert("Unable to save employee data in browser storage.");
        return;
    }

    employeeOutput.hidden = false;
    jsonText.textContent = JSON.stringify(employee, null, 2);

    displayEmployees(getCurrentEmployees());
    employeeForm.reset();

    alert("Employee added and saved successfully.");
});

function loadEmployees() {
    fetch("employees.json")
        .then(function(response) {
            if (!response.ok) {
                throw new Error("Unable to load employees.json");
            }

            return response.json();
        })
        .then(function(employees) {
            if (!Array.isArray(employees)) {
                throw new Error("The JSON file must contain an array.");
            }

            jsonEmployees = employees;
            addedEmployees = getSavedEmployees();
            recordsLoaded = true;

            displayEmployees(getCurrentEmployees());
        })
        .catch(function(error) {
            console.error("Error loading employees:", error);
            alert("Unable to load employees.json. Run the project using VS Code Live Server and check the JSON file.");
        });
}

document.getElementById("loadButton").addEventListener("click", loadEmployees);

document.getElementById("clearButton").addEventListener("click", function() {
    const confirmed = confirm(
        "Remove all employees saved through this form? The original JSON file will remain unchanged."
    );

    if (!confirmed) {
        return;
    }

    try {
        localStorage.removeItem(storageKey);
        addedEmployees = [];

        if (recordsLoaded) {
            displayEmployees(getCurrentEmployees());
        } else {
            displayEmployees([]);
        }

        employeeOutput.hidden = true;
        alert("Saved employee records cleared.");
    } catch (error) {
        alert("Unable to clear saved employee records.");
    }
});
