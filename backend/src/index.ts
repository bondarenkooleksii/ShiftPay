import { createApp } from './app';
import { config } from './config';

createApp().listen(config.port, () => {
  console.log(`ShiftPay API: http://localhost:${config.port}/api`);
});
