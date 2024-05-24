var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define("components/base", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Component = void 0;
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
    exports.Component = Component;
});
define("other/validation", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.validateFn = void 0;
    const validateFn = (validateInput) => {
        let isValide = true;
        if (validateInput.required) {
            isValide = isValide && validateInput.value.toString().trim().length !== 0;
        }
        if (validateInput.minLength != null &&
            typeof validateInput.value === "string") {
            isValide =
                isValide && validateInput.value.length > validateInput.minLength;
        }
        if (validateInput.maxLength != null &&
            typeof validateInput.value === "string") {
            isValide =
                isValide && validateInput.value.length < validateInput.maxLength;
        }
        if (validateInput.min != null && typeof validateInput.value === "number") {
            isValide = isValide && validateInput.value > validateInput.min;
        }
        if (validateInput.max != null && typeof validateInput.value === "number") {
            isValide = isValide && validateInput.value < validateInput.max;
        }
        return isValide;
    };
    exports.validateFn = validateFn;
});
define("decorators/autobind", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.autoBind = void 0;
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
    exports.autoBind = autoBind;
});
define("models/project", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Project = exports.ProjectStatus = void 0;
    var ProjectStatus;
    (function (ProjectStatus) {
        ProjectStatus[ProjectStatus["Active"] = 0] = "Active";
        ProjectStatus[ProjectStatus["Finished"] = 1] = "Finished";
    })(ProjectStatus || (exports.ProjectStatus = ProjectStatus = {}));
    class Project {
        constructor(id, title, desc, people, status) {
            this.id = id;
            this.title = title;
            this.desc = desc;
            this.people = people;
            this.status = status;
        }
    }
    exports.Project = Project;
});
define("state/pj-state", ["require", "exports", "models/project"], function (require, exports, project_js_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.projectState = exports.ProjectState = void 0;
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
            const newPj = new project_js_1.Project(Math.random().toString(), title, desc, people, project_js_1.ProjectStatus.Active);
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
    exports.ProjectState = ProjectState;
    exports.projectState = ProjectState.getInstance();
});
define("components/input", ["require", "exports", "components/base", "other/validation", "decorators/autobind", "state/pj-state"], function (require, exports, base_js_1, validation_js_1, autobind_js_1, pj_state_js_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ProjectInput = void 0;
    class ProjectInput extends base_js_1.Component {
        constructor() {
            super("project-input", "app", true, "user-input");
            this.inputTitle = this.element.querySelector("#title");
            this.inputDesc = (this.element.querySelector("#description"));
            this.inputpeople = (this.element.querySelector("#people"));
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
            if (!(0, validation_js_1.validateFn)(titleValid) ||
                !(0, validation_js_1.validateFn)(descValid) ||
                !(0, validation_js_1.validateFn)(peopleValid)) {
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
                pj_state_js_1.projectState.addproject(titleData, descData, peopleData);
            }
        }
        configure() {
            this.element.addEventListener("submit", this.submitHandler);
        }
        renderContent() { }
    }
    exports.ProjectInput = ProjectInput;
    __decorate([
        autobind_js_1.autoBind
    ], ProjectInput.prototype, "submitHandler", null);
});
define("models/drag-drop", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("components/item", ["require", "exports", "components/base", "decorators/autobind"], function (require, exports, base_js_2, autobind_js_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ProjectItem = void 0;
    class ProjectItem extends base_js_2.Component {
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
            this.element.querySelector("h3").textContent =
                this.persons + " assigned";
        }
    }
    exports.ProjectItem = ProjectItem;
    __decorate([
        autobind_js_2.autoBind
    ], ProjectItem.prototype, "dragStartHandler", null);
});
define("components/list", ["require", "exports", "components/base", "models/project", "decorators/autobind", "state/pj-state", "components/item"], function (require, exports, base_js_3, project_js_2, autobind_js_3, pj_state_js_2, item_js_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ProjectList = void 0;
    class ProjectList extends base_js_3.Component {
        constructor(type) {
            super("project-list", "app", false, `${type}-projects`);
            this.type = type;
            this.assignedpj = [];
            console.log(pj_state_js_2.projectState);
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
            pj_state_js_2.projectState.movePJ(prjId, this.type === "active" ? project_js_2.ProjectStatus.Active : project_js_2.ProjectStatus.Finished);
        }
        dragLeaveHandler(_) {
            const listEl = this.element.querySelector("ul");
            listEl.classList.remove("droppable");
        }
        configure() {
            this.element.addEventListener("dragover", this.dragOverHandler);
            this.element.addEventListener("dragleave", this.dragLeaveHandler);
            this.element.addEventListener("drop", this.dropHandler);
            pj_state_js_2.projectState.addlistener((projects) => {
                const filterPj = projects.filter((prj) => {
                    if (this.type === "active") {
                        return prj.status === project_js_2.ProjectStatus.Active;
                    }
                    return prj.status === project_js_2.ProjectStatus.Finished;
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
                new item_js_1.ProjectItem(this.element.querySelector("ul").id, pjitem);
            }
        }
    }
    exports.ProjectList = ProjectList;
    __decorate([
        autobind_js_3.autoBind
    ], ProjectList.prototype, "dragOverHandler", null);
    __decorate([
        autobind_js_3.autoBind
    ], ProjectList.prototype, "dropHandler", null);
    __decorate([
        autobind_js_3.autoBind
    ], ProjectList.prototype, "dragLeaveHandler", null);
});
define("app", ["require", "exports", "components/input", "components/list"], function (require, exports, input_js_1, list_js_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    new input_js_1.ProjectInput();
    new list_js_1.ProjectList("active");
    new list_js_1.ProjectList("finished");
});
//# sourceMappingURL=bundle.js.map