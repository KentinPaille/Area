import { TimeData } from 'src/time/time.interface';
import { MailData } from 'src/mailing/mailing.interface';
import { TableNames } from 'src/db/db.interface';

export interface ClientData {
  user_id: string;
  area_id: number;
  area_name: string;
  action: {
    serviceName: TableNames | string | '';
    body: TimeData | MailData | { email: string } | object;
  };
  reaction: {
    serviceName: TableNames | string | '';
    body: TimeData | MailData | { email: string } | object;
  }[];
}
