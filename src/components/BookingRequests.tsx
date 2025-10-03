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
          <Card key={request.id} className="p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                  <h4 className="font-medium text-sm sm:text-base">{request.title}</h4>
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 w-fit text-xs">
                    На рассмотрении
                  </Badge>
                </div>

                <div className="space-y-1 text-xs sm:text-sm text-muted-foreground">
                  <p className="flex items-center gap-2">
                    <Icon name="User" size={14} />
                    <span className="font-medium">{request.requestedBy.name}</span>
                    <span className="text-xs hidden sm:inline">({request.requestedBy.position})</span>
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
                      <Icon name="FileText" size={14} className="mt-0.5 flex-shrink-0" />
                      <span className="break-words">{request.description}</span>
                    </p>
                  )}
                </div>
              </div>

              {isAdmin && (
                <div className="flex gap-2 sm:flex-col sm:gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-green-600 hover:text-green-700 hover:bg-green-50 flex-1 sm:flex-none"
                    onClick={() => onApprove(request.id)}
                  >
                    <Icon name="Check" size={16} className="sm:mr-0" />
                    <span className="ml-1 sm:hidden">Одобрить</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 flex-1 sm:flex-none"
                    onClick={() => onReject(request.id)}
                  >
                    <Icon name="X" size={16} className="sm:mr-0" />
                    <span className="ml-1 sm:hidden">Отклонить</span>
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