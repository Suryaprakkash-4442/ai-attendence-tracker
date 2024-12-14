// Initialize a set to track dates for which attendance has been submitted
const submittedDates = new Set();

// Initialize a set to track holidays
const holidays = new Set();

// On window load, check if the user is logged in
window.onload = () => {
    // Hide chatbot and main page by default
    document.getElementById('chatbot').style.display = 'none';
    document.getElementById('chatToggleBtn').style.display = 'none';

    // Check localStorage for login state
    const isLoggedIn = localStorage.getItem('isLoggedIn');

    if (isLoggedIn === 'true') {
        // If logged in, show the main page and chatbot
        document.getElementById('loginPage').style.display = 'none';
        document.getElementById('mainPage').style.display = 'block';
        document.getElementById('chatbot').style.display = 'block';
        document.getElementById('chatToggleBtn').style.display = 'block';
        populateAttendanceTable(); // Populate attendance table
    } else {
        // Otherwise, show the login page
        document.getElementById('loginPage').style.display = 'block';
        document.getElementById('mainPage').style.display = 'none';
    }
};

// Login logic
document.getElementById('loginBtn').addEventListener('click', () => {
    const staffID = document.getElementById('staffID').value;
    const password = document.getElementById('password').value;

    if (staffID === 'admin25' && password === 'admin123') {
        alert('Login successful!');
        localStorage.setItem('isLoggedIn', 'true'); // Save login state
        document.getElementById('loginPage').style.display = 'none';
        document.getElementById('mainPage').style.display = 'block';
        document.getElementById('chatbot').style.display = 'block'; // Show chatbot
        document.getElementById('chatToggleBtn').style.display = 'block'; // Show chatbot toggle button
        populateAttendanceTable();
    } else {
        alert('Invalid Staff ID or Password. Please try again.');
    }
});

// Logout logic
document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('isLoggedIn'); // Clear login state
    document.getElementById('mainPage').style.display = 'none';
    document.getElementById('loginPage').style.display = 'block';
    document.getElementById('chatbot').style.display = 'none'; // Hide chatbot
    document.getElementById('chatToggleBtn').style.display = 'none'; // Hide chatbot toggle button
});

// Array to hold student data
const students = Array.from({ length: 60 }, (_, i) => ({
    id: i + 1,
    name: `Student ${i + 1}`,
    attendance: 0,
    totalClasses: 0,
    od: 0,
    absent: 0,
    percentage: 100 // Initialize with 100% attendance
}));

const attendanceRecords = {};

// Populate the attendance table
function populateAttendanceTable() {
    const tableBody = document.querySelector('#attendanceTable tbody');
    tableBody.innerHTML = '';
    students.forEach(student => {
        const row = document.createElement('tr');

        const rollNoCell = document.createElement('td');
        rollNoCell.textContent = student.id; // Display Roll No

        const nameCell = document.createElement('td');
        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.value = student.name;
        nameInput.onblur = () => {
            student.name = nameInput.value; // Update the student name on blur
        };
        nameCell.appendChild(nameInput);

        const absentCheckbox = document.createElement('input');
        absentCheckbox.type = 'checkbox';
        absentCheckbox.className = 'attendance-checkbox';
        absentCheckbox.id = `absent-${student.id}`;

        const odCheckbox = document.createElement('input');
        odCheckbox.type = 'checkbox';
        odCheckbox.className = 'attendance-checkbox';
        odCheckbox.id = `od-${student.id}`;

        const presentCheckbox = document.createElement('input');
        presentCheckbox.type = 'checkbox';
        presentCheckbox.className = 'attendance-checkbox';
        presentCheckbox.id = `present-${student.id}`;
        presentCheckbox.checked = true; // Present is checked by default

        presentCheckbox.addEventListener('change', () => {
            if (presentCheckbox.checked) {
                absentCheckbox.checked = false;
                odCheckbox.checked = false;
            }
        });

        absentCheckbox.addEventListener('change', () => {
            if (absentCheckbox.checked) {
                presentCheckbox.checked = false;
                odCheckbox.checked = false;
            }
        });

        odCheckbox.addEventListener('change', () => {
            if (odCheckbox.checked) {
                presentCheckbox.checked = false;
                absentCheckbox.checked = false;
            }
        });

        row.appendChild(rollNoCell);
        row.appendChild(nameCell);
        row.appendChild(createCell(absentCheckbox));
        row.appendChild(createCell(odCheckbox));
        row.appendChild(createCell(presentCheckbox));
        tableBody.appendChild(row);
    });
}

// Chatbot functionality
document.getElementById('sendChatBtn').addEventListener('click', () => {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    if (!message) return;

    const chatLog = document.getElementById('chatLog');
    chatLog.innerHTML += `<div>User: ${message}</div>`;

    const commandPattern = /^(A|OD) for (\d+(?:,\d+)*)$/; // Regex to capture command
    const match = message.match(commandPattern);

    if (match) {
        const command = match[1];
        const rollNumbers = match[2].split(',').map(Number);

        rollNumbers.forEach(rollNo => {
            const absentCheckbox = document.getElementById(`absent-${rollNo}`);
            const odCheckbox = document.getElementById(`od-${rollNo}`);
            const presentCheckbox = document.getElementById(`present-${rollNo}`);

            if (command === 'A') {
                absentCheckbox.checked = true;
                odCheckbox.checked = false;
                presentCheckbox.checked = false;
            } else if (command === 'OD') {
                odCheckbox.checked = true;
                absentCheckbox.checked = false;
                presentCheckbox.checked = false;
            }
        });

        chatLog.innerHTML += `<div>Chatbot: Attendance updated.</div>`;
    } else {
        chatLog.innerHTML += `<div>Chatbot: I didn't understand that. Please use the format "A for 1,2,..n" or "OD for 1,2,..n".</div>`;
    }

    input.value = '';
});

// Helper function to create a table cell with input
function createCell(input) {
    const cell = document.createElement('td');
    cell.appendChild(input);
    return cell;
}

// Submit attendance button logic
document.getElementById('submitBtn').addEventListener('click', () => {
    const selectedDate = document.getElementById('date').value;

    if (!selectedDate) {
        alert('Please select a date.');
        return;
    }

    // Check if attendance has already been submitted for the selected date
    if (submittedDates.has(selectedDate)) {
        alert('Attendance has already been submitted for this date.');
        return;
    }

    students.forEach(student => {
        const absentChecked = document.getElementById(`absent-${student.id}`).checked;
        const odChecked = document.getElementById(`od-${student.id}`).checked;
        const presentChecked = document.getElementById(`present-${student.id}`).checked;

        student.totalClasses += 1;
        if (!attendanceRecords[selectedDate]) {
            attendanceRecords[selectedDate] = {};
        }
        attendanceRecords[selectedDate][student.id] = absentChecked ? 'Absent' : odChecked ? 'OD' : 'Present';
    });

    // Mark date as submitted
    submittedDates.add(selectedDate);

    // Reset checkboxes
    students.forEach(student => {
        document.getElementById(`absent-${student.id}`).checked = false;
        document.getElementById(`od-${student.id}`).checked = false;
        document.getElementById(`present-${student.id}`).checked = true;
    });

    document.getElementById('date').value = ''; // Clear the date input
    alert('Attendance submitted successfully!');
});

// Mark holiday button logic
document.getElementById('holidayBtn').addEventListener('click', () => {
    const selectedDate = document.getElementById('date').value;
    if (selectedDate) {
        // Check if attendance has already been submitted for the selected date
        if (submittedDates.has(selectedDate)) {
            alert('Cannot mark holiday for a date where attendance has already been submitted.');
            return;
        }

        holidays.add(selectedDate);
        alert(`Marked ${selectedDate} as a holiday.`);
    } else {
        alert('Please select a date to mark as a holiday.');
    }
});

// Navigate to attendance percentage page
document.getElementById('attendancePercentBtn').addEventListener('click', () => {
    document.getElementById('mainPage').style.display = 'none';
    document.getElementById('attendancePercentagePage').style.display = 'block';
    populatePercentageTable();
});

// Populate the attendance percentage table
function populatePercentageTable() {
    const tableBody = document.getElementById('percentageTableBody');
    tableBody.innerHTML = '';

    students.forEach(student => {
        const row = document.createElement('tr');

        const nameCell = document.createElement('td');
        nameCell.textContent = student.name;

        const attendanceCell = document.createElement('td');
        attendanceCell.textContent = student.percentage.toFixed(2);

        row.appendChild(nameCell);
        row.appendChild(attendanceCell);
        tableBody.appendChild(row);
    });
}

// Calculate cumulative attendance percentage for the specified date range
document.getElementById('calculateBtn').addEventListener('click', () => {
    const fromDate = document.getElementById('fromDate').value;
    const toDate = document.getElementById('toDate').value;

    if (!fromDate || !toDate) {
        alert('Please select both "From" and "To" dates.');
        return;
    }

    // Filter attendance records within the date range
    const filteredRecords = {};
    for (const date in attendanceRecords) {
        if (date >= fromDate && date <= toDate) {
            filteredRecords[date] = attendanceRecords[date];
        }
    }

    if (Object.keys(filteredRecords).length === 0) {
        alert('No attendance records found for the selected date range.');
        return;
    }

    const tableBody = document.getElementById('percentageTableBody');
    tableBody.innerHTML = '';

    students.forEach(student => {
        let presentDays = 0;
        let totalDays = 0;

        for (const date in filteredRecords) {
            const record = filteredRecords[date][student.id];
            if (record === 'Present') {
                presentDays++;
            }
            if (record) {
                totalDays++;
            }
        }

        if (totalDays > 0) {
            const percentage = (presentDays / totalDays) * 100;
            const row = document.createElement('tr');

            const nameCell = document.createElement('td');
            nameCell.textContent = student.name;

            const percentageCell = document.createElement('td');
            percentageCell.textContent = percentage.toFixed(2);

            row.appendChild(nameCell);
            row.appendChild(percentageCell);
            tableBody.appendChild(row);
        }
    });
});

// Chatbot toggle button logic
document.getElementById('chatToggleBtn').addEventListener('click', () => {
    const chatbot = document.getElementById('chatbot');
    const toggleBtn = document.getElementById('chatToggleBtn');

    // Check the current display state of the chatbot and toggle it
    if (chatbot.style.display === 'none' || chatbot.style.display === '') {
        chatbot.style.display = 'block';
        toggleBtn.textContent = 'Hide Chatbot';
    } else {
        chatbot.style.display = 'none';
        toggleBtn.textContent = 'Show Chatbot';
    }
});

// Back to Main Page button logic
document.getElementById('backBtn').addEventListener('click', () => {
    document.getElementById('attendancePercentagePage').style.display = 'none'; // Hide the percentage page
    document.getElementById('mainPage').style.display = 'block'; // Show the main page
});

// Populate the attendance percentage table
function populatePercentageTable() {
    const tableBody = document.getElementById('percentageTableBody');
    tableBody.innerHTML = '';

    students.forEach(student => {
        let presentDays = 0;
        let totalDays = 0;

        // Iterate over attendanceRecords to count present days and exclude holidays
        for (const date in attendanceRecords) {
            if (!holidays.has(date)) { // Exclude holidays
                const record = attendanceRecords[date][student.id];
                if (record === 'Present') {
                    presentDays++;
                }
                if (record) {
                    totalDays++; // Only count days with records (non-holiday)
                }
            }
        }

        // Calculate attendance percentage
        const attendancePercentage = totalDays > 0 ? (presentDays / totalDays) * 100 : 100;
        student.percentage = attendancePercentage;

        // Add row to the percentage table
        const row = document.createElement('tr');

        const nameCell = document.createElement('td');
        nameCell.textContent = student.name;

        const attendanceCell = document.createElement('td');
        attendanceCell.textContent = attendancePercentage.toFixed(2);

        row.appendChild(nameCell);
        row.appendChild(attendanceCell);
        tableBody.appendChild(row);
    });
}

// Calculate cumulative attendance percentage for the specified date range
document.getElementById('calculateBtn').addEventListener('click', () => {
    const fromDate = document.getElementById('fromDate').value;
    const toDate = document.getElementById('toDate').value;

    if (!fromDate || !toDate) {
        alert('Please select both "From" and "To" dates.');
        return;
    }

    // Filter attendance records within the date range
    const filteredRecords = {};
    for (const date in attendanceRecords) {
        if (date >= fromDate && date <= toDate && !holidays.has(date)) { // Exclude holidays
            filteredRecords[date] = attendanceRecords[date];
        }
    }

    if (Object.keys(filteredRecords).length === 0) {
        alert('No attendance records found for the selected date range.');
        return;
    }

    const tableBody = document.getElementById('percentageTableBody');
    tableBody.innerHTML = '';

    students.forEach(student => {
        let presentDays = 0;
        let totalDays = 0;

        for (const date in filteredRecords) {
            const record = filteredRecords[date][student.id];
            if (record === 'Present') {
                presentDays++;
            }
            if (record) {
                totalDays++;
            }
        }

        // Calculate attendance percentage
        const percentage = totalDays > 0 ? (presentDays / totalDays) * 100 : 100;

        // Add row to the percentage table
        const row = document.createElement('tr');

        const nameCell = document.createElement('td');
        nameCell.textContent = student.name;

        const percentageCell = document.createElement('td');
        percentageCell.textContent = percentage.toFixed(2);

        row.appendChild(nameCell);
        row.appendChild(percentageCell);
        tableBody.appendChild(row);
    });
});
let isDragging = false;
let offsetX = 0;
let offsetY = 0;

function drag(event) {
    const lowAttendanceContainer = document.getElementById('lowAttendanceContainer');

    if (!isDragging) {
        isDragging = true;
        offsetX = event.clientX - lowAttendanceContainer.getBoundingClientRect().left;
        offsetY = event.clientY - lowAttendanceContainer.getBoundingClientRect().top;

        document.addEventListener('mousemove', move);
        document.addEventListener('mouseup', stopDrag);
    }
}

function move(event) {
    const lowAttendanceContainer = document.getElementById('lowAttendanceContainer');
    lowAttendanceContainer.style.position = 'absolute';
    lowAttendanceContainer.style.left = (event.clientX - offsetX) + 'px';
    lowAttendanceContainer.style.top = (event.clientY - offsetY) + 'px';
}

function stopDrag() {
    isDragging = false;
    document.removeEventListener('mousemove', move);
    document.removeEventListener('mouseup', stopDrag);
}
function populateAttendancePercentageTable() {
    const percentageTableBody = document.querySelector('#attendancePercentageTable tbody');
    percentageTableBody.innerHTML = ''; // Clear previous rows

    students.forEach(student => {
        const totalClasses = student.totalClasses || 1; // Avoid division by 0
        const odCount = student.od || 0;
        const attendanceCount = student.attendance || 0;
        const attendancePercentage = ((attendanceCount + odCount) / totalClasses) * 100;

        const row = document.createElement('tr');
        const rollNoCell = document.createElement('td');
        const nameCell = document.createElement('td');
        const percentageCell = document.createElement('td');

        rollNoCell.textContent = student.id;
        nameCell.textContent = student.name;
        percentageCell.textContent = attendancePercentage.toFixed(2) + '%';

        row.appendChild(rollNoCell);
        row.appendChild(nameCell);
        row.appendChild(percentageCell);
        percentageTableBody.appendChild(row);

        student.percentage = attendancePercentage; // Update student's attendance percentage
    });

    // Populate the low attendance list
    const lowAttendanceList = students
        .filter(student => student.percentage < 75)
        .map(student => `${student.name}: ${student.percentage.toFixed(2)}%`);

    const lowAttendanceContainer = document.getElementById('lowAttendanceList');
    lowAttendanceContainer.innerHTML = ''; // Clear previous low attendance list

    if (lowAttendanceList.length > 0) {
        lowAttendanceList.forEach(item => {
            const li = document.createElement('li');
            li.textContent = item; // Display the student's name and percentage
            lowAttendanceContainer.appendChild(li);
        });
    } else {
        lowAttendanceContainer.innerHTML = '<li>No students with less than 75% attendance.</li>';
    }
}
function populateAttendancePercentageTable() {
    const percentageTableBody = document.querySelector('#attendancePercentageTable tbody');
    percentageTableBody.innerHTML = ''; // Clear previous rows

    students.forEach(student => {
        const totalClasses = student.totalClasses || 1; // Avoid division by 0
        const odCount = student.od || 0;
        const attendanceCount = student.attendance || 0;
        const attendancePercentage = ((attendanceCount + odCount) / totalClasses) * 100;

        const row = document.createElement('tr');
        const rollNoCell = document.createElement('td');
        const nameCell = document.createElement('td');
        const percentageCell = document.createElement('td');

        rollNoCell.textContent = student.id;
        nameCell.textContent = student.name;
        percentageCell.textContent = attendancePercentage.toFixed(2) + '%';

        row.appendChild(rollNoCell);
        row.appendChild(nameCell);
        row.appendChild(percentageCell);
        percentageTableBody.appendChild(row);

        student.percentage = attendancePercentage; // Update student's attendance percentage
    });

    // Populate the low attendance list
    const lowAttendanceList = students
        .filter(student => student.percentage < 75)
        .map(student => `${student.name}: ${student.percentage.toFixed(2)}%`);

    const lowAttendanceContainer = document.getElementById('lowAttendanceList');
    lowAttendanceContainer.innerHTML = ''; // Clear previous low attendance list

    if (lowAttendanceList.length > 0) {
        lowAttendanceList.forEach(item => {
            const li = document.createElement('li');
            li.textContent = item; // Display the student's name and percentage
            lowAttendanceContainer.appendChild(li);
        });
    } else {
        lowAttendanceContainer.innerHTML = '<li>No students with less than 75% attendance.</li>';
    }
}
// Navigate to attendance percentage page
document.getElementById('attendancePercentBtn').addEventListener('click', () => {
    document.getElementById('mainPage').style.display = 'none';
    document.getElementById('attendancePercentagePage').style.display = 'block';
    lowAttendanceContainer.style.display = 'block'; // Show the low attendance list only here
    populatePercentageTable();
});

// Back to Main Page button logic
document.getElementById('backBtn').addEventListener('click', () => {
    document.getElementById('attendancePercentagePage').style.display = 'none'; // Hide the percentage page
    document.getElementById('mainPage').style.display = 'block'; // Show the main page
    lowAttendanceContainer.style.display = 'none'; // Hide the low attendance list when leaving the page
});
// Populate the attendance percentage table and display low attendance warning
function populatePercentageTable() {
    const tableBody = document.getElementById('percentageTableBody');
    const lowAttendanceList = document.getElementById('lowAttendanceList');
    const lowAttendanceWarning = document.getElementById('lowAttendanceWarning');
    
    tableBody.innerHTML = '';
    lowAttendanceList.innerHTML = ''; // Clear previous list
    let hasLowAttendance = false;

    students.forEach(student => {
        let presentDays = 0;
        let totalDays = 0;

        // Iterate over attendanceRecords to count present days and exclude holidays
        for (const date in attendanceRecords) {
            if (!holidays.has(date)) { // Exclude holidays
                const record = attendanceRecords[date][student.id];
                if (record === 'Present') {
                    presentDays++;
                }
                if (record) {
                    totalDays++; // Only count days with records (non-holiday)
                }
            }
        }

        // Calculate attendance percentage
        const attendancePercentage = totalDays > 0 ? (presentDays / totalDays) * 100 : 100;
        student.percentage = attendancePercentage;

        // Add row to the percentage table
        const row = document.createElement('tr');

        const nameCell = document.createElement('td');
        nameCell.textContent = student.name;

        const attendanceCell = document.createElement('td');
        attendanceCell.textContent = attendancePercentage.toFixed(2);

        row.appendChild(nameCell);
        row.appendChild(attendanceCell);
        tableBody.appendChild(row);

        // Check if the student's attendance is below 75%
        if (attendancePercentage < 75) {
            hasLowAttendance = true;
            const listItem = document.createElement('li');
            listItem.textContent = `${student.name} (Roll No: ${student.id})`;
            lowAttendanceList.appendChild(listItem);
        }
    });

    // Show or hide the low attendance warning based on whether there are students below 75%
    if (hasLowAttendance) {
        lowAttendanceWarning.style.display = 'block';
    } else {
        lowAttendanceWarning.style.display = 'none';
    }
}



