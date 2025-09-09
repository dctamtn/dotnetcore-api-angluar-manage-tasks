import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

@Injectable()
export class LoadingInterceptor implements HttpInterceptor {
  private activeRequests = 0;

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    this.activeRequests++;
    
    // You can emit loading state changes here if needed
    // For example, using a global loading service
    
    return next.handle(req).pipe(
      finalize(() => {
        this.activeRequests--;
        
        // Emit loading state changes when all requests are complete
        // if (this.activeRequests === 0) {
        //   // Hide global loading indicator
        // }
      })
    );
  }
}
