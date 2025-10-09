/// <reference types="@angular/localize" />

import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

bootstrapApplication(App,appConfig)
.then(() => document.body.classList.remove('preboot'))
.catch(err => console.error(err));