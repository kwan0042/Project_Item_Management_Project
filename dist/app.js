"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var ProjectStatus;
(function (ProjectStatus) {
    ProjectStatus[ProjectStatus["Active"] = 0] = "Active";
    ProjectStatus[ProjectStatus["Finished"] = 1] = "Finished";
})(ProjectStatus || (ProjectStatus = {}));
class Project {
    constructor(id, title, desc, people, status) {
        this.id = id;
        this.title = title;
        this.desc = desc;
        this.people = people;
        this.status = status;
    }
}
class State {
    constructor() {
        this.listeners = [];
    }
    addlistener(listenerFn) {
        this.listeners.push(listenerFn);
    }
}
class ProjectState extends State {
    constructor() {
        super();
        this.projects = [];
    }
    static getInstance() {
        if (this.instance) {
            return this.instance;
        }
        this.instance = new ProjectState();
        return this.instance;
    }
    addproject(title, desc, people) {
        const newPj = new Project(Math.random().toString(), title, desc, people, ProjectStatus.Active);
        this.projects.push(newPj);
        this.updateListners();
    }
    movePJ(projectId, newStatus) {
        const project = this.projects.find((prj) => prj.id === projectId);
        if (project && project.status !== newStatus) {
            project.status = newStatus;
            this.updateListners();
        }
    }
    updateListners() {
        for (const listenerFn of this.listeners) {
            listenerFn(this.projects.slice());
        }
    }
}
const projectState = ProjectState.getInstance();
const validateFn = (validateInput) => {
    let isValide = true;
    if (validateInput.required) {
        isValide = isValide && validateInput.value.toString().trim().length !== 0;
    }
    if (validateInput.minLength != null &&
        typeof validateInput.value === "string") {
        isValide = isValide && validateInput.value.length > validateInput.minLength;
    }
    if (validateInput.maxLength != null &&
        typeof validateInput.value === "string") {
        isValide = isValide && validateInput.value.length < validateInput.maxLength;
    }
    if (validateInput.min != null && typeof validateInput.value === "number") {
        isValide = isValide && validateInput.value > validateInput.min;
    }
    if (validateInput.max != null && typeof validateInput.value === "number") {
        isValide = isValide && validateInput.value < validateInput.max;
    }
    return isValide;
};
function autoBind(_, _1, descriptor) {
    const originalMethod = descriptor.value;
    const adjDescrpitor = {
        configurable: true,
        get() {
            const boundFn = originalMethod.bind(this);
            return boundFn;
        },
    };
    return adjDescrpitor;
}
class Component {
    constructor(templateId, hostElId, inserAtStart, newElId) {
        this.templateElement = (document.getElementById(templateId));
        this.hostEle = document.getElementById(hostElId);
        const importNode = document.importNode(this.templateElement.content, true);
        this.element = importNode.firstElementChild;
        if (newElId) {
            this.element.id = newElId;
        }
        this.attach(inserAtStart);
    }
    attach(inserAtbegin) {
        this.hostEle.insertAdjacentElement(inserAtbegin ? "afterbegin" : "beforeend", this.element);
    }
}
class ProjectItem extends Component {
    get persons() {
        if (this.project.people === 1) {
            return "1 person";
        }
        else {
            return `${this.project.people} persons`;
        }
    }
    constructor(hostId, project) {
        super("single-project", hostId, false, project.id);
        this.project = project;
        this.configure();
        this.renderContent();
    }
    dragStartHandler(event) {
        event.dataTransfer.setData("text/plain", this.project.id);
        event.dataTransfer.effectAllowed = "move";
    }
    dragEndHandler(_) {
        console.log("DragEnd");
    }
    configure() {
        this.element.addEventListener("dragstart", this.dragStartHandler);
        this.element.addEventListener("dragend", this.dragEndHandler);
    }
    renderContent() {
        this.element.querySelector("h2").textContent = this.project.title;
        this.element.querySelector("p").textContent = this.project.desc;
        this.element.querySelector("h3").textContent = this.persons + " assigned";
    }
}
__decorate([
    autoBind,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [DragEvent]),
    __metadata("design:returntype", void 0)
], ProjectItem.prototype, "dragStartHandler", null);
class ProjectList extends Component {
    constructor(type) {
        super("project-list", "app", false, `${type}-projects`);
        this.type = type;
        this.assignedpj = [];
        console.log(projectState);
        this.configure();
        this.renderContent();
    }
    dragOverHandler(event) {
        if (event.dataTransfer && event.dataTransfer.types[0] === "text/plain") {
            event.preventDefault();
            const listEl = this.element.querySelector("ul");
            listEl.classList.add("droppable");
        }
    }
    dropHandler(event) {
        const prjId = event.dataTransfer.getData("text/plain");
        projectState.movePJ(prjId, this.type === "active" ? ProjectStatus.Active : ProjectStatus.Finished);
    }
    dragLeaveHandler(_) {
        const listEl = this.element.querySelector("ul");
        listEl.classList.remove("droppable");
    }
    configure() {
        this.element.addEventListener("dragover", this.dragOverHandler);
        this.element.addEventListener("dragleave", this.dragLeaveHandler);
        this.element.addEventListener("drop", this.dropHandler);
        projectState.addlistener((projects) => {
            const filterPj = projects.filter((prj) => {
                if (this.type === "active") {
                    return prj.status === ProjectStatus.Active;
                }
                return prj.status === ProjectStatus.Finished;
            });
            this.assignedpj = filterPj;
            this.renderPj();
        });
    }
    renderContent() {
        const listId = `${this.type}-projects-list`;
        this.element.querySelector("ul").id = listId;
        this.element.querySelector("h2").textContent =
            this.type.toUpperCase() + " Projects";
    }
    renderPj() {
        const listEl = (document.getElementById(`${this.type}-projects-list`));
        listEl.innerHTML = "";
        for (const pjitem of this.assignedpj) {
            new ProjectItem(this.element.querySelector("ul").id, pjitem);
        }
    }
}
__decorate([
    autoBind,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [DragEvent]),
    __metadata("design:returntype", void 0)
], ProjectList.prototype, "dragOverHandler", null);
__decorate([
    autoBind,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [DragEvent]),
    __metadata("design:returntype", void 0)
], ProjectList.prototype, "dropHandler", null);
__decorate([
    autoBind,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [DragEvent]),
    __metadata("design:returntype", void 0)
], ProjectList.prototype, "dragLeaveHandler", null);
class ProjectInput extends Component {
    constructor() {
        super("project-input", "app", true, "user-input");
        this.inputTitle = this.element.querySelector("#title");
        this.inputDesc = (this.element.querySelector("#description"));
        this.inputpeople = this.element.querySelector("#people");
        this.configure();
    }
    getAllInput() {
        const titleData = this.inputTitle.value;
        const descData = this.inputDesc.value;
        const peopleData = this.inputpeople.value;
        const titleValid = {
            value: titleData,
            required: true,
            minLength: 2,
            maxLength: 10,
        };
        const descValid = {
            value: descData,
            required: true,
            minLength: 5,
        };
        const peopleValid = {
            value: peopleData,
            required: true,
            max: 3,
        };
        if (!validateFn(titleValid) ||
            !validateFn(descValid) ||
            !validateFn(peopleValid)) {
            alert("Invalid Input");
            return;
        }
        else {
            return [titleData, descData, +peopleData];
        }
    }
    submitHandler(event) {
        event.preventDefault();
        const userInput = this.getAllInput();
        if (Array.isArray(userInput)) {
            const [titleData, descData, peopleData] = userInput;
            projectState.addproject(titleData, descData, peopleData);
        }
    }
    configure() {
        this.element.addEventListener("submit", this.submitHandler);
    }
    renderContent() { }
}
__decorate([
    autoBind,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Event]),
    __metadata("design:returntype", void 0)
], ProjectInput.prototype, "submitHandler", null);
const prjInput = new ProjectInput();
const activeList = new ProjectList("active");
const finList = new ProjectList("finished");
//# sourceMappingURL=app.js.map