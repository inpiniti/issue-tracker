export interface Attachment {
  id: string;
  content: string;
  image?: string;
}

export interface Task {
  id: string;
  date: string;
  content: string;
  files?: string[];
  duration?: string;
}

export interface Issue {
  id: string;
  requestNumber: string;
  title: string;
  department: string;
  requester: string;
  content: string;
  attachments: Attachment[];
  startDate: string;
  endDate: string;
  completionDate: string;
  requestDate: string;
  tasks: Task[];
  status: 'progress' | 'done';
}
