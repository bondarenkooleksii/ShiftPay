import type { ApiError } from '@/shared/api/client';
import page from '@/shared/styles/page.module.css';

interface QueryStateProps {
  isLoading: boolean;
  error: ApiError | null;
  onRetry?: () => void;
}

export default function QueryState({ isLoading, error, onRetry }: QueryStateProps) {
  if (isLoading) {
    return (
      <div className={page.queryState} role="status">
        <span className={page.loader} aria-hidden="true" />
        <span>Завантаження даних…</span>
      </div>
    );
  }
  if (error) {
    return (
      <div className={page.queryState} role="alert">
        <span className={page.errorText}>{error.message}</span>
        {onRetry && (
          <button type="button" className={page.secondaryBtn} onClick={onRetry}>
            Спробувати ще раз
          </button>
        )}
      </div>
    );
  }
  return null;
}
