import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/shared/contexts/AuthContext';
import { Sparkles, Target, BotIcon } from 'lucide-react';

export const WorkerWelcome = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleStart = () => {
    navigate('/worker/setup-profile');
  };

  const handleSkip = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen  flex items-center justify-center py-8 px-4">
      <Card className="max-w-2xl w-full p-8 md:p-12 rounded-2xl shadow-lg border-0">
        <div className="text-center space-y-6">
          {/* Header */}
          <div className="space-y-3">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">
              Chào mừng bạn đến với WorkLink
            </h1>
            <p className="text-xl text-primary font-semibold">
              {user?.fullName || 'Bạn'}
            </p>
          </div>

          {/* Message */}
          <p className="text-muted-foreground text-lg leading-relaxed">
            Hãy bắt đầu bằng cách cung cấp một số thông tin cơ bản để chúng tôi
            có thể giúp bạn:
          </p>

          {/* Benefits */}
          <div className="grid gap-4 text-left my-8">
            <div className="flex items-start gap-4 p-4 rounded-xl bg-blue-50/50 border border-blue-100">
              <div className="shrink-0 mt-1">
                <Sparkles className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">
                  Trải nghiệm tìm việc cá nhân hoá
                </h3>
                <p className="text-sm text-muted-foreground">
                  Nhận được những gợi ý phù hợp với kỹ năng và mong muốn của bạn
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-xl bg-purple-50/50 border border-purple-100">
              <div className="shrink-0 mt-1">
                <Target className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">
                  Gợi ý công việc phù hợp
                </h3>
                <p className="text-sm text-muted-foreground">
                  Tìm kiếm công việc phù hợp với ngành nghề và kinh nghiệm của
                  bạn
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-xl bg-green-50/50 border border-green-100">
              <div className="shrink-0 mt-1">
                <BotIcon className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">
                  Hỗ trợ bởi AI
                </h3>
                <p className="text-sm text-muted-foreground">
                  Công nghệ AI giúp phân tích và đề xuất công việc tốt nhất cho
                  bạn
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <Button
              onClick={handleStart}
              className="flex-1 rounded-xl h-12 text-base font-semibold"
              size="lg"
            >
              Bắt đầu
            </Button>
            <Button
              onClick={handleSkip}
              variant="outline"
              className="sm:w-auto rounded-xl h-12 px-6 text-base"
              size="lg"
            >
              Tôi sẽ hoàn thiện sau
            </Button>
          </div>

          <p className="text-xs text-muted-foreground mt-4">
            Bạn có thể cập nhật thông tin này bất cứ lúc nào trong phần Hồ sơ
          </p>
        </div>
      </Card>
    </div>
  );
};
