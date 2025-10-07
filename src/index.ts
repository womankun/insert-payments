import { DatabaseClient } from './infra/DatabaseClient.js';
import { PaymentEntryService } from './services/PaymentEntryService.js';

const main = async () => {
  const dbClient = new DatabaseClient();
  const connection = await dbClient.connect();

  for (let i = 0; i < 50; i++) {
    const paymentService = new PaymentEntryService(connection);
    const paymentId = await paymentService.insertPayment();
    console.log('登録された payment_id:', paymentId);
  }

  await dbClient.disconnect();
};

main();
