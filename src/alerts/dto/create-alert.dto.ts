import { IsUUID, IsNumber, Min } from 'class-validator';
export class CreateAlertDto {
  @IsUUID() productId: string;
  @IsNumber() @Min(0) targetPrice: number;
}
