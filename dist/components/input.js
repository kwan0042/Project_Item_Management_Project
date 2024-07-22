var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Component } from "./base";
import { validateFn } from '../other/validation';
import { autoBind } from "../decorators/autobind";
import { projectState } from "../state/pj-state";
export class ProjectInput extends Component {
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
    autoBind
], ProjectInput.prototype, "submitHandler", null);
//# sourceMappingURL=input.js.map