import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';

export function IssueList() {
  const { issues, addIssue, selectIssue, selectedIssueId } = useStore();
  const [filterStatus, setFilterStatus] = useState<'progress' | 'done' | 'all'>(
    'all',
  );
  const [openDialog, setOpenDialog] = useState(false);

  const [newRequestNum, setNewRequestNum] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newRequester, setNewRequester] = useState('');

  const handleAdd = () => {
    if (!newRequestNum || !newTitle || !newRequester) return;

    addIssue({
      requestNumber: newRequestNum,
      title: newTitle,
      requester: newRequester,
      department: '',
      content: '',
      startDate: new Date().toISOString().split('T')[0].replace(/-/g, '.'),
      endDate: '',
      completionDate: '',
      requestDate: new Date().toISOString().split('T')[0].replace(/-/g, '.'),
    });

    setNewRequestNum('');
    setNewTitle('');
    setNewRequester('');
    setOpenDialog(false);
  };

  const filteredIssues = issues.filter((issue) => {
    if (filterStatus === 'all') return true;
    return issue.status === filterStatus;
  });

  return (
    <div className="w-[320px] border-r bg-slate-50 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b bg-white border-slate-200">
        <div className="flex items-center justify-between gap-2 mb-3">
          <h2 className="text-sm font-semibold text-slate-900">이슈 리스트</h2>
          <Button
            size="sm"
            className="h-7 text-xs px-2"
            onClick={() => setOpenDialog(true)}
          >
            <Plus className="h-3 w-3 mr-1" />
            추가
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          <Button
            variant={filterStatus === 'all' ? 'default' : 'outline'}
            size="sm"
            className="flex-1 h-7 text-xs"
            onClick={() => setFilterStatus('all')}
          >
            전체
          </Button>
          <Button
            variant={filterStatus === 'progress' ? 'default' : 'outline'}
            size="sm"
            className="flex-1 h-7 text-xs"
            onClick={() => setFilterStatus('progress')}
          >
            진행중
          </Button>
          <Button
            variant={filterStatus === 'done' ? 'default' : 'outline'}
            size="sm"
            className="flex-1 h-7 text-xs"
            onClick={() => setFilterStatus('done')}
          >
            완료
          </Button>
        </div>
      </div>

      {/* Issues List */}
      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-2 p-3">
          {filteredIssues.map((issue) => (
            <Card
              key={issue.id}
              className={`cursor-pointer transition-all border ${
                selectedIssueId === issue.id
                  ? 'border-blue-300 bg-blue-50 shadow-md border-2'
                  : 'border-slate-200 bg-white hover:border-blue-200 hover:shadow-md'
              }`}
              onClick={() => selectIssue(issue.id)}
            >
              <CardContent className="p-3">
                <div className="flex flex-col gap-2">
                  {/* Status and Date */}
                  <div className="flex items-center justify-between gap-2">
                    <Badge
                      variant="outline"
                      className={`text-[10px] px-2 py-0.5 font-medium ${
                        issue.status === 'done'
                          ? 'bg-emerald-100 text-emerald-700 border-emerald-300'
                          : 'bg-blue-100 text-blue-700 border-blue-300'
                      }`}
                    >
                      {issue.status === 'progress' ? '진행중' : '완료'}
                    </Badge>
                    <span className="text-[10px] text-slate-500 whitespace-nowrap">
                      {issue.startDate}
                    </span>
                  </div>

                  {/* Title */}
                  <div className="font-medium text-xs line-clamp-2 leading-tight text-slate-900">
                    {issue.title}
                  </div>

                  {/* Request Number and Requester */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] text-slate-600 truncate">
                      {issue.requester}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono whitespace-nowrap">
                      {issue.requestNumber}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {filteredIssues.length === 0 && (
            <div className="p-4 text-center text-xs text-slate-500">
              등록된 이슈가 없습니다.
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Add Dialog */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-sm">이슈 추가</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-4">
            <div className="space-y-1">
              <Label htmlFor="requestNum" className="text-xs">
                의뢰번호
              </Label>
              <Input
                id="requestNum"
                placeholder="의뢰번호 입력"
                value={newRequestNum}
                onChange={(e) => setNewRequestNum(e.target.value)}
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="title" className="text-xs">
                제목
              </Label>
              <Input
                id="title"
                placeholder="제목 입력"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="requester" className="text-xs">
                의뢰자
              </Label>
              <Input
                id="requester"
                placeholder="의뢰자 입력"
                value={newRequester}
                onChange={(e) => setNewRequester(e.target.value)}
                className="h-8 text-xs"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setOpenDialog(false)}
              className="h-8 text-xs"
            >
              취소
            </Button>
            <Button
              size="sm"
              onClick={handleAdd}
              disabled={!newRequestNum || !newTitle || !newRequester}
              className="h-8 text-xs"
            >
              추가
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
