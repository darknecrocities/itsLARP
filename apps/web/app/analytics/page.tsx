"use client";
import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";
import { useStore } from "@/lib/store";
import { Empty, PageHeader, Stat, Reveal, Badge } from "@/components/ui";

type AnalyticsData = {
  total_applications: number;
  response_rate: number;
  interview_rate: number;
  offer_rate: number;
  roles: Record<string, { applied: number; responses: number; interviews: number }>;
  recommendation: string;
};

export default function AnalyticsPage() {
  const apps = useStore((s) => s.apps);

  const { data, isLoading } = useQuery<AnalyticsData>({
    queryKey: ["analytics", apps.length],
    queryFn: () => apiGet<AnalyticsData>("/analytics"),
    retry: 1,
  });

  const sent = apps.filter((a) => !["SAVED", "ANALYZING", "PREPARING", "READY"].includes(a.status));
  const total = data?.total_applications ?? sent.length;

  return (
    <>
      <PageHeader
        title="Career Intelligence Analytics"
        sub="Conversion metrics and performance signals calculated from your actual applications."
      />

      <section className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
        <Stat label="Submitted Applications" value={total} />
        <Stat label="Response Rate" value={data?.response_rate ?? 0} suffix="%" i={1} />
        <Stat label="Interview Rate" value={data?.interview_rate ?? 0} suffix="%" i={2} />
        <Stat label="Offer Rate" value={data?.offer_rate ?? 0} suffix="%" i={3} />
      </section>

      {total === 0 ? (
        <Empty
          title="No submitted applications yet"
          hint="Submit applications through the Application Studio to populate conversion metrics."
        />
      ) : (
        <div className="space-y-8">
          {/* AI Career Operating System Advice */}
          {data?.recommendation && (
            <Reveal>
              <div className="card p-5 bg-bg2/40 border-l-4 border-l-black">
                <div className="label-xs mb-1">AI Career Advisor Signal</div>
                <p className="text-sm font-medium leading-relaxed">
                  "{data.recommendation}"
                </p>
              </div>
            </Reveal>
          )}

          {/* Role Performance */}
          <Reveal i={1}>
            <h2 className="text-xl font-semibold mb-3">Role-Level Conversion Breakdown</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="label-xs border-b border-line">
                  <tr>
                    <th scope="col" className="py-2.5">Target Role Category</th>
                    <th scope="col">Applications</th>
                    <th scope="col">Employer Responses</th>
                    <th scope="col">Interviews</th>
                    <th scope="col">Response Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.roles && Object.keys(data.roles).length > 0 ? (
                    Object.entries(data.roles).map(([role, stats]) => {
                      const rate = stats.applied > 0 ? Math.round((100 * stats.responses) / stats.applied) : 0;
                      return (
                        <tr key={role} className="border-b border-line hover:bg-bg2 transition-colors">
                          <td className="py-3 font-semibold">{role}</td>
                          <td>{stats.applied}</td>
                          <td>{stats.responses}</td>
                          <td>{stats.interviews}</td>
                          <td>
                            <Badge tone={rate >= 20 ? "ok" : rate >= 10 ? "n" : "warn"}>
                              {rate}%
                            </Badge>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-muted text-sm">
                        Tracking initial submissions to build statistical comparisons.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Reveal>
        </div>
      )}
    </>
  );
}
