import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form';
import {
  Popover, PopoverContent, PopoverTrigger,
} from '@/components/ui/popover';
import { useCreateEvent } from '@/hooks/useEvents';
import { cn } from '@/lib/utils';

const eventSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  description: z.string().max(500).optional(),
  event_date: z.date({ required_error: 'Please select a date' }),
  expected_per_member: z.coerce.number().min(0, 'Must be 0 or more'),
  total_members: z.coerce.number().int().min(0, 'Must be 0 or more'),
});

type EventFormData = z.infer<typeof eventSchema>;

interface EventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EventDialog({ open, onOpenChange }: EventDialogProps) {
  const createEvent = useCreateEvent();
  const form = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      name: '',
      description: '',
      expected_per_member: 0,
      total_members: 0,
    },
  });

  const onSubmit = async (data: EventFormData) => {
    await createEvent.mutateAsync({
      name: data.name,
      description: data.description,
      event_date: format(data.event_date, 'yyyy-MM-dd'),
      expected_per_member: data.expected_per_member,
      total_members: data.total_members,
    });
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Event</DialogTitle>
          <DialogDescription>Create a church event and track contributions.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem>
                <FormLabel>Event Name</FormLabel>
                <FormControl><Input placeholder="Enter event name" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem>
                <FormLabel>Description (optional)</FormLabel>
                <FormControl><Textarea placeholder="Describe the event" className="resize-none" rows={2} {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="event_date" render={({ field }) => (
              <FormItem>
                <FormLabel>Event Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button variant="outline" className={cn('w-full justify-start text-left font-normal', !field.value && 'text-muted-foreground')}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )} />

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="expected_per_member" render={({ field }) => (
                <FormItem>
                  <FormLabel>Expected Per Member</FormLabel>
                  <FormControl><Input type="number" placeholder="0" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="total_members" render={({ field }) => (
                <FormItem>
                  <FormLabel>Total Members</FormLabel>
                  <FormControl><Input type="number" placeholder="0" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" className="flex-1" disabled={createEvent.isPending}>
                {createEvent.isPending ? 'Creating...' : 'Create Event'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
