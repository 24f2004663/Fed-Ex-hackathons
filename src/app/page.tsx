import Image from 'next/image';
import ImportDropdown from '@/components/ImportDropdown';
import LogoutButton from '@/components/LogoutButton';
import prisma from '@/lib/db';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { DollarSign, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { HistoricalPerformanceGraph } from '@/components/HistoricalPerformanceGraph';
import { AgencyAdministrationCard } from '@/components/AgencyAdministrationCard';
import { SessionGuard } from '@/components/SessionGuard';
import { auth } from '@/auth';
import AutoAllocateButton from '@/components/AutoAllocateButton';

async function getDashboardData() {
  const rawCases = await prisma.case.findMany({
    include: {
      invoice: true,
      assignedTo: true
    }
  });

  // Custom Sort: HIGH > MEDIUM > LOW, then AI Score Desc
  const priorityOrder: Record<string, number> = { 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };

  const cases = rawCases.sort((a: any, b: any) => {
    const pA = priorityOrder[a.priority] || 0;
    const pB = priorityOrder[b.priority] || 0;

    if (pA !== pB) return pB - pA; // Higher priority first
    return (b.aiScore || 0) - (a.aiScore || 0); // Higher score first
  });

  const totalAmount = await prisma.invoice.aggregate({
    _sum: { amount: true }
  });

  const highPriorityCount = await prisma.case.count({
    where: { priority: 'HIGH' }
  });

  const recoveryRate = 68;
  const avgDSO = 42;

  return { cases, totalAmount, highPriorityCount, recoveryRate, avgDSO };
}

export default async function DashboardPage() {
  const { cases, totalAmount, highPriorityCount, recoveryRate, avgDSO } = await getDashboardData();
  const hasUnassignedCases = cases.some((c: any) => c.status === 'NEW' || c.status === 'QUEUED' || !c.assignedTo);

  return (
    <SessionGuard>
      <main className="min-h-screen bg-gray-50 p-8">
        <header className="grid grid-cols-3 items-center mb-8 bg-[#0B0F19] p-4 rounded-xl shadow-sm">
          <div className="justify-self-start">
            <h1 className="text-3xl font-bold text-white">FedEx Smart Recovery</h1>
            <p className="text-gray-400">AI-Driven Debt Collections Command Center</p>
          </div>

          <div className="justify-self-center">
            <Image
              src="/team-seekers-logo-v2.png"
              alt="Team Seekers"
              width={150}
              height={150}
              className="h-24 w-auto"
              priority
            />
          </div>

          <div className="flex gap-4 justify-self-end">
            <ImportDropdown />
            <LogoutButton />
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg text-[var(--color-primary)]">
                <span className="font-bold text-lg">$</span>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Total Exposure</p>
                <h3 className="text-2xl font-bold text-gray-800">${totalAmount._sum.amount?.toLocaleString() ?? '0'}</h3>
                <p className="text-xs text-green-600 mt-1">+12% vs last month</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-100 rounded-lg text-red-600">
                <span className="font-bold text-lg">!</span>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">High Priority Cases</p>
                <h3 className="text-2xl font-bold text-red-600">{highPriorityCount}</h3>
                <p className="text-xs text-red-500 mt-1">Requires Immediate Action</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg text-green-600">
                <span className="font-bold text-lg">✔</span>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Recovery Rate</p>
                <h3 className="text-2xl font-bold text-green-600">{recoveryRate}%</h3>
                <p className="text-xs text-green-500 mt-1">Target: 65%</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
                <span className="font-bold text-lg">🕒</span>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Avg DSO</p>
                <h3 className="text-2xl font-bold text-gray-800">{avgDSO} Days</h3>
                <p className="text-xs text-blue-500 mt-1">-3 days improvement</p>
              </div>
            </div>
          </Card>
        </div>

        <h2 className="text-lg font-bold text-gray-800 mb-4">Live Activity Monitor</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <AgencyAdministrationCard />
          <Card>
            <h3 className="text-sm font-bold text-[var(--color-primary)] mb-4 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              SLA Breaches
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-2 bg-red-50 rounded border border-red-100">
                <span className="text-xs font-medium text-gray-700">INV-2025-001</span>
                <span className="text-xs font-bold text-red-600">-2h</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-orange-50 rounded border border-orange-100">
                <span className="text-xs font-medium text-gray-700">INV-9092-22</span>
                <span className="text-xs font-bold text-orange-600">Warning</span>
              </div>
            </div>
          </Card>
        </div>

        <div className="mb-0 flex-1 min-h-0">
          <Card className="h-full flex flex-col shadow-lg border-0">
            <div className="mb-4 shrink-0 px-6 pt-6 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                Intelligent Priority Queue
                <span className="bg-gray-100 text-gray-500 text-xs px-2 py-1 rounded-full">{cases.length} Items</span>
              </h2>
              <AutoAllocateButton show={hasUnassignedCases} />
            </div>

            <div className="flex-1 overflow-y-auto px-6 pb-6 min-h-[500px] max-h-[600px] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
              <table className="w-full text-left">
                <thead className="sticky top-0 bg-white z-10 shadow-sm">
                  <tr className="text-xs font-semibold text-gray-500 uppercase">
                    <th className="pb-3 pl-4 bg-white pt-2">Invoice</th>
                    <th className="pb-3 bg-white pt-2">Amount</th>
                    <th className="pb-3 bg-white pt-2">Days Overdue</th>
                    <th className="pb-3 bg-white pt-2">Agency</th>
                    <th className="pb-3 bg-white pt-2">AI Score</th>
                    <th className="pb-3 bg-white pt-2">Priority</th>
                    <th className="pb-3 pr-4 bg-white pt-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {cases.map((c: any) => (
                    <tr key={c.id} className="hover:bg-blue-50/50 transition-colors group">
                      <td className="py-3 pl-4 text-sm font-medium text-gray-800">{c.invoice.invoiceNumber}</td>
                      <td className="py-3 text-sm text-gray-600 font-mono">${c.invoice.amount.toLocaleString()}</td>
                      <td className="py-3 text-sm text-gray-500">38d</td>
                      <td className="py-3 text-sm">
                        {c.status === 'QUEUED' || !c.assignedTo ? (
                          <span className="text-gray-400 italic">TBD</span>
                        ) : (
                          <span className="text-gray-700 font-medium">{c.assignedTo.name}</span>
                        )}
                      </td>
                      <td className="py-3 w-48">
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[var(--color-primary)] rounded-full transition-all duration-300"
                              style={{ width: `${c.aiScore}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold text-gray-600">{c.aiScore}</span>
                        </div>
                      </td>
                      <td className="py-3">
                        <Badge variant={c.priority === 'HIGH' ? 'danger' : c.priority === 'MEDIUM' ? 'warning' : 'success'}>
                          {c.priority}
                        </Badge>
                      </td>
                      <td className="py-3 pr-4">
                        <span className="text-xs text-gray-500 capitalize">{c.status.toLowerCase()}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <div className="mt-8 mb-8">
          <HistoricalPerformanceGraph />
        </div>
      </main>
    </SessionGuard>
  );
}
