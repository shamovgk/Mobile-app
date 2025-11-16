import { IsString, IsUUID } from 'class-validator';

export class PackIdDto {
  @IsUUID()
  packId: string;
}
