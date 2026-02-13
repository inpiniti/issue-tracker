import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Issue, Task, Attachment } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface IssueState {
  issues: Issue[];
  selectedIssueId: string | null;

  // Actions
  addIssue: (
    issue: Omit<Issue, 'id' | 'status' | 'attachments' | 'tasks'>,
  ) => void;
  updateIssue: (id: string, updates: Partial<Issue>) => void;
  deleteIssue: (id: string) => void;
  selectIssue: (id: string | null) => void;
  addTask: (issueId: string, task: Omit<Task, 'id'>) => void;
  updateTask: (issueId: string, taskId: string, updates: Partial<Task>) => void;
  deleteTask: (issueId: string, taskId: string) => void;
  addAttachment: (issueId: string, attachment: Omit<Attachment, 'id'>) => void;
  deleteAttachment: (issueId: string, attachmentId: string) => void;
}

export const useStore = create<IssueState>()(
  persist(
    (set) => ({
      issues: [],
      selectedIssueId: null,

      addIssue: (issueData) =>
        set((state) => {
          const newIssue: Issue = {
            ...issueData,
            id: uuidv4(),
            status: 'progress',
            attachments: [],
            tasks: [],
            // defaults if missing
            department: issueData.department || '',
            content: issueData.content || '',
            startDate: issueData.startDate || '',
            endDate: issueData.endDate || '',
            completionDate: issueData.completionDate || '',
            requestDate: issueData.requestDate || '',
          };
          return {
            issues: [newIssue, ...state.issues],
            selectedIssueId: newIssue.id,
          };
        }),

      updateIssue: (id, updates) =>
        set((state) => ({
          issues: state.issues.map((issue) =>
            issue.id === id ? { ...issue, ...updates } : issue,
          ),
        })),

      deleteIssue: (id) =>
        set((state) => ({
          issues: state.issues.filter((i) => i.id !== id),
          selectedIssueId:
            state.selectedIssueId === id ? null : state.selectedIssueId,
        })),

      selectIssue: (id) => set({ selectedIssueId: id }),

      addTask: (issueId, taskData) =>
        set((state) => ({
          issues: state.issues.map((issue) => {
            if (issue.id === issueId) {
              return {
                ...issue,
                tasks: [
                  ...issue.tasks,
                  { ...taskData, id: uuidv4(), files: taskData.files || [] },
                ],
              };
            }
            return issue;
          }),
        })),

      addAttachment: (issueId, attachmentData) =>
        set((state) => ({
          issues: state.issues.map((issue) => {
            if (issue.id === issueId) {
              return {
                ...issue,
                attachments: [
                  ...issue.attachments,
                  { ...attachmentData, id: uuidv4() },
                ],
              };
            }
            return issue;
          }),
        })),

      deleteAttachment: (issueId, attachmentId) =>
        set((state) => ({
          issues: state.issues.map((issue) => {
            if (issue.id === issueId) {
              return {
                ...issue,
                attachments: issue.attachments.filter(
                  (a) => a.id !== attachmentId,
                ),
              };
            }
            return issue;
          }),
        })),

      updateTask: (issueId, taskId, updates) =>
        set((state) => ({
          issues: state.issues.map((issue) => {
            if (issue.id === issueId) {
              return {
                ...issue,
                tasks: issue.tasks.map((task) =>
                  task.id === taskId ? { ...task, ...updates } : task,
                ),
              };
            }
            return issue;
          }),
        })),

      deleteTask: (issueId, taskId) =>
        set((state) => ({
          issues: state.issues.map((issue) => {
            if (issue.id === issueId) {
              return {
                ...issue,
                tasks: issue.tasks.filter((t) => t.id !== taskId),
              };
            }
            return issue;
          }),
        })),
    }),
    {
      name: 'issue-storage', // unique name
    },
  ),
);
