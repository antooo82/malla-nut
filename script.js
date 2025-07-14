document.addEventListener('DOMContentLoaded', () => {
    const allCourseItems = document.querySelectorAll('.year-block .course-item');
    const totalElectivesCreditsSpan = document.getElementById('total-electives-credits');
    const addElectiveBtn = document.getElementById('add-elective-btn');
    const electiveNameInput = document.getElementById('new-elective-name');
    const electiveCreditsInput = document.getElementById('new-elective-credits');
    const electiveCoursesContainer = document.getElementById('elective-courses-container');

    let totalObligatoryCredits = 0;

    function updateTotalCreditsDisplay() {
        const electiveCredits = parseInt(totalElectivesCreditsSpan.textContent) || 0;
        document.getElementById('total-electives-credits').textContent = electiveCredits + totalObligatoryCredits;
    }

    function parseCreditsFromText(text) {
        const match = text.match(/Cr:\s*(\d+)/);
        return match ? parseInt(match[1]) : 0;
    }

    function saveCourseState(courseName, state) {
        localStorage.setItem(`course_state_${courseName}`, state);
    }

    function loadCourseState(courseName) {
        return localStorage.getItem(`course_state_${courseName}`) || 'normal';
    }

    // ESTADOS: normal → semi-approved → approved → normal
    allCourseItems.forEach(item => {
        const name = item.dataset.name;
        const credits = parseCreditsFromText(item.textContent);
        let state = loadCourseState(name);
        let clickCount = 0;
        let clickTimer;

        function applyState(state) {
            item.classList.remove('approved', 'semi-approved');
            if (state === 'semi-approved') {
                item.classList.add('semi-approved');
            } else if (state === 'approved') {
                item.classList.add('approved');
            }
        }

        applyState(state);
        if (state === 'approved') {
            totalObligatoryCredits += credits;
        }

        item.addEventListener('click', () => {
            clickCount++;
            clearTimeout(clickTimer);
            clickTimer = setTimeout(() => {
                if (clickCount === 1) {
                    // 1 clic → semi-approved
                    state = (state === 'semi-approved') ? 'normal' : 'semi-approved';
                } else if (clickCount === 2) {
                    // 2 clics → approved
                    state = (state === 'approved') ? 'normal' : 'approved';
                } else if (clickCount >= 3) {
                    state = 'normal';
                }

                applyState(state);
                saveCourseState(name, state);

                // Recalcular créditos
                totalObligatoryCredits = 0;
                allCourseItems.forEach(i => {
                    if (loadCourseState(i.dataset.name) === 'approved') {
                        totalObligatoryCredits += parseCreditsFromText(i.textContent);
                    }
                });

                updateTotalCreditsDisplay();
                clickCount = 0;
            }, 300);
        });
    });

    // ELECTIVAS
    function updateTotalElectivesCredits() {
        let total = 0;
        electiveCoursesContainer.querySelectorAll('.elective-item input[type="checkbox"]').forEach(checkbox => {
            if (checkbox.checked) {
                total += parseInt(checkbox.dataset.credits || 0);
            }
        });
        totalElectivesCreditsSpan.textContent = total;
        localStorage.setItem('totalElectivesCredits', total);
        updateTotalCreditsDisplay();
    }

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
        if (checked) item.classList.add('approved');

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
            item.classList.toggle('approved', checkbox.checked);
            updateTotalElectivesCredits();
            saveElectives();
        });

        const removeBtn = item.querySelector('.remove-elective-btn');
        removeBtn.addEventListener('click', () => {
            item.remove();
            updateTotalElectivesCredits();
            saveElectives();
        });

        return item;
    }

    function addNewElective() {
        const name = electiveNameInput.value.trim();
        const credits = parseInt(electiveCreditsInput.value);

        if (!name || isNaN(credits) || credits <= 0) {
            alert("Por favor, ingresa un nombre y créditos válidos.");
            return;
        }

        const item = createElectiveElement(name, credits);
        electiveCoursesContainer.appendChild(item);

        electiveNameInput.value = '';
        electiveCreditsInput.value = '';
        electiveNameInput.focus();

        updateTotalElectivesCredits();
        saveElectives();
    }

    function loadElectives() {
        const saved = JSON.parse(localStorage.getItem('electives') || '[]');
        saved.forEach(({ name, credits, checked }) => {
            const el = createElectiveElement(name, credits, checked);
            electiveCoursesContainer.appendChild(el);
        });
        totalElectivesCreditsSpan.textContent = localStorage.getItem('totalElectivesCredits') || '0';
        updateTotalCreditsDisplay();
    }

    addElectiveBtn.addEventListener('click', addNewElective);
    electiveNameInput.addEventListener('keypress', e => {
        if (e.key === 'Enter') addNewElective();
    });
    electiveCreditsInput.addEventListener('keypress', e => {
        if (e.key === 'Enter') addNewElective();
    });

    loadElectives();
});
