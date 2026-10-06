import { useRoute } from './router';
import { Layout } from './ui/Layout';
import { Inbox } from './pages/Inbox';
import { Desk } from './pages/Desk';
import { EvalLab } from './pages/EvalLab';
import { Metrics } from './pages/Metrics';
import { SaidNo } from './pages/SaidNo';
import { Rules } from './pages/Rules';
import { INBOX_BY_REF } from './data/inbox';

export function App() {
  const [page, arg] = useRoute();
  let body;
  let active = page ?? '';
  if (!page) body = <Inbox />;
  else if (page === 'case' && arg && INBOX_BY_REF[arg]) { body = <Desk refId={arg} key={arg} />; active = ''; }
  else if (page === 'eval') body = <EvalLab />;
  else if (page === 'metrics') body = <Metrics />;
  else if (page === 'no') body = <SaidNo />;
  else if (page === 'rules') body = <Rules />;
  else body = (
    <section className="page narrow">
      <p className="eyebrow">Not found</p>
      <h1 className="display">That page does not exist.</h1>
      <p><a href="#/">Back to the case inbox</a></p>
    </section>
  );
  return <Layout active={active} wide={page === 'case'}>{body}</Layout>;
}
