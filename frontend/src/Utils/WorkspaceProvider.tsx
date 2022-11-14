import { createContext } from "react";

export type SetActiveWorkspace = (workspace: string) => void;

export type Workspace = {
  setActiveWorkspace: SetActiveWorkspace;
  activeWorkspace: string | null;
};

export const WorkspaceProvider = createContext<Workspace>({} as Workspace);
