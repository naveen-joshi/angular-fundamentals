import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { tap } from 'rxjs';

export const loggingInterceptor: HttpInterceptorFn = (req, next) => {
  const startTime = Date.now();
  console.log(`[🌐 Request] ${req.method} ${req.url}`);

  return next(req).pipe(
    tap({
      next: (event) => {
        if (event instanceof HttpResponse) {
          const endTime = Date.now();
          const duration = endTime - startTime;
          console.log(`[✅ Response] ${req.method} ${req.url}
            Duration: ${duration}ms
            Status: ${event.status}
            Status Text: ${event.statusText}`);
        }
      },
      error: (error) => {
        const endTime = Date.now();
        const duration = endTime - startTime;
        console.error(`[❌ Response Error] ${req.method} ${req.url}
          Duration: ${duration}ms
          Status: ${error.status}
          Message: ${error.message}`);
      }
    })
  );
};
