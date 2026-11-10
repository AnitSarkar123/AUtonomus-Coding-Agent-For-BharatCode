'use client';

import Icon from './Icon';

interface Props {
  repo: string;
  setRepo: (v: string) => void;
  task: string;
  setTask: (v: string) => void;
  running: boolean;
  disabled?: boolean;
  onRun: () => void;
  onStop: () => void;
  hasGitHubMCP?: boolean;
  hasMessages?: boolean;
  onCreatePR?: () => void;
}

export default function Composer({ repo, setRepo, task, setTask, running, disabled = false, onRun, onStop, hasGitHubMCP = false, hasMessages = false, onCreatePR }: Props) {
  function onKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); onRun(); }
  }

  // Show Create PR button when: not running, has messages (work done), has GitHub MCP connected, and user is signed in
  const showCreatePR = !running && hasMessages && hasGitHubMCP && !disabled && onCreatePR;

  return (
    <div className="composer">
      <div className="composer-box">
        <div className="composer-repo">
          <Icon name="github" size={14} />
          <input
            value={repo}
            disabled={disabled || running}
            onChange={e => setRepo(e.target.value)}
            placeholder="github.com/owner/repo"
            spellCheck={false}
          />
          <Icon name="branch" size={13} style={{ color: 'var(--fg-faint)' }} />
          <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--fg-faint)' }}>main</span>
        </div>
        <textarea
          value={task}
          disabled={disabled || running}
          onChange={e => setTask(e.target.value)}
          onKeyDown={onKey}
          rows={2}
          placeholder="Describe the task — e.g. add a /health endpoint and a test for it"
        />
        <div className="composer-foot">
          <span className="composer-hint"><kbd>Cmd</kbd> <kbd>Enter</kbd> to run</span>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 9 }}>
            {running && (
              <button className="btn ghost" onClick={onStop} title="Stop agent">
                <Icon name="x" size={14} />Stop
              </button>
            )}
            {showCreatePR && (
              <button className="btn" onClick={onCreatePR} style={{ background: 'var(--accent)', borderColor: 'var(--accent)', color: '#000' }} title="Create a PR for the changes">
                <Icon name="git-pull-request" size={14} />Create PR
              </button>
            )}
            <button className="btn" onClick={onRun} disabled={disabled || running || (!repo.trim() && !task.trim())}>
              {running
                ? <><span className="tc-status" style={{ width: 12, height: 12 }}><span className="spin" style={{ width: 12, height: 12 }} /></span>Running</>
                : <><Icon name="send" size={14} />{disabled ? 'Sign in to run' : 'Run task'}</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
