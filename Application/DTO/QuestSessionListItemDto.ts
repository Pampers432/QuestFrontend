export interface QuestSessionListItemDto {
  id: string;
  questTitle: string;
  accessCode: string;
  startsAt: string;
  endsAt: string | null;
  isActive: boolean;
  participantCount: number;
}
