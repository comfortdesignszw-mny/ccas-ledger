import { Calendar, Plus } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/data/mockData';

const churchEvents = [
  {
    id: '1',
    name: 'Feast of Passover',
    date: new Date('2025-04-13'),
    expectedPerMember: 5000,
    totalMembers: 150,
    collected: 420000,
    status: 'upcoming',
  },
  {
    id: '2',
    name: 'Pentecost Celebration',
    date: new Date('2025-06-08'),
    expectedPerMember: 3000,
    totalMembers: 150,
    collected: 0,
    status: 'upcoming',
  },
  {
    id: '3',
    name: 'Feast of Booths',
    date: new Date('2025-10-13'),
    expectedPerMember: 10000,
    totalMembers: 150,
    collected: 0,
    status: 'upcoming',
  },
  {
    id: '4',
    name: '10 Days Feast',
    date: new Date('2024-10-03'),
    expectedPerMember: 8000,
    totalMembers: 140,
    collected: 980000,
    status: 'completed',
  },
];

const Events = () => {
  return (
    <AppLayout>
      <Header
        title="Church Events"
        subtitle="Manage events and track contributions"
        showAddButton
        addButtonLabel="Add Event"
      />

      <div className="page-container">
        {/* Upcoming Events */}
        <div className="mb-8">
          <h2 className="mb-4 text-lg font-semibold">Upcoming Events</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {churchEvents
              .filter((e) => e.status === 'upcoming')
              .map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
          </div>
        </div>

        {/* Past Events */}
        <div>
          <h2 className="mb-4 text-lg font-semibold">Past Events</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {churchEvents
              .filter((e) => e.status === 'completed')
              .map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

function EventCard({ event }: { event: (typeof churchEvents)[0] }) {
  const expectedTotal = event.expectedPerMember * event.totalMembers;
  const progress =
    expectedTotal > 0 ? (event.collected / expectedTotal) * 100 : 0;
  const isCompleted = event.status === 'completed';

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base">{event.name}</CardTitle>
            <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              {event.date.toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
          </div>
          <span
            className={`rounded-full px-2 py-1 text-xs font-medium ${
              isCompleted
                ? 'bg-income/10 text-income'
                : 'bg-warning/10 text-warning'
            }`}
          >
            {isCompleted ? 'Completed' : 'Upcoming'}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Per Member</p>
            <p className="font-medium">
              {formatCurrency(event.expectedPerMember)}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Expected Total</p>
            <p className="font-medium">{formatCurrency(expectedTotal)}</p>
          </div>
        </div>

        <div>
          <div className="mb-2 flex justify-between text-sm">
            <span className="text-muted-foreground">Collected</span>
            <span className="font-medium">
              {formatCurrency(event.collected)} ({progress.toFixed(0)}%)
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-income transition-all"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>

        <Button variant="outline" size="sm" className="w-full">
          View Details
        </Button>
      </CardContent>
    </Card>
  );
}

export default Events;
