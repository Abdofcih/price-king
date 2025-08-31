import { IsOptional, IsString } from 'class-validator';
export class SnapshotDto {
  @IsString() url: string;
  @IsOptional() @IsString() lang?: 'en'|'ar';
}
