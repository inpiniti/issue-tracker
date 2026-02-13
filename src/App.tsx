import { IssueList } from './components/IssueList';
import { IssueDetail } from './components/IssueDetail';

function App() {
  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground text-sm antialiased">
      <IssueList />
      <main className="flex-1 h-full overflow-hidden flex flex-col">
        <IssueDetail />
      </main>
    </div>
  );
}

export default App;
