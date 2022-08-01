import { IsInt } from 'class-validator';

export class IdParameterDTO {
  @IsInt()
  id: number;
}
