import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { getTermsCondition } from '@/features/terms/api/termsApi';
import { Skeleton } from '@/components/ui/skeleton';

export const TermsPage = () => {
  const [terms, setTerms] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTerms = async () => {
      try {
        setIsLoading(true);
        const data = await getTermsCondition();
        // Lấy phần tử đầu tiên nếu data là một mảng
        const termsData = Array.isArray(data) ? data[0] : data;
        setTerms(termsData);
      } catch (err) {
        console.error('Failed to fetch terms:', err);
        setError('Không thể tải điều khoản và điều kiện. Vui lòng thử lại sau.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTerms();
  }, []);

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Skeleton className="h-10 w-64 mb-2" />
        <Skeleton className="h-4 w-48 mb-8" />
        <Card className="p-6 rounded-xl shadow-sm border-0">
          <Skeleton className="h-6 w-48 mb-4" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto text-center py-12">
        <p className="text-destructive font-medium">{error}</p>
      </div>
    );
  }

  if (!terms) {
    return (
      <div className="max-w-3xl mx-auto text-center py-12">
        <p className="text-muted-foreground">Chưa có nội dung điều khoản.</p>
      </div>
    );
  }

  const lastUpdated = terms.updatedAt || terms.effectiveAt || terms.createdAt;

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">{terms.title || 'Điều khoản & điều kiện'}</h1>
      {lastUpdated && (
        <p className="text-sm text-muted-foreground mb-8">
          Cập nhật lần cuối: {new Date(lastUpdated).toLocaleDateString('vi-VN')}
        </p>
      )}
      <div className="space-y-6">
        <Card className="p-8 rounded-2xl shadow-sm border-0 bg-white">
          <div className="prose prose-slate max-w-none">
            <div className="whitespace-pre-wrap text-muted-foreground leading-relaxed text-lg">
              {terms.content}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
