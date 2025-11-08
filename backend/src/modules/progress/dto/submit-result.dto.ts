import { IsString, IsInt, Min, Max } from 'class-validator';

export class SubmitResultDto {
  @IsString()
  levelId: string;

  @IsInt()
  @Min(0)
  score: number;

  @IsInt()
  @Min(0)
  @Max(3)
  stars: number;

  @IsInt()
  @Min(0)
  correctAnswers: number;

  @IsInt()
  @Min(0)
  wrongAnswers: number;

  @IsInt()
  @Min(1)
  duration: number; // Секунды
}
