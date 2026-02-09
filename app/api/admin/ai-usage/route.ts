import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Check authentication & admin role
    const session = await getSession();
    if (!session?.role || session.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get stats in parallel
    const [tokensToday, costMonth, totalRequests, recentLogs] = await Promise.all([
      // Total tokens today
      prisma.aIUsageLog.aggregate({
        _sum: { totalTokens: true },
        where: { createdAt: { gte: todayStart } },
      }),

      // Total cost this month
      prisma.aIUsageLog.aggregate({
        _sum: { cost: true },
        where: { createdAt: { gte: monthStart } },
      }),

      // Total requests all time
      prisma.aIUsageLog.count(),

      // Recent usage logs with user info
      prisma.aIUsageLog.findMany({
        orderBy: { createdAt: "desc" },
        take: 50,
        include: {
          user: {
            select: { name: true, email: true },
          },
        },
      }),
    ]);

    // Calculate avg tokens per request
    const totalTokensAllTime = await prisma.aIUsageLog.aggregate({
      _sum: { totalTokens: true },
    });

    const avgTokensPerRequest = totalRequests > 0
      ? Math.round((totalTokensAllTime._sum.totalTokens || 0) / totalRequests)
      : 0;

    // Group by date for usage history
    const dailyUsage = await prisma.$queryRaw<
      { date: string; model: string; total_tokens: bigint; total_cost: number; request_count: bigint }[]
    >`
      SELECT 
        DATE(created_at) as date,
        model,
        SUM(total_tokens) as total_tokens,
        SUM(cost) as total_cost,
        COUNT(*) as request_count
      FROM ai_usage_logs
      GROUP BY DATE(created_at), model
      ORDER BY date DESC
      LIMIT 30
    `;

    return NextResponse.json({
      stats: {
        tokensToday: tokensToday._sum.totalTokens || 0,
        costMonth: costMonth._sum.cost || 0,
        totalRequests,
        avgTokensPerRequest,
      },
      dailyUsage: dailyUsage.map((row) => ({
        date: row.date,
        model: row.model,
        totalTokens: Number(row.total_tokens),
        totalCost: Number(row.total_cost),
        requestCount: Number(row.request_count),
      })),
      recentLogs: recentLogs.map((log: { id: string; user: { name: string; email: string }; model: string; promptTokens: number; completionTokens: number; totalTokens: number; cost: number; createdAt: Date }) => ({
        id: log.id,
        userName: log.user.name,
        userEmail: log.user.email,
        model: log.model,
        promptTokens: log.promptTokens,
        completionTokens: log.completionTokens,
        totalTokens: log.totalTokens,
        cost: log.cost,
        createdAt: log.createdAt,
      })),
    });
  } catch (error) {
    console.error("[AI Usage API] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch AI usage data" },
      { status: 500 }
    );
  }
}
