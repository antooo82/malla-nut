document.addEventListener('DOMContentLoaded', () => {
    const allCourseItems = document.querySelectorAll('.year-block .course-item');
    const totalObligatoryCreditsSpan = document.getElementById('total-obligatory-credits');
    const totalElectivesCreditsSpan = document.getElementById('total-electives-credits');
    const totalAllCreditsSpan = document.getElementById('total-all-credits'); // Nuevo span para el total global
    const addElectiveBtn = document.getElementById('add-elective-btn');
    const electiveNameInput = document.getElementById('new-elective-name');
    const electiveCreditsInput = document.getElementById('new-elective-credits');
    const electiveCoursesContainer = document.getElementById('elective-courses-container');

    let totalObligatoryCredits = 0;
    let totalElectivesApprovedCredits = 0; // Variable para créditos de electivas aprobadas

    // Función para obtener los créditos de un texto "Cr: X"
    function parseCreditsFromText(text) {
        const match = text.match(/Cr:\s*(\d+)/);
        return match ? parseInt(match[1]) : 0;
    }

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

    // Función para actualizar todos los displays de créditos
    function updateTotalCreditsDisplays() {
        totalObligatoryCredits = 0;
        allCourseItems.forEach(item => {
            if (loadCourseState(item.dataset.name) === 'approved') {
                totalObligatoryCredits += parseInt(item.dataset.credits);
            }
        });

        // Recalcular créditos de electivas
        totalElectivesApprovedCredits = 0;
        electiveCoursesContainer.querySelectorAll('.elective-item input[type="checkbox"]').forEach(checkbox => {
            if (checkbox.checked) {
                totalElectivesApprovedCredits += parseInt(checkbox.dataset.credits || 0);
            }
        });

        totalObligatoryCreditsSpan.textContent = totalObligatoryCredits;
        totalElectivesCreditsSpan.textContent = totalElectivesApprovedCredits;
        totalAllCreditsSpan.textContent = totalObligatoryCredits + totalElectivesApprovedCredits;

        // Guardar el total de electivas también en localStorage para que persista
        localStorage.setItem('totalElectivesApprovedCredits', totalElectivesApprovedCredits);
    }

    // Inicializar el estado de las materias obligatorias al cargar
    allCourseItems.forEach(item => {
        const name = item.dataset.name;
        const credits = parseInt(item.dataset.credits); // Usar dataset.credits directamente
        let state = loadCourseState(name);

        applyCourseVisualState(item, state); // Aplica el estado visual guardado

        // Lógica para manejar los 3 estados al hacer clic
        let clickCount = 0;
        let clickTimer;

        item.addEventListener('click', () => {
            clearTimeout(clickTimer); // Limpia el timer en cada clic para detectar clics dobles/triples
            clickCount++;

            clickTimer = setTimeout(() => {
                if (clickCount === 1) {
                    // Primer clic: Si es normal, pasa a semi-approved. Si ya era semi-approved, vuelve a normal.
                    state = item.classList.contains('semi-approved') ? 'normal' : 'semi-approved';
                } else if (clickCount === 2) {
                    // Segundo clic: Si es approved, vuelve a normal. Si no era approved (normal o semi-approved), pasa a approved.
                    state = item.classList.contains('approved') ? 'normal' : 'approved';
                } else {
                    // Tercer clic (o más): Siempre vuelve a normal
                    state = 'normal';
                }

                applyCourseVisualState(item, state);
                saveCourseState(name, state);
                updateTotalCreditsDisplays(); // Actualizar créditos después de cada cambio
                clickCount = 0; // Reiniciar clickCount para la próxima secuencia de clics
            }, 300); // 300ms para diferenciar clics
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
        // El estado 'approved' se aplica si el checkbox está marcado
        if (checked) {
            item.classList.add('approved');
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
    loadElectives(); // Cargar electivas primero para que sus checkboxes afecten el total
    updateTotalCreditsDisplays(); // Actualizar todos los contadores al cargar la página
});
