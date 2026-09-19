import { CopilotUserContext } from "./types";
import { createCopilotReadTools } from "./read-tools";
import { createCopilotActionTools } from "./action-tools";

export * from "./types";

export function createCopilotTools(userContext: CopilotUserContext) {
  return {
    ...createCopilotReadTools(userContext),
    ...createCopilotActionTools(),
  };
}
