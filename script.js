document.addEventListener('DOMContentLoaded', () => {
    const allCourseItems = document.querySelectorAll('.year-block .course-item');
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
        item.classList.remove('approved', 'semi-approved'); // Quitar todas las clases de estado
        if (state === 'semi-approved') {
            item.classList.add('semi-approved');
        } else if (state === 'approved') {
            item.classList.add('approved');
        }
    }

    // Cargar y configurar el estado de las materias obligatorias
    allCourseItems.forEach(item => {
        const name = item.dataset.name;
        let state = loadCourseState(name); // Carga el estado guardado

        applyCourseVisualState(item, state); // Aplica el estado visual al cargar la página

        item.addEventListener('click', () => {
            let currentState = loadCourseState(name); // Obtiene el estado actual del local storage
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

            applyCourseVisualState(item, newState); // Aplica la nueva clase visual
            saveCourseState(name, newState);       // Guarda el nuevo estado en localStorage
        });
    });

    // --- Lógica para Electivas (sin conteo de créditos, solo marcado visual) ---

    function saveElectives() {
        const electives = [];
        electiveCoursesContainer.querySelectorAll('.elective-item').forEach(item => {
            const name = item.querySelector('.elective-name').textContent;
            const credits = item.querySelector('input[type="checkbox"]').dataset.credits;
            const checked = item.querySelector('input[type="checkbox"]').checked; // Estado del checkbox
            electives.push({ name, credits: parseInt(credits), checked });
        });
        localStorage.setItem('electives', JSON.stringify(electives));
    }

    function createElectiveElement(name, credits, checked = false) {
        const item = document.createElement('div');
        item.classList.add('elective-item');

        // Aplica la clase visual si el checkbox está marcado
        if (checked) {
            item.classList.add('checked-style'); // Usamos 'checked-style' para electivas
        }

        item.innerHTML = `
            <label>
                <input type="checkbox" data-credits="${credits}" ${checked ? 'checked' : ''}>
                <span class="elective-name">${name}</span>
            </label>
            <span class="elective-credits">Cr: ${credits}</span>
            <button class="remove-elective-btn">X</button>
        `;

        const checkbox = item.querySelector('input[type="checkbox"]');
        checkbox.addEventListener('change', () => {
            item.classList.toggle('checked-style', checkbox.checked); // Alterna la clase visual
            saveElectives(); // Guarda el estado del checkbox
        });

        const removeBtn = item.querySelector('.remove-elective-btn');
        removeBtn.addEventListener('click', () => {
            item.remove();
            saveElectives(); // Guarda la lista de electivas actualizada
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

        saveElectives(); // Guarda la nueva electiva
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
    loadElectives();
});
