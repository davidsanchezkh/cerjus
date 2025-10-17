export type OkVariant = 'success' | 'info' | 'warning' | 'error';

export interface OkDialogOptions {
  title: string;
  message: string;
  variant?: OkVariant;
  primaryText?: string;     
}

export interface LoadingState {
  visible: boolean;
  message: string; 
}
export interface ConfirmDialogOptions {
  title: string;
  message: string;
  variant?: OkVariant;
  confirmText?: string;
  cancelText?: string;
}