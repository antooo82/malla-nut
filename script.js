
const materias = [
    { nombre: "Curso introductorio", creditos: 1 },
    { nombre: "Bases biológicas de la nutrición humana", creditos: 11 },
    { nombre: "Microbiología alimentaria", creditos: 8 },
    { nombre: "Fundamentos de la nutrición humana", creditos: 11 },
    { nombre: "Química Alimentaria", creditos: 8 },
    { nombre: "Metodología de las prácticas articuladoras", creditos: 3 },
    { nombre: "Normativa alimentaria", creditos: 4 },
    { nombre: "Bioquímica Nutricional", creditos: 13 },
    { nombre: "Seguridad alimentaria nutricional y soberanía alimentaria", creditos: 11 },
    { nombre: "Administración aplicada al ejercicio de la profesión", creditos: 5 },
    { nombre: "Práctica articuladora I", creditos: 5 },
    { nombre: "Diagnóstico y evaluación del estado nutricional", creditos: 5 },
    { nombre: "Nutrición y alimentación en el ciclo de la vida", creditos: 10 },
    { nombre: "Salud pública", creditos: 5 },
    { nombre: "Bioestadística y métodos de investigación", creditos: 10 },
    { nombre: "Práctica articuladora II", creditos: 5 },
    { nombre: "Producción e industrialización de alimentos", creditos: 8 },
    { nombre: "Transformaciones físico- química de los alimentos", creditos: 11 },
    { nombre: "Epidemiología nutricional", creditos: 6 },
    { nombre: "Educación en alimentación y nutrición Fundamentos y praxis", creditos: 11 },
    { nombre: "Práctica articuladora III", creditos: 5 },
    { nombre: "Nutrición clínica I", creditos: 11 },
    { nombre: "Ética de la alimentación", creditos: 3 },
    { nombre: "Nutrición poblacional", creditos: 10 },
    { nombre: "Diseño de alimentos", creditos: 4 },
    { nombre: "Práctica articuladora IV", creditos: 8 },
    { nombre: "Nutrición Clínica II", creditos: 11 },
    { nombre: "Gestión de servicios de alimentación colectiva", creditos: 11 },
    { nombre: "Práctica articuladora V", creditos: 17 },
    { nombre: "Práctica profesional", creditos: 45 },
    { nombre: "TFG", creditos: 45 }
];

let creditosExo = 0;
let creditosTotal = 0;

function actualizarContador() {
    document.getElementById("creditosExo").innerText = creditosExo;
    document.getElementById("creditosTotal").innerText = creditosTotal;
}

function crearMateria(materia) {
    const div = document.createElement("div");
    div.className = "materia";
    div.textContent = `${materia.nombre} - ${materia.creditos} cr`;
    div.onclick = () => {
        if (div.classList.contains("exonerada")) {
            div.classList.remove("exonerada");
            creditosExo -= materia.creditos;
        } else if (div.classList.contains("examen")) {
            div.classList.remove("examen");
        } else if (!div.classList.contains("exonerada")) {
            div.classList.add("exonerada");
            creditosExo += materia.creditos;
        }
        actualizarContador();
    };
    div.oncontextmenu = (e) => {
        e.preventDefault();
        if (!div.classList.contains("exonerada")) {
            div.classList.toggle("examen");
        }
    };
    creditosTotal += materia.creditos;
    return div;
}

window.onload = () => {
    const grid = document.querySelector(".grid");
    materias.forEach(m => grid.appendChild(crearMateria(m)));
    actualizarContador();
};
