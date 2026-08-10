'use client';

import React, { useState } from 'react';
import { CheckCircle2, XCircle, Loader2, Wallet } from 'lucide-react';
import { toast } from 'sonner';

interface WithdrawalRequest {
  id: string;
  interviewerName: string;
  amount: number;
  requestedAt: string;
  method: 'UPI' | 'Bank';
  methodDetail: string;
  walletBalance: number;
  completedSessions: number;
}

const WITHDRAWAL_REQUESTS: WithdrawalRequest[] = [
  { id: 'wd-001', interviewerName: 'Pradeep Sharma', amount: 12400, requestedAt: '13 Jul, 2:30 AM', method: 'UPI', methodDetail: 'pradeep@paytm', walletBalance: 18600, completedSessions: 62 },
  { id: 'wd-002', interviewerName: 'Meena Iyer', amount: 8750, requestedAt: '12 Jul, 11:00 PM', method: 'Bank', methodDetail: 'HDFC ****4821', walletBalance: 9200, completedSessions: 44 },
  { id: 'wd-003', interviewerName: 'Arjun Patel', amount: 6200, requestedAt: '12 Jul, 6:15 PM', method: 'UPI', methodDetail: 'arjun@okaxis', walletBalance: 7100, completedSessions: 31 },
  { id: 'wd-004', interviewerName: 'Sunita Reddy', amount: 9800, requestedAt: '12 Jul, 1:00 PM', method: 'Bank', methodDetail: 'SBI ****2934', walletBalance: 11200, completedSessions: 49 },
  { id: 'wd-005', interviewerName: 'Ravi Chandran', amount: 5650, requestedAt: '11 Jul, 8:45 PM', method: 'UPI', methodDetail: 'ravi@ybl', walletBalance: 6800, completedSessions: 28 },
];

export default function WithdrawalQueue() {
  const [requests, setRequests] = useState(WITHDRAWAL_REQUESTS);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);

  const totalPending = requests.reduce((sum, r) => sum + r.amount, 0);

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    setLoadingId(id);
    setActionType(action);
    // BACKEND INTEGRATION: POST /api/admin/withdrawals/:id/process with { action }
    await new Promise((r) => setTimeout(r, 1000));
    const req = requests.find((r) => r.id === id);
    setRequests((prev) => prev.filter((r) => r.id !== id));
    setLoadingId(null);
    setActionType(null);
    if (action === 'approve') {
      toast.success(`Rs. ${req?.amount.toLocaleString('en-IN')} transferred to ${req?.interviewerName}`);
    } else {
      toast.error(`Withdrawal request from ${req?.interviewerName} rejected`);
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div>
          <h3 className="text-base font-700 text-foreground">Withdrawal Requests</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {requests.length} pending - Rs. {totalPending.toLocaleString('en-IN')} total
          </p>
        </div>
        <div className="w-9 h-9 rounded-xl bg-warning-bg flex items-center justify-center">
          <Wallet size={18} className="text-warning" />
        </div>
      </div>

      <div className="divide-y divide-border">
        {requests.length === 0 ? (
          <div className="text-center py-10">
            <CheckCircle2 size={28} className="text-success mx-auto mb-2" />
            <p className="text-sm font-600 text-foreground">No pending withdrawals</p>
          </div>
        ) : (
          requests.map((req) => {
            const isLoading = loadingId === req.id;
            return (
              <div key={req.id} className="px-5 py-4 hover:bg-secondary/30 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 text-xs font-700 flex-shrink-0">
                      {req.interviewerName.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-600 text-foreground">{req.interviewerName}</p>
                      <p className="text-xs text-muted-foreground">{req.methodDetail} - {req.method}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-base font-800 text-foreground tabular-nums">Rs. {req.amount.toLocaleString('en-IN')}</p>
                    <p className="text-xs text-muted-foreground">{req.completedSessions} sessions</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">{req.requestedAt}</p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleAction(req.id, 'reject')}
                      disabled={isLoading}
                      className="btn-danger py-1 px-2.5 text-xs"
                    >
                      {isLoading && actionType === 'reject' ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <XCircle size={12} />
                      )}
                      Reject
                    </button>
                    <button
                      onClick={() => handleAction(req.id, 'approve')}
                      disabled={isLoading}
                      className="btn-success py-1 px-2.5 text-xs"
                    >
                      {isLoading && actionType === 'approve' ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <CheckCircle2 size={12} />
                      )}
                      Transfer
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {requests.length > 0 && (
        <div className="px-5 py-3 bg-secondary border-t border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Total pending payout</span>
            <span className="text-sm font-800 text-foreground tabular-nums">Rs. {totalPending.toLocaleString('en-IN')}</span>
          </div>
        </div>
      )}
    </div>
  );
}