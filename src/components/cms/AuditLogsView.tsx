import React from 'react';
import { ShieldCheck, Clock, User, Terminal } from 'lucide-react';
import { useNews } from '../../context/NewsContext';
import { formatRelativeTime } from '../../utils/translation';

export const AuditLogsView: React.FC = () => {
  const { auditLogs, currentLanguage } = useNews();

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h3 className="font-serif-headline text-lg font-bold text-slate-900 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          Newsroom Audit Trail &amp; Cryptographic Trace Logs
        </h3>
        <p className="text-xs text-slate-500">
          Immutable editorial actions log tracking article authoring, publishes, deletions, and verification sign-offs.
        </p>
      </div>

      <div className="bg-slate-900 text-slate-200 rounded-lg p-4 font-mono text-xs overflow-x-auto shadow-inner">
        <div className="flex items-center gap-2 text-slate-400 pb-3 border-b border-slate-800 mb-3 text-[11px]">
          <Terminal className="w-4 h-4 text-emerald-400" />
          <span>LIVE NEWSROOM AUDIT STREAM // 256-BIT EDITORIAL IMMUTABILITY</span>
        </div>

        <div className="space-y-3">
          {auditLogs.map((log) => (
            <div
              key={log.id}
              className="p-2.5 rounded bg-slate-950 border border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="bg-amber-500/20 text-amber-400 text-[10px] px-1.5 py-0.5 rounded uppercase font-bold">
                    {log.action}
                  </span>
                  <span className="text-white font-semibold">{log.targetTitle}</span>
                </div>
                <div className="text-slate-400 text-[11px]">{log.details}</div>
              </div>

              <div className="text-right shrink-0 text-[11px] text-slate-500 flex sm:flex-col items-center sm:items-end gap-2 sm:gap-0">
                <span className="text-slate-300 flex items-center gap-1">
                  <User className="w-3 h-3 text-slate-400" />
                  {log.actorName} ({log.actorRole})
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatRelativeTime(log.timestamp, currentLanguage)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
