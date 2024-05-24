
  export abstract class Component<
    T extends HTMLElement,
    U extends HTMLElement
  > {
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

      const importNode = document.importNode(
        this.templateElement.content,
        true
      );
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
