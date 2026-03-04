import { useState } from 'react';
import { IssueList } from './components/IssueList';
import { IssueDetail } from './components/IssueDetail';
import { CalendarView } from './components/CalendarView';
import { CalendarDays, List } from 'lucide-react';

type Tab = 'list' | 'calendar';

function App() {
  const [tab, setTab] = useState<Tab>('list');

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background text-foreground text-sm antialiased">
      {/* 상단 탭 */}
      <div className="flex items-center gap-1 px-3 py-1.5 border-b bg-background flex-shrink-0">
        <button
          onClick={() => setTab('list')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium transition-colors ${
            tab === 'list'
              ? 'bg-blue-500 text-white'
              : 'text-muted-foreground hover:bg-muted'
          }`}
        >
          <List size={14} />
          목록
        </button>
        <button
          onClick={() => setTab('calendar')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium transition-colors ${
            tab === 'calendar'
              ? 'bg-blue-500 text-white'
              : 'text-muted-foreground hover:bg-muted'
          }`}
        >
          <CalendarDays size={14} />
          달력
        </button>
      </div>

      {/* 컨텐츠 */}
      {tab === 'list' ? (
        <div className="flex flex-1 overflow-hidden">
          <IssueList />
          <main className="flex-1 h-full overflow-hidden flex flex-col">
            <IssueDetail />
          </main>
        </div>
      ) : (
        <div className="flex-1 overflow-hidden">
          <CalendarView />
        </div>
      )}
    </div>
  );
}

export default App;
