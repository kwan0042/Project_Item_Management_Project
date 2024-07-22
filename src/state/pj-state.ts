
import { Project, ProjectStatus } from "../models/project";

    type Listener<T> = (items: T[]) => void;

  class State<T> {
    protected listeners: Listener<T>[] = [];
    addlistener(listenerFn: Listener<T>) {
      this.listeners.push(listenerFn);
    }
  }

  export class ProjectState extends State<Project> {
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

  export const projectState = ProjectState.getInstance();
