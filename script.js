document.addEventListener('DOMContentLoaded', () => {
    const allCourseItems = document.querySelectorAll('.year-block .course-item');
    const totalObligatoryCreditsSpan = document.getElementById('total-obligatory-credits');
    const totalElectivesCreditsSpan = document.getElementById('total-electives-credits');
    const totalAllCreditsSpan = document.getElementById('total-all-credits');
    const addElectiveBtn = document.getElementById('add-elective-btn');
    const electiveNameInput = document.getElementById('new-elective-name');
    const electiveCreditsInput = document.getElementById('new-elective-credits');
    const electiveCoursesContainer = document.getElementById('elective-courses-container');

    // Funciones para guardar y cargar el estado de un curso en localStorage
    function saveCourseState(courseName, state) {
        localStorage.setItem(`course_state_${courseName}`, state);
    }

    function loadCourseState(courseName) {
        return localStorage.getItem(`course_state_${courseName}`) || 'normal';
    }

    // Función para aplicar el estado visual a un elemento de curso
    function applyCourseVisualState(item, state) {
        item.classList.remove('approved', 'semi-approved');
        if (state === 'semi-approved') {
            item.classList.add('semi-approved');
        } else if (state === 'approved') {
            item.classList.add('approved');
        }
    }

    // Función para actualizar todos los displays de créditos
    function updateTotalCreditsDisplays() {
        let currentObligatoryCredits = 0;
        allCourseItems.forEach(item => {
            if (loadCourseState(item.dataset.name) === 'approved') {
                currentObligatoryCredits += parseInt(item.dataset.credits);
            }
        });
        totalObligatoryCreditsSpan.textContent = currentObligatoryCredits;

        let currentElectivesApprovedCredits = 0;
        electiveCoursesContainer.querySelectorAll('.elective-item input[type="checkbox"]').forEach(checkbox => {
            if (checkbox.checked) {
                currentElectivesApprovedCredits += parseInt(checkbox.dataset.credits || 0);
            }
        });
        totalElectivesCreditsSpan.textContent = currentElectivesApprovedCredits;

        totalAllCreditsSpan.textContent = currentObligatoryCredits + currentElectivesApprovedCredits;

        // Guardar los totales en localStorage para persistencia
        localStorage.setItem('totalObligatoryCredits', currentObligatoryCredits);
        localStorage.setItem('totalElectivesApprovedCredits', currentElectivesApprovedCredits);
    }

    // Cargar y configurar el estado de las materias obligatorias
    allCourseItems.forEach(item => {
        const name = item.dataset.name;
        let state = loadCourseState(name);

        applyCourseVisualState(item, state); // Aplica el estado visual guardado al cargar

        item.addEventListener('click', () => {
            let currentState = loadCourseState(name);
            let newState;

            switch (currentState) {
                case 'normal':
                    newState = 'semi-approved'; // 1 clic: normal -> gris (debo dar examen)
                    break;
                case 'semi-approved':
                    newState = 'approved';      // 2 clics: gris -> violeta (aprobado)
                    break;
                case 'approved':
                    newState = 'normal';        // 3 clics: violeta -> normal
                    break;
                default:
                    newState = 'normal'; // En caso de estado desconocido, vuelve a normal
            }

            applyCourseVisualState(item, newState);
            saveCourseState(name, newState);
            updateTotalCreditsDisplays(); // Recalcular y actualizar todos los créditos
        });
    });

    // --- Lógica para Electivas ---

    function saveElectives() {
        const electives = [];
        electiveCoursesContainer.querySelectorAll('.elective-item').forEach(item => {
            const name = item.querySelector('.elective-name').textContent;
            const credits = item.querySelector('input[type="checkbox"]').dataset.credits;
            const checked = item.querySelector('input[type="checkbox"]').checked;
            electives.push({ name, credits: parseInt(credits), checked });
        });
        localStorage.setItem('electives', JSON.stringify(electives));
    }

    function createElectiveElement(name, credits, checked = false) {
        const item = document.createElement('div');
        item.classList.add('elective-item');

        item.innerHTML = `
            <label>
                <input type="checkbox" data-credits="${credits}" ${checked ? 'checked' : ''}>
                <span class="elective-name">${name}</span>
            </label>
            <span class="elective-credits">Cr: ${credits}</span>
            <button class="remove-elective-btn">X</button>
        `;

        // Aplicar clase 'approved' si el checkbox está marcado al crear el elemento
        if (checked) {
            item.classList.add('approved');
        }

        const checkbox = item.querySelector('input[type="checkbox"]');
        checkbox.addEventListener('change', () => {
            item.classList.toggle('approved', checkbox.checked); // Añade/quita la clase 'approved'
            updateTotalCreditsDisplays(); // Recalcular créditos de electivas
            saveElectives();
        });

        const removeBtn = item.querySelector('.remove-elective-btn');
        removeBtn.addEventListener('click', () => {
            item.remove();
            updateTotalCreditsDisplays(); // Recalcular créditos de electivas
            saveElectives();
        });

        return item;
    }

    function addNewElective() {
        const name = electiveNameInput.value.trim();
        const credits = parseInt(electiveCreditsInput.value);

        if (!name || isNaN(credits) || credits <= 0) {
            alert("Por favor, ingresa un nombre y créditos válidos para la electiva.");
            return;
        }

        const item = createElectiveElement(name, credits, false); // Nueva electiva no está marcada por defecto
        electiveCoursesContainer.appendChild(item);

        electiveNameInput.value = '';
        electiveCreditsInput.value = '';
        electiveNameInput.focus();

        updateTotalCreditsDisplays(); // Actualizar el total de electivas
        saveElectives();
    }

    function loadElectives() {
        const saved = JSON.parse(localStorage.getItem('electives') || '[]');
        saved.forEach(({ name, credits, checked }) => {
            const el = createElectiveElement(name, credits, checked);
            electiveCoursesContainer.appendChild(el);
        });
    }

    // Event Listeners para la sección de electivas
    addElectiveBtn.addEventListener('click', addNewElective);
    electiveNameInput.addEventListener('keypress', e => {
        if (e.key === 'Enter') addNewElective();
    });
    electiveCreditsInput.addEventListener('keypress', e => {
        if (e.key === 'Enter') addNewElective();
    });

    // Cargar los estados y electivas al inicio
    loadElectives(); // Cargar electivas primero
    updateTotalCreditsDisplays(); // Luego actualizar todos los contadores
});
