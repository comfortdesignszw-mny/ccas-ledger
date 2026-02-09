import { useState } from 'react';
import { Calendar } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useChurchSettings } from '@/contexts/ChurchSettingsContext';
import { useAuth } from '@/hooks/useAuth';
import { AuthForm } from '@/components/auth/AuthForm';
import { EventDialog } from '@/components/events/EventDialog';
import { useEvents } from '@/hooks/useEvents';

const Events = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { formatCurrency } = useChurchSettings();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { data: churchEvents = [], isLoading } = useEvents();

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthForm />;
  }

  return (
    <AppLayout>
      <Header
        title="Church Events"
        subtitle="Manage events and track contributions"
        showAddButton
        addButtonLabel="Add Event"
        onAddClick={() => setDialogOpen(true)}
      />

      <div className="page-container">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : churchEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Calendar className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Events Yet</h3>
            <p className="text-muted-foreground text-center max-w-md">
              Church events will appear here. Click "Add Event" to create your first event
              and start tracking contributions.
            </p>
          </div>
        ) : (
          <>
            {/* Upcoming Events */}
            {churchEvents.filter((e) => e.status === 'upcoming').length > 0 && (
              <div className="mb-8">
                <h2 className="mb-4 text-lg font-semibold">Upcoming Events</h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {churchEvents
                    .filter((e) => e.status === 'upcoming')
                    .map((event) => (
                      <EventCard key={event.id} event={event} formatCurrency={formatCurrency} />
                    ))}
                </div>
              </div>
            )}

            {/* Completed Events */}
            {churchEvents.filter((e) => e.status === 'completed').length > 0 && (
              <div>
                <h2 className="mb-4 text-lg font-semibold">Past Events</h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {churchEvents
                    .filter((e) => e.status === 'completed')
                    .map((event) => (
                      <EventCard key={event.id} event={event} formatCurrency={formatCurrency} />
                    ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <EventDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </AppLayout>
  );
};

function EventCard({ event, formatCurrency }: { event: any; formatCurrency: (amount: number) => string }) {
  const expectedTotal = Number(event.expected_per_member) * Number(event.total_members);
  const progress = expectedTotal > 0 ? (Number(event.collected) / expectedTotal) * 100 : 0;
  const isCompleted = event.status === 'completed';

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base">{event.name}</CardTitle>
            <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              {new Date(event.event_date).toLocaleDateString('en-US', {
                month: 'long', day: 'numeric', year: 'numeric',
              })}
            </p>
          </div>
          <span className={`rounded-full px-2 py-1 text-xs font-medium ${
            isCompleted ? 'bg-income/10 text-income' : 'bg-warning/10 text-warning'
          }`}>
            {isCompleted ? 'Completed' : 'Upcoming'}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Per Member</p>
            <p className="font-medium">{formatCurrency(Number(event.expected_per_member))}</p>
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
              {formatCurrency(Number(event.collected))} ({progress.toFixed(0)}%)
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-income transition-all" style={{ width: `${Math.min(progress, 100)}%` }} />
          </div>
        </div>
        <Button variant="outline" size="sm" className="w-full">View Details</Button>
      </CardContent>
    </Card>
  );
}

export default Events;
