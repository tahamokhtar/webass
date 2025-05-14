const API_URL = 'https://jsonplaceholder.typicode.com/users';
const form = document.getElementById('employee-form');
const tableBody = document.getElementById('employee-table-body');
const messageBox = document.getElementById('message');
const nameInput = document.getElementById('name');
const ageInput = document.getElementById('age');
const emailInput = document.getElementById('email');
const skillsInput = document.getElementById('skills');
const employeeIdInput = document.getElementById('employee-id');
const submitBtn = document.getElementById('submit-btn');
const cancelBtn = document.getElementById('cancel-btn');

let employees = [];
let isEditing = false;
function showMessage(msg, type = 'success') {
    messageBox.textContent = msg;
    messageBox.className = type;
    setTimeout(() => { messageBox.textContent = ''; messageBox.className = ''; }, 3000);
}
async function fetchEmployees() {
    try {
        const res = await fetch(API_URL);
        employees = await res.json();
        renderEmployees();
    } catch {
        showMessage('Error fetching employees', 'error');
    }
}
function renderEmployees() {
    tableBody.innerHTML = '';
    employees.forEach(emp => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${emp.name}</td>
          <td>${emp.age || '-'}</td>
          <td>${emp.email}</td>
          <td>${emp.skills || '-'}</td>
          <td class="actions">
            <button onclick="editEmployee(${emp.id})">Edit</button>
            <button onclick="deleteEmployee(${emp.id})">Delete</button>
          </td>
        `;
        tableBody.appendChild(tr);
    });
}
function clearForm() {
    form.reset();
    employeeIdInput.value = '';
    isEditing = false;
    submitBtn.textContent = 'Add Employee';
    cancelBtn.style.display = 'none';
}

function validateForm() {
    if (!nameInput.value.trim()) return showMessage('Name is required', 'error'), false;
    const age = Number(ageInput.value);
    if (!age || age < 18 || age > 100) return showMessage('Age must be between 18 and 100', 'error'), false;
    const email = emailInput.value.trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return showMessage('Invalid email', 'error'), false;
    if (!skillsInput.value.trim()) return showMessage('Skills are required', 'error'), false;
    return true;
}
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const empData = {
        name: nameInput.value.trim(),
        age: Number(ageInput.value.trim()),
        email: emailInput.value.trim(),
        skills: skillsInput.value.trim(),
    };
    if (isEditing) {
        const id = employeeIdInput.value;
        try {
            const res = await fetch(`${API_URL}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(empData),
            });
            const updated = await res.json();
            employees = employees.map(emp => emp.id == id ? updated : emp);
            showMessage('Employee updated successfully');
            clearForm();
            renderEmployees();
        } catch {
            showMessage('Failed to update employee', 'error');
        }
    } else {
        try {
            const res = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(empData),
            });
            const newEmp = await res.json();
            employees.push(newEmp);
            showMessage('Employee added successfully');
            clearForm();
            renderEmployees();
        } catch {
            showMessage('Failed to add employee', 'error');
        }
    }
});
localStorage.setItem('employees', JSON.stringify(employees)); // حفظ البيانات في التخزين المؤقت
clearForm();
renderEmployees();
function editEmployee(id) {
    window.location.href = `edit.html?id=${id}`;
    const emp = employees.find(e => e.id === id);
    if (!emp) return showMessage('Employee not found', 'error');
    nameInput.value = emp.name;
    ageInput.value = emp.age || '';
    emailInput.value = emp.email;
    skillsInput.value = emp.skills || '';
    employeeIdInput.value = emp.id;
    isEditing = true;
    submitBtn.textContent = 'Update Employee';
    cancelBtn.style.display = 'inline-block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
async function deleteEmployee(id) {
    if (!confirm('Are you sure?')) return;
    try {
        await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        employees = employees.filter(e => e.id !== id);
        showMessage('Employee deleted');
        renderEmployees();
    } catch {
        showMessage('Failed to delete employee', 'error');
    }
}
cancelBtn.addEventListener('click', clearForm);
fetchEmployees();