import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MSG } from '@/shared/constants/messages';

export const JobActionSidebar = ({
  isGuest,
  hasApplied,
  isWorker,
  onApply,
  onReport,
}) => {
  return (
    <div className="sticky top-24 space-y-3">
      <Card className="p-6 rounded-xl shadow-sm border-0">
        {hasApplied ? (
          <Button className="w-full rounded-xl" disabled>
            Đã ứng tuyển
          </Button>
        ) : (
          <Button className="w-full rounded-xl" onClick={onApply}>
            Ứng tuyển ngay
          </Button>
        )}

        {isWorker && !hasApplied && (
          <>
            <Button
              variant="outline"
              className="w-full mt-2 rounded-xl"
              onClick={() => {}}
            >
              Thêm vào Wishlist
            </Button>
            <Button
              variant="outline"
              className="w-full mt-2 rounded-xl"
              onClick={onReport}
            >
              Báo cáo
            </Button>
          </>
        )}

        {hasApplied && (
          <p className="text-sm text-muted-foreground mt-2">
            {MSG.MSG_JOB_ALREADY_APPLIED}
          </p>
        )}
      </Card>
    </div>
  );
};
