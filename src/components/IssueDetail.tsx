import { useState, useRef } from 'react';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Plus, Trash2, FileIcon, ImageIcon, Edit2, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export function IssueDetail() {
  const {
    issues,
    selectedIssueId,
    updateIssue,
    addTask,
    updateTask,
    deleteTask,
    deleteIssue,
    addAttachment,
    deleteAttachment,
  } = useStore();
  const issue = issues.find((i) => i.id === selectedIssueId);

  // Attachment dialog state
  const [attachmentDialogOpen, setAttachmentDialogOpen] = useState(false);
  const [attachmentContent, setAttachmentContent] = useState('');
  const [attachmentImage, setAttachmentImage] = useState<File | null>(null);
  const attachmentFileInputRef = useRef<HTMLInputElement>(null);

  // Task dialog state
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [taskDate, setTaskDate] = useState('');
  const [taskContent, setTaskContent] = useState('');
  const [taskFiles, setTaskFiles] = useState<string[]>([]);
  const [newTaskFile, setNewTaskFile] = useState('');
  const [taskDuration, setTaskDuration] = useState('');

  if (!issue) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-slate-500 text-sm">
        이슈를 선택해주세요.
      </div>
    );
  }

  // Attachment handlers
  const handleAddAttachment = () => {
    if (!attachmentContent) return;
    const fileName = attachmentImage?.name || '';
    addAttachment(issue.id, {
      content: attachmentContent,
      image: fileName,
    });
    setAttachmentContent('');
    setAttachmentImage(null);
    setAttachmentDialogOpen(false);
  };

  // Task handlers
  const handleOpenTaskDialog = (taskId?: string) => {
    if (taskId) {
      const task = issue.tasks.find((t) => t.id === taskId);
      if (task) {
        setEditingTaskId(taskId);
        setTaskDate(task.date);
        setTaskContent(task.content);
        setTaskFiles([...(task.files || [])]);
        setTaskDuration(task.duration || '');
      }
    } else {
      setEditingTaskId(null);
      setTaskDate(new Date().toISOString().split('T')[0].replace(/-/g, '.'));
      setTaskContent('');
      setTaskFiles([]);
      setTaskDuration('');
    }
    setNewTaskFile('');
    setTaskDialogOpen(true);
  };

  const handleSaveTask = () => {
    if (!taskContent) return;
    if (editingTaskId) {
      updateTask(issue.id, editingTaskId, {
        date: taskDate,
        content: taskContent,
        files: taskFiles,
        duration: taskDuration,
      });
    } else {
      addTask(issue.id, {
        date: taskDate,
        content: taskContent,
        files: taskFiles,
        duration: taskDuration,
      });
    }
    setTaskDialogOpen(false);
  };

  const handleAddTaskFile = () => {
    if (newTaskFile && !taskFiles.includes(newTaskFile)) {
      setTaskFiles([...taskFiles, newTaskFile]);
      setNewTaskFile('');
    }
  };

  const handleRemoveTaskFile = (fileName: string) => {
    setTaskFiles(taskFiles.filter((f) => f !== fileName));
  };

  return (
    <div className="flex h-full flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 p-4 gap-4">
        <div className="flex items-center gap-3 flex-1">
          <Badge
            variant="outline"
            className={cn(
              'cursor-pointer text-xs px-2 py-1 whitespace-nowrap font-medium',
              issue.status === 'done'
                ? 'bg-emerald-100 text-emerald-700 border-emerald-300'
                : 'bg-blue-100 text-blue-700 border-blue-300',
            )}
            onClick={() =>
              updateIssue(issue.id, {
                status: issue.status === 'progress' ? 'done' : 'progress',
              })
            }
          >
            {issue.status === 'progress' ? '진행중' : '완료'}
          </Badge>
          <div className="flex flex-col gap-1 min-w-0 flex-1">
            <h2 className="text-sm font-semibold truncate text-slate-900">
              {issue.title}
            </h2>
            <div className="text-xs text-slate-600 flex gap-3 flex-wrap">
              <span>{issue.requester}</span>
              <span className="font-mono">{issue.requestNumber}</span>
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => deleteIssue(issue.id)}
          className="h-8 w-8 shrink-0"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-6 p-5 max-w-4xl mx-auto">
          {/* Info Grid */}
          <div className="grid grid-cols-1 gap-4">
            {/* Row 1 */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1">
                <Label className="text-xs text-slate-600 font-medium">
                  의뢰번호
                </Label>
                <Input
                  className="h-7 text-xs border-slate-200"
                  value={issue.requestNumber}
                  onChange={(e) =>
                    updateIssue(issue.id, { requestNumber: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-slate-600 font-medium">
                  의뢰일
                </Label>
                <Input
                  className="h-7 text-xs border-slate-200"
                  value={issue.requestDate}
                  onChange={(e) =>
                    updateIssue(issue.id, { requestDate: e.target.value })
                  }
                  placeholder="YYYY.MM.DD"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-slate-600 font-medium">
                  예정시작일
                </Label>
                <Input
                  className="h-7 text-xs border-slate-200"
                  value={issue.startDate}
                  onChange={(e) =>
                    updateIssue(issue.id, { startDate: e.target.value })
                  }
                  placeholder="YYYY.MM.DD"
                />
              </div>
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1">
                <Label className="text-xs text-slate-600 font-medium">
                  제목
                </Label>
                <Input
                  className="h-7 text-xs border-slate-200"
                  value={issue.title}
                  onChange={(e) =>
                    updateIssue(issue.id, { title: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-slate-600 font-medium">
                  예정종료일
                </Label>
                <Input
                  className="h-7 text-xs border-slate-200"
                  value={issue.endDate}
                  onChange={(e) =>
                    updateIssue(issue.id, { endDate: e.target.value })
                  }
                  placeholder="YYYY.MM.DD"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-slate-600 font-medium">
                  완료일자
                </Label>
                <Input
                  className="h-7 text-xs border-slate-200"
                  value={issue.completionDate}
                  onChange={(e) =>
                    updateIssue(issue.id, { completionDate: e.target.value })
                  }
                  placeholder="YYYY.MM.DD"
                />
              </div>
            </div>

            {/* Row 3 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-xs text-slate-600 font-medium">
                  의뢰 부서
                </Label>
                <Input
                  className="h-7 text-xs border-slate-200"
                  value={issue.department}
                  onChange={(e) =>
                    updateIssue(issue.id, { department: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-slate-600 font-medium">
                  의뢰자
                </Label>
                <Input
                  className="h-7 text-xs border-slate-200"
                  value={issue.requester}
                  onChange={(e) =>
                    updateIssue(issue.id, { requester: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          <Separator className="bg-slate-200" />

          {/* Description */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-slate-900">
              의뢰 내용
            </Label>
            <Textarea
              className="min-h-[100px] resize-none text-xs border-slate-200"
              value={issue.content}
              onChange={(e) =>
                updateIssue(issue.id, { content: e.target.value })
              }
            />
          </div>

          <Separator className="bg-slate-200" />

          {/* Attachments */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold text-slate-900">
                첨부 사진
              </Label>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setAttachmentDialogOpen(true)}
                className="h-7 text-xs px-2 border-slate-200"
              >
                <Plus className="h-3 w-3 mr-1" />
                추가
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {issue.attachments.map((att) => (
                <div key={att.id} className="relative group">
                  <Card className="overflow-hidden border border-slate-200">
                    <div className="aspect-square bg-slate-100 flex items-center justify-center">
                      {att.image ? (
                        <div className="flex flex-col items-center text-slate-500 gap-1">
                          <ImageIcon className="h-6 w-6" />
                          <span className="text-[9px] text-center line-clamp-2 px-1">
                            {att.image}
                          </span>
                        </div>
                      ) : (
                        <FileIcon className="h-6 w-6 text-slate-400" />
                      )}
                    </div>
                    <CardContent className="p-2">
                      <p className="text-[10px] line-clamp-2 text-slate-700">
                        {att.content}
                      </p>
                    </CardContent>
                  </Card>
                  <Button
                    size="icon"
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => deleteAttachment(issue.id, att.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <Separator className="bg-slate-200" />

          {/* Tasks/Work Log */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold text-slate-900">
                작업 내역
              </Label>
              <Button
                size="sm"
                onClick={() => handleOpenTaskDialog()}
                className="h-7 text-xs px-2"
              >
                <Plus className="h-3 w-3 mr-1" />
                추가
              </Button>
            </div>

            {/* Task List */}
            <div className="space-y-2">
              {issue.tasks.map((task) => (
                <Card
                  key={task.id}
                  className="border border-slate-200 bg-slate-50"
                >
                  <CardContent className="p-3">
                    <div className="flex gap-3">
                      <div className="w-[90px] shrink-0 text-[10px] font-medium text-slate-600">
                        {task.date}
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-xs whitespace-pre-wrap text-slate-900">
                          {task.content}
                        </p>
                        {task.files && task.files.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {task.files.map((file, idx) => (
                              <div
                                key={idx}
                                className="flex items-center gap-1 text-[9px] text-slate-600 bg-white px-2 py-1 rounded border border-slate-200"
                              >
                                <FileIcon className="h-2.5 w-2.5" />
                                {file}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {task.duration && (
                          <span className="text-[10px] text-slate-600">
                            {task.duration}시간
                          </span>
                        )}
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-6 w-6"
                          onClick={() => handleOpenTaskDialog(task.id)}
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-6 w-6"
                          onClick={() => deleteTask(issue.id, task.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>

      {/* Attachment Dialog */}
      <Dialog
        open={attachmentDialogOpen}
        onOpenChange={setAttachmentDialogOpen}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-sm">첨부 사진 추가</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-4">
            <div className="space-y-1">
              <Label htmlFor="attachContent" className="text-xs">
                내용
              </Label>
              <Input
                id="attachContent"
                placeholder="사진 설명"
                value={attachmentContent}
                onChange={(e) => setAttachmentContent(e.target.value)}
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="attachFile" className="text-xs">
                파일
              </Label>
              <div className="flex gap-2">
                <Input
                  id="attachFile"
                  type="file"
                  accept=".jpg,.jpeg,.png"
                  ref={attachmentFileInputRef}
                  onChange={(e) =>
                    setAttachmentImage(e.target.files?.[0] || null)
                  }
                  className="h-8 text-xs flex-1"
                />
              </div>
              {attachmentImage && (
                <p className="text-[10px] text-slate-600">
                  선택됨: {attachmentImage.name}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAttachmentDialogOpen(false)}
              className="h-8 text-xs"
            >
              취소
            </Button>
            <Button
              size="sm"
              onClick={handleAddAttachment}
              disabled={!attachmentContent}
              className="h-8 text-xs"
            >
              추가
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Task Dialog */}
      <Dialog open={taskDialogOpen} onOpenChange={setTaskDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-sm">
              {editingTaskId ? '작업 수정' : '작업 추가'}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="taskDate" className="text-xs">
                  날짜
                </Label>
                <Input
                  id="taskDate"
                  placeholder="YYYY.MM.DD"
                  value={taskDate}
                  onChange={(e) => setTaskDate(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="taskDuration" className="text-xs">
                  소요시간
                </Label>
                <Input
                  id="taskDuration"
                  type="number"
                  placeholder="시간"
                  value={taskDuration}
                  onChange={(e) => setTaskDuration(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="taskContent" className="text-xs">
                내용
              </Label>
              <Textarea
                id="taskContent"
                placeholder="작업 내용"
                value={taskContent}
                onChange={(e) => setTaskContent(e.target.value)}
                className="resize-none text-xs min-h-[80px] border-slate-200"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">파일 목록</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="파일명"
                  value={newTaskFile}
                  onChange={(e) => setNewTaskFile(e.target.value)}
                  className="h-8 text-xs flex-1"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleAddTaskFile}
                  className="h-8 text-xs px-2"
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
              {taskFiles.length > 0 && (
                <div className="space-y-1">
                  {taskFiles.map((file, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-[10px] text-slate-600 bg-slate-100 px-2 py-1 rounded"
                    >
                      <span>{file}</span>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-5 w-5"
                        onClick={() => handleRemoveTaskFile(file)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTaskDialogOpen(false)}
              className="h-8 text-xs"
            >
              취소
            </Button>
            <Button
              size="sm"
              onClick={handleSaveTask}
              disabled={!taskContent}
              className="h-8 text-xs"
            >
              {editingTaskId ? '수정' : '추가'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
