import { BookingRequest, Person } from '@/types/schedule';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface BookingRequestsProps {
  requests: BookingRequest[];
  onApprove: (requestId: string) => void;
  onReject: (requestId: string) => void;
  currentUser: Person;
  isAdmin: boolean;
}

export default function BookingRequests({
  requests,
  onApprove,
  onReject,
  currentUser,
  isAdmin,
}: BookingRequestsProps) {
  const pendingRequests = requests.filter((r) => r.status === 'pending');

  if (pendingRequests.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Icon name="Clock" size={20} />
        Заявки на бронирование ({pendingRequests.length})
      </h3>

      <div className="space-y-3">
        {pendingRequests.map((request) => (
          <Card key={request.id} className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-medium">{request.title}</h4>
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                    На рассмотрении
                  </Badge>
                </div>

                <div className="space-y-1 text-sm text-muted-foreground">
                  <p className="flex items-center gap-2">
                    <Icon name="User" size={14} />
                    <span className="font-medium">{request.requestedBy.name}</span>
                    <span className="text-xs">({request.requestedBy.position})</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Icon name="Calendar" size={14} />
                    {new Date(request.date).toLocaleDateString('ru-RU', {
                      day: 'numeric',
                      month: 'long',
                    })}
                    {' • '}
                    {request.time} - {request.endTime}
                  </p>
                  {request.description && (
                    <p className="flex items-start gap-2 mt-2">
                      <Icon name="FileText" size={14} className="mt-0.5" />
                      {request.description}
                    </p>
                  )}
                </div>
              </div>

              {isAdmin && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-green-600 hover:text-green-700 hover:bg-green-50"
                    onClick={() => onApprove(request.id)}
                  >
                    <Icon name="Check" size={16} />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => onReject(request.id)}
                  >
                    <Icon name="X" size={16} />
                  </Button>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
