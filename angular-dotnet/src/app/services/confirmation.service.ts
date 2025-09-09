import { Injectable, signal } from '@angular/core';
import { ConfirmationModalData } from '../components/confirmation-modal/confirmation-modal.component';

@Injectable({
  providedIn: 'root'
})
export class ConfirmationService {
  private isOpenSignal = signal<boolean>(false);
  private dataSignal = signal<ConfirmationModalData | null>(null);
  private loadingSignal = signal<boolean>(false);
  private resolveSignal = signal<((confirmed: boolean) => void) | null>(null);

  // Public readonly signals
  public readonly isOpen = this.isOpenSignal.asReadonly();
  public readonly data = this.dataSignal.asReadonly();
  public readonly loading = this.loadingSignal.asReadonly();

  /**
   * Show confirmation modal and return a promise that resolves to true if confirmed, false if cancelled
   */
  confirm(data: ConfirmationModalData): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      this.dataSignal.set(data);
      this.isOpenSignal.set(true);
      this.loadingSignal.set(false);
      this.resolveSignal.set(resolve);
    });
  }

  /**
   * Confirm the action
   */
  onConfirm(): void {
    const resolve = this.resolveSignal();
    if (resolve) {
      resolve(true);
    }
    this.close();
  }

  /**
   * Cancel the action
   */
  onCancel(): void {
    const resolve = this.resolveSignal();
    if (resolve) {
      resolve(false);
    }
    this.close();
  }

  /**
   * Set loading state
   */
  setLoading(loading: boolean): void {
    this.loadingSignal.set(loading);
  }

  /**
   * Close the modal
   */
  private close(): void {
    this.isOpenSignal.set(false);
    this.dataSignal.set(null);
    this.loadingSignal.set(false);
    this.resolveSignal.set(null);
  }

  /**
   * Convenience method for delete confirmation
   */
  confirmDelete(itemName: string, itemType: string = 'item'): Promise<boolean> {
    return this.confirm({
      title: `Delete ${itemType}`,
      message: `Are you sure you want to delete "${itemName}"? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger'
    });
  }

  /**
   * Convenience method for task deletion
   */
  confirmTaskDelete(taskTitle: string): Promise<boolean> {
    return this.confirmDelete(taskTitle, 'task');
  }
}
