import { Component } from "./base";
import {validate, validateFn} from '../other/validation'
import { autoBind } from "../decorators/autobind";
import {projectState} from "../state/pj-state";

  export class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
    inputTitle: HTMLInputElement;
    inputDesc: HTMLInputElement;
    inputpeople: HTMLInputElement;

    constructor() {
      super("project-input", "app", true, "user-input");
      this.inputTitle = <HTMLInputElement>this.element.querySelector("#title");
      this.inputDesc = <HTMLInputElement>(
        this.element.querySelector("#description")
      );
      this.inputpeople = <HTMLInputElement>(
        this.element.querySelector("#people")
      );

      this.configure();
    }

    private getAllInput(): [string, string, number] | undefined {
      const titleData = this.inputTitle.value;
      const descData = this.inputDesc.value;
      const peopleData = this.inputpeople.value;

      const titleValid: validate = {
        value: titleData,
        required: true,
        minLength: 2,
        maxLength: 10,
      };
      const descValid: validate = {
        value: descData,
        required: true,
        minLength: 5,
      };
      const peopleValid: validate = {
        value: peopleData,
        required: true,
        max: 3,
      };

      if (
        !validateFn(titleValid) ||
        !validateFn(descValid) ||
        !validateFn(peopleValid)
      ) {
        alert("Invalid Input");
        return;
      } else {
        return [titleData, descData, +peopleData];
      }
    }

    @autoBind
    private submitHandler(event: Event) {
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
    renderContent() {}
  }

