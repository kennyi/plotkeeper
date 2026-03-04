import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MONTH_NAMES } from "@/lib/constants";

function currentMonth() {
  return new Date().getMonth() + 1;
}

export default function DashboardPage() {
  const month = currentMonth();
  const monthName = MONTH_NAMES[month - 1];

  return (
    <div>
      <Header
        title={`Good day, Ian`}
        description={`${monthName} in Kildare — here's what's happening in your garden`}
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium text-muted-foreground">This month</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{monthName}</p>
            <p className="text-sm text-muted-foreground">Check the calendar for what to sow</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium text-muted-foreground">Plant library</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Browse vegetables, flowers, and herbs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium text-muted-foreground">Kildare conditions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">Last frost: ~April 20</p>
            <p className="text-sm">First frost: ~October 30</p>
            <p className="text-sm">Zone: H4–H5 (RHS)</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 p-4 rounded-lg bg-garden-50 border border-garden-200">
        <p className="text-garden-800 font-medium text-sm">Getting started</p>
        <ul className="mt-2 space-y-1 text-sm text-garden-700">
          <li>1. Set up your Supabase project and add env variables</li>
          <li>2. Run the database migrations in <code>/supabase/migrations/</code></li>
          <li>3. Seed the plant database with the seed SQL files</li>
          <li>4. Browse your plant library and planting calendar</li>
        </ul>
      </div>
    </div>
  );
}
