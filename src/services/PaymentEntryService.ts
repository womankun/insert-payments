import { v4 as uuidv4 } from 'uuid';
import type { Connection } from 'mysql2/promise';

export class PaymentEntryService {
  private payment_id: string;
  private amount: string;
  private status: 'authorised' | 'captured' | 'voided' | 'refunded';
  private card_number: string;
  private card_expiry: string;
  private created_at: Date;
  private captured_at?: Date;
  private voided_at?: Date;
  private refunded_at?: Date;
  private brand: string;

  constructor(private readonly db: Connection) {
    this.amount = (Math.floor(Math.random() * 900) + 100).toFixed(2);

    const statuses = ['authorised', 'captured', 'voided', 'refunded'] as const;
    this.status = this.randomChoice(statuses);

    // カードブランドと番号のマッピング
    const cardBrandMap: Record<string, string[]> = {
      VISA: ['4100000000000100', '4100000000600008'],
      MASTER: ['5100000000000107', '5100000000600005'],
      JCB: ['3528000000000106', '3528000000600004'],
      AMEX: ['340000000000009', '340000000600006'],
      DINERS: ['36000000000008', '36000000005007'],
    };

    // ブランドとカード番号をセットで選択
    const brandOptions = Object.keys(cardBrandMap);
    this.brand = this.randomChoice(brandOptions);
    const cardNumbers = cardBrandMap[this.brand];
    this.card_number = this.randomChoice(cardNumbers!);

    const now = new Date();
    console.log(now)
    console.log(Intl.DateTimeFormat().resolvedOptions().timeZone)
    const futureYear = now.getFullYear() + Math.floor(Math.random() * 2) + 1;
    const futureMonth = Math.floor(Math.random() * 12) + 1;

    const mm = futureMonth.toString().padStart(2, '0');
    const yy = (futureYear % 100).toString().padStart(2, '0');

    this.card_expiry = `${mm}${yy}`; // 例: "0927"

    // payment_id と created_at
    this.payment_id = uuidv4();
    this.created_at = now;

    // ステータスに応じた ○○_at のセット
    if (this.status === 'captured') this.captured_at = now;
    if (this.status === 'voided') this.voided_at = now;
    if (this.status === 'refunded') this.refunded_at = now;
  }

  private randomChoice<T>(arr: readonly T[]): T {
    const result = arr[Math.floor(Math.random() * arr.length)];
    if (result === undefined) throw new Error('未定義です。');
    return result;
  }

  public async insertPayment(): Promise<string> {
    await this.db.execute(
    `INSERT INTO payments (
      payment_id,
      amount,
      status,
      card_number,
      card_expiry,
      created_at,
      captured_at,
      voided_at,
      refunded_at,
      brand
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      this.payment_id,
      this.amount,
      this.status,
      this.card_number,
      this.card_expiry,
      this.created_at,
      this.captured_at ?? null,
      this.voided_at ?? null,
      this.refunded_at ?? null,
      this.brand
    ]
  );

    return this.payment_id;
  }
}
