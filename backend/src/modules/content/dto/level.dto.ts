import { IsString, IsNotEmpty, Length } from 'class-validator';

export class LevelParamDto {
  @IsString()
  @IsNotEmpty()
  @Length(25, 25)
  levelId: string;
}

export class PackParamDto {
  @IsString()
  @IsNotEmpty()
  @Length(25, 25)
  packId: string;
}
