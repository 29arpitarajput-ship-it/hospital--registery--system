document.addEventListener('DOMContentLoaded', () => {
    const patientForm = document.getElementById('patientForm');
    const patientList = document.getElementById('patientList');
    const searchInput = document.getElementById('search');
    const ageMinInput = document.getElementById('ageMin');
    const ageMaxInput = document.getElementById('ageMax');
    const conditionFilterInput = document.getElementById('conditionFilter');
    const clearFiltersBtn = document.getElementById('clearFilters');
    const editIndexInput = document.getElementById('editIndex');
    const submitBtn = document.getElementById('submitBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const formTitle = document.getElementById('formTitle');

    let patients = JSON.parse(localStorage.getItem('patients')) || [];
    let ageChart, conditionChart;

    function displayPatients(filteredPatients = patients) {
        patientList.innerHTML = '';
        filteredPatients.forEach((patient, index) => {
            const li = document.createElement('li');
            const info = document.createElement('div');
            info.className = 'patient-info';
            info.textContent = `${patient.name} - Age: ${patient.age} - Condition: ${patient.condition}`;
            li.appendChild(info);

            const actions = document.createElement('div');
            actions.className = 'patient-actions';

            const editBtn = document.createElement('button');
            editBtn.textContent = 'Edit';
            editBtn.className = 'edit-btn';
            editBtn.addEventListener('click', () => editPatient(index));
            actions.appendChild(editBtn);

            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Delete';
            deleteBtn.className = 'delete-btn';
            deleteBtn.addEventListener('click', () => deletePatient(index));
            actions.appendChild(deleteBtn);

            li.appendChild(actions);
            patientList.appendChild(li);
        });
        updateAnalysis();
    }

    function filterPatients() {
        const query = searchInput.value.toLowerCase();
        const ageMin = parseInt(ageMinInput.value) || 0;
        const ageMax = parseInt(ageMaxInput.value) || 999;
        const conditionQuery = conditionFilterInput.value.toLowerCase();

        const filtered = patients.filter(patient => {
            const matchesSearch = patient.name.toLowerCase().includes(query) || patient.condition.toLowerCase().includes(query);
            const matchesAge = patient.age >= ageMin && patient.age <= ageMax;
            const matchesCondition = patient.condition.toLowerCase().includes(conditionQuery);
            return matchesSearch && matchesAge && matchesCondition;
        });
        displayPatients(filtered);
    }

    function editPatient(index) {
        const patient = patients[index];
        document.getElementById('name').value = patient.name;
        document.getElementById('age').value = patient.age;
        document.getElementById('condition').value = patient.condition;
        editIndexInput.value = index;
        formTitle.textContent = 'Edit Patient';
        submitBtn.textContent = 'Update';
        cancelBtn.style.display = 'inline-block';
    }

    function deletePatient(index) {
        if (confirm('Are you sure you want to delete this patient?')) {
            patients.splice(index, 1);
            localStorage.setItem('patients', JSON.stringify(patients));
            displayPatients();
        }
    }

    function cancelEdit() {
        patientForm.reset();
        editIndexInput.value = -1;
        formTitle.textContent = 'Register New Patient';
        submitBtn.textContent = 'Register';
        cancelBtn.style.display = 'none';
    }

    function updateAnalysis() {
        // Age distribution
        const ageGroups = { '0-18': 0, '19-35': 0, '36-50': 0, '51-65': 0, '66+': 0 };
        patients.forEach(p => {
            if (p.age <= 18) ageGroups['0-18']++;
            else if (p.age <= 35) ageGroups['19-35']++;
            else if (p.age <= 50) ageGroups['36-50']++;
            else if (p.age <= 65) ageGroups['51-65']++;
            else ageGroups['66+']++;
        });

        if (ageChart) ageChart.destroy();
        ageChart = new Chart(document.getElementById('ageChart'), {
            type: 'bar',
            data: {
                labels: Object.keys(ageGroups),
                datasets: [{
                    label: 'Patients by Age Group',
                    data: Object.values(ageGroups),
                    backgroundColor: 'rgba(54, 162, 235, 0.5)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });

        // Condition distribution
        const conditions = {};
        patients.forEach(p => {
            conditions[p.condition] = (conditions[p.condition] || 0) + 1;
        });

        if (conditionChart) conditionChart.destroy();
        conditionChart = new Chart(document.getElementById('conditionChart'), {
            type: 'pie',
            data: {
                labels: Object.keys(conditions),
                datasets: [{
                    data: Object.values(conditions),
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.5)',
                        'rgba(54, 162, 235, 0.5)',
                        'rgba(255, 205, 86, 0.5)',
                        'rgba(75, 192, 192, 0.5)',
                        'rgba(153, 102, 255, 0.5)'
                    ]
                }]
            }
        });
    }

    patientForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('name').value;
        const age = parseInt(document.getElementById('age').value);
        const condition = document.getElementById('condition').value;
        const index = parseInt(editIndexInput.value);

        if (index >= 0) {
            // Update
            patients[index] = { name, age, condition };
        } else {
            // Add new
            patients.push({ name, age, condition });
        }
        localStorage.setItem('patients', JSON.stringify(patients));
        displayPatients();
        cancelEdit();
    });

    cancelBtn.addEventListener('click', cancelEdit);

    searchInput.addEventListener('input', filterPatients);
    ageMinInput.addEventListener('input', filterPatients);
    ageMaxInput.addEventListener('input', filterPatients);
    conditionFilterInput.addEventListener('input', filterPatients);

    clearFiltersBtn.addEventListener('click', () => {
        searchInput.value = '';
        ageMinInput.value = '';
        ageMaxInput.value = '';
        conditionFilterInput.value = '';
        displayPatients();
    });

    displayPatients();
});