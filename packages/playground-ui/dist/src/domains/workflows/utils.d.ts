import { WorkflowRunState } from '@mastra/core/workflows';
import { ExtendedWorkflowWatchResult } from '../../hooks/use-workflows';

export declare function convertWorkflowRunStateToWatchResult(runState: WorkflowRunState): ExtendedWorkflowWatchResult;
