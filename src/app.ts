interface Draggable {
  dragStartHandler(event: DragEvent): void;
  dragEndHandler(event: DragEvent): void;
}

interface DragTarget {
  dragOverHandler(event: DragEvent): void;
  dropHandler(event: DragEvent): void;
  dragLeaveHandler(event: DragEvent): void;
}

enum ProjectStatus {
  Active,
  Finished,
}

class Project {
  constructor(
    public id: string,
    public title: string,
    public desc: string,
    public people: number,
    public status: ProjectStatus
  ) {}
}
type Listener<T> = (items: T[]) => void;

class State<T> {
  protected listeners: Listener<T>[] = [];
  addlistener(listenerFn: Listener<T>) {
    this.listeners.push(listenerFn);
  }
}

class ProjectState extends State<Project> {
  private projects: Project[] = [];
  private static instance: ProjectState;
  private constructor() {
    super();
  }

  static getInstance() {
    if (this.instance) {
      return this.instance;
    }
    this.instance = new ProjectState();
    return this.instance;
  }

  addproject(title: string, desc: string, people: number) {
    const newPj = new Project(
      Math.random().toString(),
      title,
      desc,
      people,
      ProjectStatus.Active
    );
    this.projects.push(newPj);
    this.updateListners();
  }

  movePJ(projectId: string, newStatus: ProjectStatus) {
    const project = this.projects.find((prj) => prj.id === projectId);
    if (project && project.status !== newStatus) {
      project.status = newStatus;
      this.updateListners();
    }
  }

  private updateListners() {
    for (const listenerFn of this.listeners) {
      listenerFn(this.projects.slice());
    }
  }
}

const projectState = ProjectState.getInstance();

interface validate {
  value: string | number;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
}

const validateFn = (validateInput: validate) => {
  let isValide = true;
  if (validateInput.required) {
    isValide = isValide && validateInput.value.toString().trim().length !== 0;
  }
  if (
    validateInput.minLength != null &&
    typeof validateInput.value === "string"
  ) {
    isValide = isValide && validateInput.value.length > validateInput.minLength;
  }
  if (
    validateInput.maxLength != null &&
    typeof validateInput.value === "string"
  ) {
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

function autoBind(_: any, _1: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  const adjDescrpitor: PropertyDescriptor = {
    configurable: true,
    get() {
      const boundFn = originalMethod.bind(this);
      return boundFn;
    },
  };
  return adjDescrpitor;
}

abstract class Component<T extends HTMLElement, U extends HTMLElement> {
  templateElement: HTMLTemplateElement;
  hostEle: T;
  element: U;

  constructor(
    templateId: string,
    hostElId: string,
    inserAtStart: boolean,
    newElId?: string
  ) {
    this.templateElement = <HTMLTemplateElement>(
      document.getElementById(templateId)!
    );
    this.hostEle = <T>document.getElementById(hostElId)!;

    const importNode = document.importNode(this.templateElement.content, true);
    this.element = <U>importNode.firstElementChild;
    if (newElId) {
      this.element.id = newElId;
    }
    this.attach(inserAtStart);
  }
  private attach(inserAtbegin: boolean) {
    this.hostEle.insertAdjacentElement(
      inserAtbegin ? "afterbegin" : "beforeend",
      this.element
    );
  }

  abstract configure(): void;
  abstract renderContent(): void;
}

class ProjectItem
  extends Component<HTMLUListElement, HTMLLIElement>
  implements Draggable
{
  private project: Project;

  get persons() {
    if (this.project.people === 1) {
      return "1 person";
    } else {
      return `${this.project.people} persons`;
    }
  }

  constructor(hostId: string, project: Project) {
    super("single-project", hostId, false, project.id);
    this.project = project;
    this.configure();
    this.renderContent();
  }
  @autoBind
  dragStartHandler(event: DragEvent): void {
    event.dataTransfer!.setData("text/plain", this.project.id);
    event.dataTransfer!.effectAllowed = "move";
  }
  dragEndHandler(_: DragEvent): void {
    console.log("DragEnd");
  }

  configure() {
    this.element.addEventListener("dragstart", this.dragStartHandler);
    this.element.addEventListener("dragend", this.dragEndHandler);
  }
  renderContent() {
    this.element.querySelector("h2")!.textContent = this.project.title;
    this.element.querySelector("p")!.textContent = this.project.desc;
    this.element.querySelector("h3")!.textContent = this.persons + " assigned";
  }
}

class ProjectList
  extends Component<HTMLDivElement, HTMLElement>
  implements DragTarget
{
  assignedpj: Project[];
  constructor(private type: "active" | "finished") {
    super("project-list", "app", false, `${type}-projects`);
    this.assignedpj = [];

    console.log(projectState);
    this.configure();
    this.renderContent();
  }
  @autoBind
  dragOverHandler(event: DragEvent) {
    if (event.dataTransfer && event.dataTransfer.types[0] === "text/plain") {
      event.preventDefault();
      const listEl = this.element.querySelector("ul")!;
      listEl.classList.add("droppable");
    }
  }
  @autoBind
  dropHandler(event: DragEvent) {
    const prjId = event.dataTransfer!.getData("text/plain");
    projectState.movePJ(
      prjId,
      this.type === "active" ? ProjectStatus.Active : ProjectStatus.Finished
    );
  }

  @autoBind
  dragLeaveHandler(_: DragEvent) {
    const listEl = this.element.querySelector("ul")!;
    listEl.classList.remove("droppable");
  }

  configure() {
    this.element.addEventListener("dragover", this.dragOverHandler);
    this.element.addEventListener("dragleave", this.dragLeaveHandler);
    this.element.addEventListener("drop", this.dropHandler);

    projectState.addlistener((projects: Project[]) => {
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
    this.element.querySelector("ul")!.id = listId;
    this.element.querySelector("h2")!.textContent =
      this.type.toUpperCase() + " Projects";
  }

  private renderPj() {
    const listEl = <HTMLUListElement>(
      document.getElementById(`${this.type}-projects-list`)!
    );

    listEl.innerHTML = "";

    for (const pjitem of this.assignedpj) {
      new ProjectItem(this.element.querySelector("ul")!.id, pjitem);
    }
  }
}

class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
  inputTitle: HTMLInputElement;
  inputDesc: HTMLInputElement;
  inputpeople: HTMLInputElement;

  constructor() {
    super("project-input", "app", true, "user-input");
    this.inputTitle = <HTMLInputElement>this.element.querySelector("#title");
    this.inputDesc = <HTMLInputElement>(
      this.element.querySelector("#description")
    );
    this.inputpeople = <HTMLInputElement>this.element.querySelector("#people");

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
const prjInput = new ProjectInput();
const activeList = new ProjectList("active");
const finList = new ProjectList("finished");
