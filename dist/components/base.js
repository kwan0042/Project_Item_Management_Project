export class Component {
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
//# sourceMappingURL=base.js.map