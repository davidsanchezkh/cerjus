import { HttpContextToken } from '@angular/common/http';

export const SUPPRESS_401_DIALOG = new HttpContextToken<boolean>(() => false);